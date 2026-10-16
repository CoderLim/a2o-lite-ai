import { envConfigs } from '@/config';
import { getConfig } from '@/modules/config/service';

import {
  createGenjutsuE2ERequestId,
  isGenjutsuE2EMockEnabled,
} from './e2e-mock';
import { estimateSeedanceProviderCost } from './seedance';
import type { GenjutsuMode, GenjutsuResolution } from './types';
import { buildSeedanceWorkflowPrompt } from './workflow';

const DEFAULT_WAVESPEED_API_BASE_URL = 'https://api.wavespeed.ai/api/v3';
const DEFAULT_WAVESPEED_MOTION_MODEL = 'bytedance/seedance-2.5/motion-control';
const DEFAULT_WAVESPEED_EDIT_MODEL = 'bytedance/seedance-2.5/video-edit';

/**
 * Motion Control bills reference-video duration only (ceil, 4–30s).
 * Source: https://wavespeed.ai/models/bytedance/seedance-2.5/motion-control
 */
const WAVESPEED_MOTION_RATE_USD_PER_SECOND: Record<GenjutsuResolution, number> =
  {
    '480p': 0.22,
    '720p': 0.44,
    '1080p': 1.1,
  };

/**
 * Video Edit bills input + output duration (each clamped 4–30s).
 * Source: https://wavespeed.ai/models/bytedance/seedance-2.5/video-edit
 */
const WAVESPEED_EDIT_RATE_USD_PER_SECOND: Record<GenjutsuResolution, number> = {
  '480p': 0.11,
  '720p': 0.22,
  '1080p': 0.55,
};

export class WavespeedSeedanceHttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = 'WavespeedSeedanceHttpError';
  }
}

async function getWavespeedApiKey() {
  const value =
    (await getConfig('wavespeed_api_key'))?.trim() ||
    envConfigs.wavespeed_api_key?.trim();
  if (!value) {
    throw new WavespeedSeedanceHttpError(
      503,
      'WaveSpeed key is not configured. Set WAVESPEED_API_KEY or Admin → Settings → AI → WaveSpeed.',
      'WAVESPEED_NOT_CONFIGURED'
    );
  }
  return value;
}

function getWavespeedApiBaseUrl() {
  const value = (
    envConfigs.wavespeed_api_base_url?.trim() || DEFAULT_WAVESPEED_API_BASE_URL
  ).replace(/\/$/, '');
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') throw new Error('HTTPS required');
    return value;
  } catch {
    throw new WavespeedSeedanceHttpError(
      503,
      'WaveSpeed base URL is invalid.',
      'WAVESPEED_INVALID_BASE_URL'
    );
  }
}

function normalizeModelPath(model: string) {
  const value = model.trim().replace(/^\/+/, '');
  if (!value || !/^[A-Za-z0-9._/-]+$/.test(value)) {
    throw new WavespeedSeedanceHttpError(
      503,
      'Invalid WaveSpeed Seedance model configuration.',
      'WAVESPEED_INVALID_MODEL'
    );
  }
  return value;
}

export function resolveWavespeedSeedanceModel(
  mode: GenjutsuMode,
  modelOverride?: string
) {
  const override = modelOverride?.trim();
  if (override) return normalizeModelPath(override);

  if (mode === 'objects-swap') {
    return normalizeModelPath(
      envConfigs.seedance_wavespeed_edit_model?.trim() ||
        DEFAULT_WAVESPEED_EDIT_MODEL
    );
  }

  return normalizeModelPath(
    envConfigs.seedance_wavespeed_motion_model?.trim() ||
      DEFAULT_WAVESPEED_MOTION_MODEL
  );
}

/** Envelope ACK from WaveSpeed result polls — not a prediction failure reason. */
function isWavespeedEnvelopeAckMessage(value: unknown) {
  return typeof value === 'string' && value.trim().toLowerCase() === 'success';
}

function isWavespeedEnvelopeAckCode(value: unknown) {
  return value === 200 || value === '200';
}

function wavespeedErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const record = payload as Record<string, any>;
  const data = record.data;
  // Prefer nested prediction errors. Top-level `message: "success"` / `code: 200`
  // are HTTP envelope ACKs and must not mask data.error on failed jobs.
  const candidates = [
    data?.error?.message,
    data?.error,
    data?.message,
    record.error?.message,
    record.error,
    isWavespeedEnvelopeAckMessage(record.message) ? undefined : record.message,
  ];
  const message = candidates.find(
    (value) => typeof value === 'string' && value.trim()
  );
  return typeof message === 'string' ? message : fallback;
}

