import { envConfigs } from '@/config';
import { getConfig } from '@/modules/config/service';

import {
  createGenjutsuE2ERequestId,
  isGenjutsuE2EMockEnabled,
} from './e2e-mock';
import { estimateSeedanceProviderCost } from './seedance';
import type { GenjutsuMode, GenjutsuResolution } from './types';
import { buildSeedanceWorkflowPrompt } from './workflow';

const DEFAULT_SEEAPI_API_BASE_URL = 'https://api.seeapi.com';
const DEFAULT_SEEAPI_MODEL = 'seedance-2-5';
const DEFAULT_SEEAPI_ENDPOINT = 'reference-to-video';
const DEFAULT_SEEAPI_UPSTREAM_PROVIDER = 'seeapi';
/** SeeAPI public USD estimate per credit (docs, not an extra charge). */
const DEFAULT_SEEAPI_USD_PER_CREDIT = 0.0037;

/**
 * Seedance 2.5 reference-to-video rates when a video reference is present
 * (credits / second of billed duration = source + output).
 * Source: https://www.seeapi.com/docs/seedance-2-5/reference-to-video/
 */
const SEEAPI_VIDEO_REF_CREDITS_PER_SECOND: Record<GenjutsuResolution, number> =
  {
    '480p': 20,
    '720p': 45,
    '1080p': 110,
  };

export class SeeapiSeedanceHttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = 'SeeapiSeedanceHttpError';
  }
}

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function getSeeapiApiKey() {
  const value =
    (await getConfig('seeapi_api_key'))?.trim() ||
    envConfigs.seeapi_api_key?.trim();
  if (!value) {
    throw new SeeapiSeedanceHttpError(
      503,
      'SeeAPI key is not configured. Set SEEAPI_API_KEY or Admin → Settings → AI → SeeAPI.',
      'SEEAPI_NOT_CONFIGURED'
    );
  }
  return value;
}

function getSeeapiApiBaseUrl() {
  const value = (
    envConfigs.seeapi_api_base_url?.trim() || DEFAULT_SEEAPI_API_BASE_URL
  ).replace(/\/$/, '');
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') throw new Error('HTTPS required');
    return value;
  } catch {
    throw new SeeapiSeedanceHttpError(
      503,
      'SeeAPI base URL is invalid.',
      'SEEAPI_INVALID_BASE_URL'
    );
  }
}

function normalizeModel(model: string) {
  const value = model.trim();
  if (!value || !/^[A-Za-z0-9._-]+$/.test(value)) {
    throw new SeeapiSeedanceHttpError(
      503,
      'Invalid SeeAPI Seedance model configuration.',
      'SEEAPI_INVALID_MODEL'
    );
  }
  return value;
}

function seeapiErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, any>;
  const generation = record.generation;
  const candidates = [
    record.error?.message,
    record.error,
    record.message,
    record.detail?.message,
    record.detail,
    generation?.error?.message,
    generation?.error,
    generation?.failure?.message,
    generation?.failure,
    generation?.message,
  ];
  const message = candidates.find(
    (value) => typeof value === 'string' && value.trim()
  );
  return typeof message === 'string' ? message : fallback;
}

function seeapiErrorCode(payload: unknown) {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, any>;
  const code =
    record.error?.code ??
    record.code ??
    record.generation?.error?.code ??
    record.generation?.failure?.code;
  return typeof code === 'string' && code.trim() ? code : undefined;
}

async function seeapiFetch(
  path: string,
  init?: RequestInit & { idempotencyKey?: string }
): Promise<any> {
  const apiKey = await getSeeapiApiKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.idempotencyKey) {
    headers['Idempotency-Key'] = init.idempotencyKey;
  }

  const response = await fetch(
    `${getSeeapiApiBaseUrl()}/${path.replace(/^\/+/, '')}`,
    {
      ...init,
      headers,
    }
  );

  const payload = await response.json().catch(() => null);
  if (response.ok || response.status === 202) return payload;

  throw new SeeapiSeedanceHttpError(
    response.status,
    seeapiErrorMessage(
      payload,
      `SeeAPI request failed with HTTP ${response.status}`
    ),
    seeapiErrorCode(payload),
    payload
  );
}

