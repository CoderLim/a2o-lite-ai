import { envConfigs } from '@/config';

import {
  createGenjutsuE2ERequestId,
  isGenjutsuE2EMockEnabled,
} from './e2e-mock';
import {
  HiggsfieldPreflightError,
  higgsfieldProviderFetch,
} from './higgsfield-client';
import type { GenjutsuMode, GenjutsuResolution } from './types';
import { buildSeedanceWorkflowPrompt } from './workflow';

export const SEEDANCE_HIGGSFIELD_MODEL =
  'bytedance/seedance-2.5/reference-to-video';

export type HiggsfieldSeedanceAspectRatio =
  | '16:9'
  | '4:3'
  | '1:1'
  | '3:4'
  | '9:16'
  | '21:9';

/**
 * Higgsfield Seedance 2.5 reference-to-video token rates (USD / 1k tokens)
 * when a video reference is present. Image/audio refs do not count as video
 * input. Source: open.higgsfield.ai Seedance 2.5 pricing notes (2026-07).
 */
export const HIGGSFIELD_SEEDANCE_VIDEO_REF_USD_PER_1K_TOKENS: Record<
  GenjutsuResolution,
  number
> = {
  '480p': 0.01284,
  '720p': 0.01284,
  '1080p': 0.01404,
};

const SHORT_EDGE_BY_RESOLUTION: Record<GenjutsuResolution, number> = {
  '480p': 480,
  '720p': 720,
  '1080p': 1080,
};

/** Shorter edge equals the resolution tier; longer edge follows aspect. */
export function higgsfieldSeedanceOutputDimensions(
  resolution: GenjutsuResolution,
  aspectRatio: HiggsfieldSeedanceAspectRatio
): { width: number; height: number } {
  const short = SHORT_EDGE_BY_RESOLUTION[resolution];
  const [aw, ah] = aspectRatio.split(':').map(Number) as [number, number];
  if (!aw || !ah) {
    throw new HiggsfieldPreflightError('Invalid Seedance aspect ratio');
  }

  const even = (n: number) => (n % 2 === 0 ? n : n + 1);

  if (aw >= ah) {
    const height = short;
    const width = even(Math.round((height * aw) / ah));
    return { width, height };
  }

  const width = short;
  const height = even(Math.round((width * ah) / aw));
  return { width, height };
}

export function clampHiggsfieldSeedanceDurationSeconds(
  sourceDurationSeconds: number
) {
  if (!Number.isFinite(sourceDurationSeconds) || sourceDurationSeconds <= 0) {
    throw new HiggsfieldPreflightError(
      'Seedance source duration must be a positive number'
    );
  }
  return Math.min(30, Math.max(4, Math.round(sourceDurationSeconds)));
}

/**
 * Billable video tokens = ceil(H × W × (input + output) × 24 / 1024).
 * Both input and generated durations are billable when video_urls are set.
 */
export function estimateHiggsfieldSeedanceTokenCost(input: {
  resolution: GenjutsuResolution;
  aspectRatio: HiggsfieldSeedanceAspectRatio;
  sourceDurationSeconds: number;
  /** Defaults to clamped source duration (API output length). */
  outputDurationSeconds?: number;
}) {
  const outputDurationSeconds =
    input.outputDurationSeconds ??
    clampHiggsfieldSeedanceDurationSeconds(input.sourceDurationSeconds);
  const { width, height } = higgsfieldSeedanceOutputDimensions(
    input.resolution,
    input.aspectRatio
  );
  const billableSeconds = input.sourceDurationSeconds + outputDurationSeconds;
  const tokens = Math.ceil((height * width * billableSeconds * 24) / 1024);
  const rateUsdPer1k =
    HIGGSFIELD_SEEDANCE_VIDEO_REF_USD_PER_1K_TOKENS[input.resolution];
  const providerCostUsd = (tokens / 1000) * rateUsdPer1k;

  return {
    providerCostUsd,
    tokens,
    width,
    height,
    billableSeconds,
    outputDurationSeconds,
    rateUsdPer1k,
  };
}

export function estimateHiggsfieldSeedanceProviderCost(input: {
  resolution: GenjutsuResolution;
  aspectRatio: HiggsfieldSeedanceAspectRatio;
  sourceDurationSeconds: number;
}) {
  const quote = estimateHiggsfieldSeedanceTokenCost(input);
  return {
    providerCostUsd: quote.providerCostUsd,
    providerCredits: null,
    source: 'higgsfield_seedance_token_estimate' as const,
    payload: {
      source: 'higgsfield_seedance_token_estimate',
      pricingVersion: 'higgsfield-seedance-2.5-video-ref-token-2026-07',
      sourceDurationSeconds: input.sourceDurationSeconds,
      estimatedOutputDurationSeconds: quote.outputDurationSeconds,
      billableSeconds: quote.billableSeconds,
      resolution: input.resolution,
      aspectRatio: input.aspectRatio,
      width: quote.width,
      height: quote.height,
      tokens: quote.tokens,
      rateUsdPer1kTokens: quote.rateUsdPer1k,
    },
  };
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
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

export function buildHiggsfieldSeedancePayload(input: {
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  aspectRatio: HiggsfieldSeedanceAspectRatio;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
}) {
  if (
    !Array.isArray(input.imageUrls) ||
    input.imageUrls.length < 1 ||
    input.imageUrls.length > 8 ||
    input.imageUrls.some((url) => !isHttpUrl(url))
  ) {
    throw new HiggsfieldPreflightError(
      'Provide between 1 and 8 valid reference image URLs'
    );
  }
  if (!isHttpUrl(input.videoUrl)) {
    throw new HiggsfieldPreflightError(
      'A valid uploaded video URL is required'
    );
  }

  const duration = clampHiggsfieldSeedanceDurationSeconds(
    input.sourceDurationSeconds
  );
  const generateAudio = envConfigs.seedance_genjutsu_generate_audio !== 'false';

  return {
    prompt: buildSeedanceWorkflowPrompt({
      mode: input.mode,
      userPrompt: input.prompt,
      imageCount: input.imageUrls.length,
    }),
    image_urls: input.imageUrls,
    video_urls: [input.videoUrl],
    resolution: input.resolution,
    duration,
    aspect_ratio: input.aspectRatio,
    generate_audio: generateAudio,
    bitrate_mode: 'high' as const,
  };
}

export async function submitHiggsfieldSeedance(input: {
  model?: string;
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  aspectRatio: HiggsfieldSeedanceAspectRatio;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
}) {
  const model = (input.model?.trim() || SEEDANCE_HIGGSFIELD_MODEL).replace(
    /^\/+/,
    ''
  );
  const body = buildHiggsfieldSeedancePayload(input);

  if (isGenjutsuE2EMockEnabled()) {
    return {
      requestId: createGenjutsuE2ERequestId(),
      status: 'queued',
    };
  }

  const webhookUrl = getWebhookUrl();
  const path = webhookUrl
    ? `/${model}?hf_webhook=${encodeURIComponent(webhookUrl)}`
    : `/${model}`;

  const payload = await higgsfieldProviderFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (typeof payload?.request_id !== 'string' || !payload.request_id) {
    throw new Error('Higgsfield did not return a request ID');
  }

  return {
    requestId: payload.request_id as string,
    status: typeof payload.status === 'string' ? payload.status : 'queued',
  };
}
