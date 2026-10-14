import { envConfigs } from '@/config';

export class HiggsfieldPreflightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HiggsfieldPreflightError';
  }
}

export class HiggsfieldHttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = 'HiggsfieldHttpError';
  }
}

export function getHiggsfieldApiKey() {
  const value = envConfigs.higgsfield_api_key?.trim();
  if (!value) {
    throw new HiggsfieldPreflightError(
      'Higgsfield API key is not configured. Set HF_API_KEY on the server.'
    );
  }
  return value;
}

export function getHiggsfieldApiBaseUrl() {
  return (
    envConfigs.higgsfield_api_base_url?.trim() || 'https://api.higgsfield.ai'
  ).replace(/\/$/, '');
}

async function readProviderJson(response: Response) {
  const payload = await response.json().catch(() => null);
  if (response.ok) return payload;

  const message =
    payload?.detail?.message ||
    payload?.detail ||
    payload?.message ||
    payload?.error ||
    `Higgsfield request failed with HTTP ${response.status}`;
  throw new HiggsfieldHttpError(
    response.status,
    typeof message === 'string' ? message : JSON.stringify(message),
    payload
  );
}

/** Shared Higgsfield HTTP client (Genjutsu motion + Seedance 2.5). */
export async function higgsfieldProviderFetch(
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${getHiggsfieldApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Key ${getHiggsfieldApiKey()}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  return readProviderJson(response);
}

export async function getHiggsfieldStatus(requestId: string) {
  const normalized = requestId.trim();
  if (!/^[A-Za-z0-9._:-]{6,200}$/.test(normalized)) {
    throw new Error('Invalid request ID');
  }

  const payload = await higgsfieldProviderFetch(
    `/requests/${encodeURIComponent(normalized)}/status`
  );

  const providerStatus =
    typeof payload?.status === 'string'
      ? payload.status.toLowerCase()
      : 'processing';

  const videoUrl =
    typeof payload?.video?.url === 'string'
      ? payload.video.url
      : typeof payload?.video_url === 'string'
        ? payload.video_url
        : typeof payload?.output?.video?.url === 'string'
          ? payload.output.video.url
          : null;

  if (providerStatus === 'completed') {
    if (!videoUrl) {
      throw new Error('Higgsfield completed the request without a video URL');
    }
    return {
      status: 'completed' as const,
      providerStatus,
      videoUrl,
    };
  }

  if (
    providerStatus === 'failed' ||
    providerStatus === 'nsfw' ||
    providerStatus === 'canceled' ||
    providerStatus === 'cancelled'
  ) {
    const message =
      payload?.error?.message ||
      payload?.error ||
      payload?.message ||
      (providerStatus === 'nsfw'
        ? 'Generation was blocked by the provider safety check'
        : `Generation ended with status: ${providerStatus}`);

    return {
      status: 'failed' as const,
      providerStatus,
      videoUrl: null,
      error: typeof message === 'string' ? message : JSON.stringify(message),
    };
  }

  return {
    status: 'processing' as const,
    providerStatus,
    videoUrl: null,
  };
}