function getWebhookUrl() {
  const appUrl = envConfigs.app_url?.trim();
  if (!appUrl || !appUrl.startsWith('https://')) return null;
  try {
    return new URL('/api/genjutsu/webhook', appUrl).toString();
  } catch {
    return null;
  }
}

function assertSourceDurationSeconds(value: number) {
  if (!Number.isFinite(value) || value < 4 || value > 30) {
    throw new Error('Seedance source video must be between 4 and 30 seconds');
  }
}

export async function assertSeeapiSeedanceConfigured(model?: string) {
  await getSeeapiApiKey();
  getSeeapiApiBaseUrl();
  normalizeModel(
    model || envConfigs.seedance_seeapi_model?.trim() || DEFAULT_SEEAPI_MODEL
  );
}

function estimatedOutputDurationSeconds(input: {
  mode: GenjutsuMode;
  sourceDurationSeconds: number;
}) {
  // Editing locks output duration to the source. Reference generation is
  // requested at source length so Motion Transfer preserves timing.
  return Math.min(30, Math.max(4, input.sourceDurationSeconds));
}

function getUsdPerCredit() {
  return positiveNumber(
    envConfigs.seedance_seeapi_usd_per_credit,
    DEFAULT_SEEAPI_USD_PER_CREDIT
  );
}

export function estimateSeeapiSeedanceProviderCost(input: {
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  sourceDurationSeconds: number;
  usdPerCredit?: number;
}) {
  assertSourceDurationSeconds(input.sourceDurationSeconds);

  const outputSeconds = estimatedOutputDurationSeconds(input);
  const billedSeconds = input.sourceDurationSeconds + outputSeconds;
  const creditsPerSecond =
    SEEAPI_VIDEO_REF_CREDITS_PER_SECOND[input.resolution];
  const estimatedCredits = billedSeconds * creditsPerSecond;
  const usdPerCredit = input.usdPerCredit ?? getUsdPerCredit();
  const providerCostUsd = estimatedCredits * usdPerCredit;

  // Keep customer-facing quotes on the existing Seedance list rate during A/B.
  const customerQuote = estimateSeedanceProviderCost({
    resolution: input.resolution,
    sourceDurationSeconds: input.sourceDurationSeconds,
  });

  return {
    providerCostUsd,
    customerPriceBasisUsd: customerQuote.providerCostUsd,
    providerCredits: null,
    source: 'seeapi_seedance_estimate' as const,
    payload: {
      source: 'seeapi_seedance_estimate',
      pricingVersion: 'seeapi-seedance-2.5-video-ref-2026-10',
      sourceDurationSeconds: input.sourceDurationSeconds,
      estimatedOutputDurationSeconds: outputSeconds,
      billedSeconds,
      resolution: input.resolution,
      creditsPerSecond,
      estimatedCredits,
      usdPerCredit,
      customerPriceBasisUsd: customerQuote.providerCostUsd,
    },
  };
}

export function buildSeeapiSeedancePayload(input: {
  model: string;
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
  callbackUrl: string | null;
  upstreamProvider?: string;
}) {
  assertSourceDurationSeconds(input.sourceDurationSeconds);
  if (
    !Array.isArray(input.imageUrls) ||
    input.imageUrls.length < 1 ||
    input.imageUrls.length > 8
  ) {
    throw new Error('Provide between 1 and 8 reference images');
  }

  const isEdit = input.mode === 'objects-swap';
  const prompt = buildSeedanceWorkflowPrompt({
    mode: input.mode,
    userPrompt: input.prompt,
    imageCount: input.imageUrls.length,
  });

  // Video editing on SeeAPI requires adaptive + duration_seconds=-1.
  // Ordinary reference generation uses a clamped source-length duration.
  const durationSeconds = isEdit
    ? -1
    : Math.min(30, Math.max(4, Math.round(input.sourceDurationSeconds)));

  const nsfwChecker = envConfigs.seedance_seeapi_nsfw_checker !== 'false';
  const upstream =
    input.upstreamProvider?.trim() ||
    envConfigs.seedance_seeapi_upstream_provider?.trim() ||
    DEFAULT_SEEAPI_UPSTREAM_PROVIDER;

  return {
    model: normalizeModel(input.model || DEFAULT_SEEAPI_MODEL),
    endpoint: DEFAULT_SEEAPI_ENDPOINT,
    provider: upstream,
    input: {
      prompt,
      reference_images: input.imageUrls,
      reference_video: [input.videoUrl],
      aspect_ratio: 'adaptive' as const,
      duration_seconds: durationSeconds,
      resolution: input.resolution,
      generate_audio: envConfigs.seedance_genjutsu_generate_audio !== 'false',
      output_format: 'mp4' as const,
      return_last_frame: false,
      nsfw_checker: nsfwChecker,
    },
    ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
  };
}