function wavespeedErrorCode(payload: unknown) {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, any>;
  const candidates = [
    record.data?.error?.code,
    record.data?.code,
    record.error?.code,
    isWavespeedEnvelopeAckCode(record.code) ? undefined : record.code,
  ];
  const code = candidates.find(
    (value) =>
      (typeof value === 'string' && value.trim()) ||
      (typeof value === 'number' && Number.isFinite(value))
  );
  if (typeof code === 'string' && code.trim()) return code;
  if (typeof code === 'number' && Number.isFinite(code)) return String(code);
  return undefined;
}

async function wavespeedFetch(path: string, init?: RequestInit): Promise<any> {
  const apiKey = await getWavespeedApiKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(
    `${getWavespeedApiBaseUrl()}/${path.replace(/^\/+/, '')}`,
    {
      ...init,
      headers,
    }
  );

  const payload = await response.json().catch(() => null);
  if (response.ok) return payload;

  throw new WavespeedSeedanceHttpError(
    response.status,
    wavespeedErrorMessage(
      payload,
      `WaveSpeed request failed with HTTP ${response.status}`
    ),
    wavespeedErrorCode(payload),
    payload
  );
}

function assertSourceDurationSeconds(value: number) {
  if (!Number.isFinite(value) || value < 4 || value > 30) {
    throw new Error('Seedance source video must be between 4 and 30 seconds');
  }
}

function billableSourceSeconds(sourceDurationSeconds: number) {
  return Math.min(30, Math.max(4, Math.ceil(sourceDurationSeconds)));
}

export async function assertWavespeedSeedanceConfigured(
  mode: GenjutsuMode,
  model?: string
) {
  await getWavespeedApiKey();
  getWavespeedApiBaseUrl();
  resolveWavespeedSeedanceModel(mode, model);
}

function wavespeedReferenceTokens(imageCount: number) {
  // WaveSpeed prompts bind assets as "@Image 1" / "@Video 1" (space required).
  return {
    video: '@Video 1',
    images: Array.from(
      { length: imageCount },
      (_, index) => `@Image ${index + 1}`
    ),
  };
}

function buildWavespeedWorkflowPrompt(input: {
  mode: GenjutsuMode;
  prompt?: string;
  imageCount: number;
}) {
  return buildSeedanceWorkflowPrompt({
    mode: input.mode,
    userPrompt: input.prompt,
    imageCount: input.imageCount,
    references: wavespeedReferenceTokens(input.imageCount),
  });
}

export function estimateWavespeedSeedanceProviderCost(input: {
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  sourceDurationSeconds: number;
}) {
  assertSourceDurationSeconds(input.sourceDurationSeconds);

  const sourceSeconds = billableSourceSeconds(input.sourceDurationSeconds);
  const isEdit = input.mode === 'objects-swap';
  const rateUsdPerSecond = isEdit
    ? WAVESPEED_EDIT_RATE_USD_PER_SECOND[input.resolution]
    : WAVESPEED_MOTION_RATE_USD_PER_SECOND[input.resolution];

  // Motion Control: reference duration only. Video Edit: input + output.
  const outputSeconds = isEdit ? sourceSeconds : 0;
  const billedSeconds = sourceSeconds + outputSeconds;
  const providerCostUsd = billedSeconds * rateUsdPerSecond;

  const customerQuote = estimateSeedanceProviderCost({
    resolution: input.resolution,
    sourceDurationSeconds: input.sourceDurationSeconds,
  });

  return {
    providerCostUsd,
    customerPriceBasisUsd: customerQuote.providerCostUsd,
    providerCredits: null,
    source: 'wavespeed_seedance_estimate' as const,
    payload: {
      source: 'wavespeed_seedance_estimate',
      pricingVersion: isEdit
        ? 'wavespeed-seedance-2.5-video-edit-2026-10'
        : 'wavespeed-seedance-2.5-motion-control-2026-10',
      endpoint: isEdit ? 'video-edit' : 'motion-control',
      sourceDurationSeconds: input.sourceDurationSeconds,
      billedSourceSeconds: sourceSeconds,
      estimatedOutputDurationSeconds: isEdit ? outputSeconds : sourceSeconds,
      billedSeconds,
      resolution: input.resolution,
      rateUsdPerSecond,
      customerPriceBasisUsd: customerQuote.providerCostUsd,
    },
  };
}

