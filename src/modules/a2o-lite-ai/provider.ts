import { envConfigs } from '@/config';
import type { GenjutsuProviderTarget } from '@/modules/genjutsu/types';
import { higgsfieldSeedanceObjectsSwapTarget } from '@/modules/genjutsu/workflow';

/** Providers that have passed a real dual-person replacement check for this page. */
export const A2O_LITE_AI_ALLOWED_PROVIDERS = ['seedance-higgsfield'] as const;

export class A2oLiteAiProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'A2oLiteAiProviderConfigError';
  }
}

export class A2oLiteAiProviderBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'A2oLiteAiProviderBindingError';
  }
}

/**
 * New A2O attempts only.
 * Blank override → Higgsfield Seedance video-edit pair.
 * Explicit unsupported or unknown values throw. Does not follow
 * GENJUTSU_OBJECT_SWAP_PROVIDER and does not coerce unknown strings to higgsfield.
 */
export function resolveA2oLiteAiProviderTarget(): GenjutsuProviderTarget {
  const raw = envConfigs.genjutsu_product_provider?.trim() ?? '';
  if (raw) {
    const normalized = raw.toLowerCase();
    if (
      !A2O_LITE_AI_ALLOWED_PROVIDERS.includes(
        normalized as (typeof A2O_LITE_AI_ALLOWED_PROVIDERS)[number]
      )
    ) {
      throw new A2oLiteAiProviderConfigError(
        `A2O Lite AI does not support provider "${raw}". Supported: ${A2O_LITE_AI_ALLOWED_PROVIDERS.join(', ')}.`
      );
    }
  }

  return higgsfieldSeedanceObjectsSwapTarget();
}

/** Persisted tasks must keep the pair they were created with. */
export function assertA2oLiteAiProviderBinding(
  provider: unknown,
  model: unknown
) {
  const expected = higgsfieldSeedanceObjectsSwapTarget();
  if (provider !== expected.provider || model !== expected.model) {
    throw new A2oLiteAiProviderBindingError(
      'A2O Lite AI task provider does not match the saved Seedance video-edit target'
    );
  }
}
