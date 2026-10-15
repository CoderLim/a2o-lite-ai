import { isProduction } from '@/lib/env';

import {
  isSeedanceLikenessRejection,
  SEEDANCE_LIKENESS_REJECTION_MESSAGE,
} from './seedance';

/**
 * Fallback English copy when a provider failure has no specific mapping and
 * the raw dump looks unsafe to show (account ids, request ids, model names…).
 * Mapped cases (likeness / content-safety) and clean provider messages are
 * returned as-is via toUserFacingProviderError.
 */
export const GENJUTSU_PROVIDER_FAILURE_USER_MESSAGE =
  'Generation failed. Please try again later.';

/**
 * User copy when the provider rejected the job under a content-safety signal.
 * Do not mention NSFW/safety/prompt — tip photo quality (blur, resolution, pose).
 * Raw vendor text stays in providerError for admin.
 */
export const GENJUTSU_CONTENT_SAFETY_USER_MESSAGE =
  "These photos didn't work for generation. Try sharper, higher-resolution, front-facing shots with a clear face, then try again.";

/**
 * HTTP statuses where the provider may have accepted the job even though the
 * client saw an error. Do not auto-refund — park as submission_unknown.
 */
export function isUncertainProviderHttpStatus(status: number) {
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

export const GENJUTSU_PROVIDER_FAILED_CODE = 'PROVIDER_FAILED';
export const GENJUTSU_CONTENT_SAFETY_CODE = 'PROVIDER_CONTENT_SAFETY';

/**
 * Official Ark Seedance privacy codes for “input may contain real person”
 * (ModelArk error table / arkcli-doctor §1.1.1):
 * - InputImageSensitiveContentDetected.PrivacyInformation
 * - InputVideoSensitiveContentDetected.PrivacyInformation
 *
 * @see https://www.volcengine.com/docs/82379/1299023
 */
export function isArkRealPersonPrivacyCode(
  code: string | null | undefined
): boolean {
  if (!code?.trim()) return false;
  const normalized = code.trim();
  return (
    normalized === 'InputImageSensitiveContentDetected.PrivacyInformation' ||
    normalized === 'InputVideoSensitiveContentDetected.PrivacyInformation' ||
    (normalized.includes('SensitiveContentDetected') &&
      normalized.endsWith('.PrivacyInformation'))
  );
}

/** Broader Ark content-safety codes (not necessarily real-person). */
export function isArkSensitiveContentCode(
  code: string | null | undefined
): boolean {
  if (!code?.trim()) return false;
  const normalized = code.trim();
  return (
    normalized.includes('SensitiveContentDetected') ||
    normalized.includes('RiskDetection') ||
    normalized === 'ContentSecurityDetectionError'
  );
}

/**
 * Higgsfield / Ark content-safety blocks that are not real-person privacy.
 * User-facing copy tips photo quality; admin keeps the raw dump.
 */
export function isProviderContentSafetyRejection(
  raw: string,
  providerCode?: string | null
): boolean {
  if (
    isArkSensitiveContentCode(providerCode) &&
    !isArkRealPersonPrivacyCode(providerCode)
  ) {
    return true;
  }

  const lower = raw.trim().toLowerCase();
  if (!lower) return false;
  return (
    lower.includes('blocked by content safety') ||
    lower.includes('provider safety check') ||
    lower.includes('content safety checks')
  );
}

/**
 * Provider dumps that should never reach the end-user UI (account ids,
 * request ids, Safe Experience Mode, internal model activation copy, etc.).
 */
export function looksLikeRawProviderError(message: string): boolean {
  const text = message.trim();
  if (!text) return false;

  const lower = text.toLowerCase();
  return (
    /request\s*id\s*:/i.test(text) ||
    /your account\s*\[?\d+/i.test(text) ||
    lower.includes('safe experience mode') ||
    lower.includes('安心体验') ||
    lower.includes('安全体验') ||
    lower.includes('usage limit') ||
    lower.includes('model activation') ||
    lower.includes('model service has been paused') ||
    lower.includes('doubao-seedance') ||
    lower.includes('ark.cn-beijing') ||
    lower.includes('volcengine') ||
    /http\s+[45]\d\d/.test(lower)
  );
}

export function toUserFacingProviderError(
  raw: string,
  providerCode?: string | null
): string {
  // Prefer official Ark error codes over message heuristics.
  if (isArkRealPersonPrivacyCode(providerCode)) {
    return SEEDANCE_LIKENESS_REJECTION_MESSAGE;
  }
  if (isSeedanceLikenessRejection(raw)) {
    return SEEDANCE_LIKENESS_REJECTION_MESSAGE;
  }
  if (isProviderContentSafetyRejection(raw, providerCode)) {
    return GENJUTSU_CONTENT_SAFETY_USER_MESSAGE;
  }
  const trimmed = raw.trim();
  // No mapping: show the provider message when it is safe; otherwise fallback.
  if (trimmed && !looksLikeRawProviderError(trimmed)) {
    return trimmed;
  }
  return GENJUTSU_PROVIDER_FAILURE_USER_MESSAGE;
}

export function splitProviderFailureError(
  raw: string | null | undefined,
  providerCode?: string | null
): {
  error: string;
  providerError: string;
  providerCode: string | null;
  errorCode: string;
  likeness: boolean;
  contentSafety: boolean;
} {
  const providerError = (raw || '').trim() || 'Generation failed';
  const normalizedCode =
    typeof providerCode === 'string' && providerCode.trim()
      ? providerCode.trim()
      : null;
  const likeness =
    isArkRealPersonPrivacyCode(normalizedCode) ||
    isSeedanceLikenessRejection(providerError);
  const contentSafety =
    !likeness &&
    isProviderContentSafetyRejection(providerError, normalizedCode);
  return {
    error: toUserFacingProviderError(providerError, normalizedCode),
    providerError,
    providerCode: normalizedCode,
    errorCode: likeness
      ? 'PROVIDER_LIKENESS_REJECTED'
      : contentSafety
        ? GENJUTSU_CONTENT_SAFETY_CODE
        : GENJUTSU_PROVIDER_FAILED_CODE,
    likeness,
    contentSafety,
  };
}

/** Always log the raw provider dump (dev + prod). */
export function logGenjutsuProviderFailure(params: {
  stage: string;
  generationId?: string;
  providerStatus?: string;
  errorCode?: string;
  providerCode?: string | null;
  providerError: string;
}) {
  console.error('[genjutsu] provider failure', {
    stage: params.stage,
    generationId: params.generationId ?? null,
    providerStatus: params.providerStatus ?? null,
    errorCode: params.errorCode ?? null,
    providerCode: params.providerCode ?? null,
    providerError: params.providerError,
  });
}

/**
 * Expose raw providerError on API responses only outside production so local
 * Network/devtools can inspect it. Production keeps the sanitized message.
 */
export function providerFailureDebugFields(params: {
  providerError: string;
  providerCode?: string | null;
}) {
  if (isProduction) return {};
  return {
    providerError: params.providerError,
    ...(params.providerCode ? { providerCode: params.providerCode } : {}),
  };
}