function extractVideoUrl(generation: Record<string, any> | null | undefined) {
  const assets = generation?.result?.assets;
  if (!Array.isArray(assets)) return null;

  for (const asset of assets) {
    if (!asset || typeof asset !== 'object') continue;
    const url = (asset as { url?: unknown }).url;
    if (typeof url !== 'string' || !url.trim()) continue;
    const type = (asset as { type?: unknown }).type;
    const mime = (asset as { mime_type?: unknown }).mime_type;
    if (type === 'video') return url;
    if (typeof mime === 'string' && mime.startsWith('video/')) return url;
  }

  for (const asset of assets) {
    const url = asset && typeof asset === 'object' ? (asset as any).url : null;
    if (typeof url === 'string' && url.trim()) return url;
  }

  return null;
}

export function normalizeSeeapiSeedanceTask(payload: any) {
  const generation =
    payload?.generation && typeof payload.generation === 'object'
      ? payload.generation
      : payload;
  const providerStatus =
    typeof generation?.status === 'string'
      ? generation.status.toLowerCase()
      : 'processing';

  const consumedCredits = Number(generation?.consumed_credits);
  const providerUsage =
    Number.isFinite(consumedCredits) && consumedCredits >= 0
      ? {
          consumedCredits,
          usdPerCredit: getUsdPerCredit(),
          actualProviderCostUsd: consumedCredits * getUsdPerCredit(),
        }
      : undefined;

  if (providerStatus === 'succeeded') {
    const videoUrl = extractVideoUrl(generation);
    if (!videoUrl) {
      return {
        status: 'failed' as const,
        providerStatus: 'failed',
        videoUrl: null,
        error: 'SeeAPI completed the request without a video URL',
        providerUsage,
      };
    }
    return {
      status: 'completed' as const,
      providerStatus,
      videoUrl,
      providerUsage,
    };
  }

  if (
    providerStatus === 'failed' ||
    providerStatus === 'expired' ||
    providerStatus === 'cancelled' ||
    providerStatus === 'canceled' ||
    providerStatus === 'refunded'
  ) {
    return {
      status: 'failed' as const,
      providerStatus,
      videoUrl: null,
      error: seeapiErrorMessage(
        payload,
        `Generation ended with status: ${providerStatus}`
      ),
      errorCode: seeapiErrorCode(payload),
      providerUsage,
    };
  }

  return {
    status: 'processing' as const,
    providerStatus,
    videoUrl: null,
    providerUsage,
  };
}

export async function submitSeeapiSeedance(input: {
  model: string;
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
  endUserId: string;
}) {
  const body = buildSeeapiSeedancePayload({
    ...input,
    callbackUrl: getWebhookUrl(),
  });

  if (isGenjutsuE2EMockEnabled()) {
    return {
      requestId: createGenjutsuE2ERequestId(),
      status: 'queued',
    };
  }

  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `seeapi-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const payload = await seeapiFetch('/v1/generations', {
    method: 'POST',
    body: JSON.stringify(body),
    idempotencyKey,
  });

  const requestId = payload?.generation?.id ?? payload?.id;
  if (typeof requestId !== 'string' || !requestId) {
    throw new Error('SeeAPI did not return a generation ID');
  }

  return {
    requestId,
    status:
      typeof payload?.generation?.status === 'string'
        ? payload.generation.status.toLowerCase()
        : typeof payload?.status === 'string'
          ? payload.status.toLowerCase()
          : 'processing',
  };
}

export async function getSeeapiSeedanceStatus(input: { requestId: string }) {
  const requestId = input.requestId.trim();
  if (!/^[A-Za-z0-9._:-]{6,200}$/.test(requestId)) {
    throw new Error('Invalid SeeAPI Seedance task ID');
  }

  const payload = await seeapiFetch(
    `/v1/generations/${encodeURIComponent(requestId)}`,
    { method: 'GET' }
  );
  return normalizeSeeapiSeedanceTask(payload);
}
