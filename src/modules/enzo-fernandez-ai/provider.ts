import type {
  GenjutsuProvider,
  GenjutsuProviderTarget,
} from '@/modules/genjutsu/types';
import {
  ENZO_FERNANDEZ_AI_PRODUCT,
  isSeedanceFamilyProvider,
  resolveObjectsSwapTargetForProvider,
  resolveProductProviderTarget,
} from '@/modules/genjutsu/workflow';

import { ENZO_FERNANDEZ_AI_MODE } from './constants';

export class EnzoFernandezAiProviderBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnzoFernandezAiProviderBindingError';
  }
}

/**
 * Same router as Crazy Frog / A2O / Smalltown:
 * `GENJUTSU_OBJECT_SWAP_PROVIDER` (homepage objects-swap), optionally overridden
 * by `GENJUTSU_PRODUCT_PROVIDER` for allowlisted product pages.
 */
export function resolveEnzoFernandezAiProviderTarget(): GenjutsuProviderTarget {
  return resolveProductProviderTarget(
    ENZO_FERNANDEZ_AI_PRODUCT,
    ENZO_FERNANDEZ_AI_MODE
  );
}

/**
 * Persisted attempts keep the provider/model they were created with.
 * Accept any Seedance-family objects-swap pair for that provider.
 */
export function assertEnzoFernandezAiProviderBinding(
  provider: unknown,
  model: unknown
) {
  if (
    typeof provider !== 'string' ||
    !provider.trim() ||
    typeof model !== 'string' ||
    !model.trim()
  ) {
    throw new EnzoFernandezAiProviderBindingError(
      'Enzo Fernandez AI task is missing a provider/model binding'
    );
  }
  if (!isSeedanceFamilyProvider(provider)) {
    throw new EnzoFernandezAiProviderBindingError(
      'Enzo Fernandez AI requires a Seedance family provider'
    );
  }
  const expected = resolveObjectsSwapTargetForProvider(
    provider as GenjutsuProvider
  );
  if (model !== expected.model) {
    throw new EnzoFernandezAiProviderBindingError(
      'Enzo Fernandez AI task model does not match the Seedance objects-swap target for its provider'
    );
  }
}