export function buildWavespeedSeedancePayload(input: {
  model?: string;
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
}) {
  assertSourceDurationSeconds(input.sourceDurationSeconds);
  if (
    !Array.isArray(input.imageUrls) ||
    input.imageUrls.length < 1 ||
    input.imageUrls.length > 8
  ) {
    throw new Error('Provide between 1 and 8 reference images');
  }

  const model = resolveWavespeedSeedanceModel(input.mode, input.model);
  const prompt = buildWavespeedWorkflowPrompt({
    mode: input.mode,
    prompt: input.prompt,
    imageCount: input.imageUrls.length,
  });

  const body: Record<string, unknown> = {
    video: input.videoUrl,
    reference_images: input.imageUrls,
    prompt,
    resolution: input.resolution,
    generate_audio: envConfigs.seedance_genjutsu_generate_audio !== 'false',
  };

  return { model, body };
}

function unwrapPrediction(payload: any) {
  if (payload && typeof payload === 'object' && payload.data) {
    return payload.data;
  }
  return payload;
}

function extractVideoUrl(prediction: Record<string, any> | null | undefined) {
  const outputs = prediction?.outputs;
  if (!Array.isArray(outputs)) return null;

  for (const item of outputs) {
    if (typeof item === 'string' && item.trim()) return item.trim();
    if (item && typeof item === 'object') {
      const url =
        (item as { url?: unknown }).url ??
        (item as { video?: unknown }).video ??
        (item as { output?: unknown }).output;
      if (typeof url === 'string' && url.trim()) return url.trim();
    }
  }

  return null;
}

export function normalizeWavespeedSeedanceTask(payload: any) {
  const prediction = unwrapPrediction(payload);
  const providerStatus =
    typeof prediction?.status === 'string'
      ? prediction.status.toLowerCase()
      : 'processing';

  const rawPrice = Number(
    prediction?.price ?? prediction?.cost ?? prediction?.billing?.price
  );
  const providerUsage =
    Number.isFinite(rawPrice) && rawPrice >= 0
      ? { actualProviderCostUsd: rawPrice }
      : undefined;

  if (providerStatus === 'completed') {
    const videoUrl = extractVideoUrl(prediction);
    if (!videoUrl) {
      return {
        status: 'failed' as const,
        providerStatus: 'failed',
        videoUrl: null,
        error: 'WaveSpeed completed the request without a video URL',
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
    providerStatus === 'cancelled' ||
    providerStatus === 'canceled' ||
    providerStatus === 'timeout' ||
    providerStatus === 'deleted'
  ) {
    return {
      status: 'failed' as const,
      providerStatus,
      videoUrl: null,
      error: wavespeedErrorMessage(
        payload,
        typeof prediction?.error === 'string' && prediction.error.trim()
          ? prediction.error
          : `Generation ended with status: ${providerStatus}`
      ),
      errorCode: wavespeedErrorCode(payload),
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

export async function submitWavespeedSeedance(input: {
  model: string;
  mode: GenjutsuMode;
  resolution: GenjutsuResolution;
  prompt?: string;
  videoUrl: string;
  imageUrls: string[];
  sourceDurationSeconds: number;
  endUserId: string;
}) {
  const { model, body } = buildWavespeedSeedancePayload(input);

  if (isGenjutsuE2EMockEnabled()) {
    return {
      requestId: createGenjutsuE2ERequestId(),
      status: 'queued',
    };
  }

  const payload = await wavespeedFetch(`/${model}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const prediction = unwrapPrediction(payload);
  const requestId = prediction?.id;
  if (typeof requestId !== 'string' || !requestId) {
    throw new Error('WaveSpeed did not return a prediction ID');
  }

  return {
    requestId,
    status:
      typeof prediction?.status === 'string'
        ? prediction.status.toLowerCase()
        : 'processing',
  };
}

export async function getWavespeedSeedanceStatus(input: { requestId: string }) {
  const requestId = input.requestId.trim();
  if (!/^[A-Za-z0-9._:-]{6,200}$/.test(requestId)) {
    throw new Error('Invalid WaveSpeed Seedance task ID');
  }

  const payload = await wavespeedFetch(
    `/predictions/${encodeURIComponent(requestId)}/result`,
    { method: 'GET' }
  );
  return normalizeWavespeedSeedanceTask(payload);
}
