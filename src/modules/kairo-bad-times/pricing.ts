import { calculateGenjutsuCredits } from '@/modules/genjutsu/pricing';
import { HOTEL_LOBBY_OUTPUT_RATE_USD_PER_SECOND } from '@/modules/hotel-lobby/pricing';

import type { KairoBadTimesSubject } from './constants';

/**
 * Person — 真实花费 & 对外花费（同一单价）。
 * Fal Kling V3 Standard Motion Control = O3 V2V ($0.126 / s).
 * Used for both provider COGS and customer credit estimates.
 */
export const KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND =
  HOTEL_LOBBY_OUTPUT_RATE_USD_PER_SECOND;

/**
 * Pet — 真实花费（Fal COGS only）。
 * DreamActor v2 published rate: $0.05 / s.
 * Do not use this for credit estimates — see billing rate below.
 */
export const KAIRO_BAD_TIMES_PET_OUTPUT_RATE_USD_PER_SECOND = 0.05;

/**
 * Pet — 对外花费（客户积分计价）。
 * Intentionally matched to Person ($0.126 / s) so same-length templates
 * charge similar credits; real Fal outflow stays at $0.05 / s above.
 */
export const KAIRO_BAD_TIMES_PET_BILLING_RATE_USD_PER_SECOND =
  KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND;

/** Motion Control with `character_orientation: video` accepts 3–30s templates. */
export const KAIRO_BAD_TIMES_MIN_DURATION_SECONDS = 3;
export const KAIRO_BAD_TIMES_MAX_DURATION_SECONDS = 30;

export const KAIRO_BAD_TIMES_MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export function assertKairoBadTimesDuration(duration: number) {
  if (
    !Number.isInteger(duration) ||
    duration < KAIRO_BAD_TIMES_MIN_DURATION_SECONDS ||
    duration > KAIRO_BAD_TIMES_MAX_DURATION_SECONDS
  ) {
    throw new Error(
      `Duration must be an integer between ${KAIRO_BAD_TIMES_MIN_DURATION_SECONDS} and ${KAIRO_BAD_TIMES_MAX_DURATION_SECONDS} seconds`
    );
  }
}

function providerRateForSubject(subject?: KairoBadTimesSubject) {
  return subject === 'pet'
    ? KAIRO_BAD_TIMES_PET_OUTPUT_RATE_USD_PER_SECOND
    : KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND;
}

function billingRateForSubject(subject?: KairoBadTimesSubject) {
  return subject === 'pet'
    ? KAIRO_BAD_TIMES_PET_BILLING_RATE_USD_PER_SECOND
    : KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND;
}

/** 真实花费 USD — Fal COGS for ops / task metadata (not customer price). */
export function estimateKairoBadTimesProviderCost(input: {
  duration: number;
  subject?: KairoBadTimesSubject;
}) {
  assertKairoBadTimesDuration(input.duration);
  return Number(
    (input.duration * providerRateForSubject(input.subject)).toFixed(6)
  );
}

/** 对外花费 → 积分 — customer-facing credit estimate (may markup Pet). */
export function estimateKairoBadTimesCredits(input: {
  duration: number;
  subject?: KairoBadTimesSubject;
}) {
  assertKairoBadTimesDuration(input.duration);
  const billedUsd = Number(
    (input.duration * billingRateForSubject(input.subject)).toFixed(6)
  );
  return calculateGenjutsuCredits(billedUsd);
}
