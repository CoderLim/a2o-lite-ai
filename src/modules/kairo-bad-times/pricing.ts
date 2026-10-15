import { calculateGenjutsuCredits } from '@/modules/genjutsu/pricing';
import { HOTEL_LOBBY_OUTPUT_RATE_USD_PER_SECOND } from '@/modules/hotel-lobby/pricing';

/**
 * Fal published rate for Kling V3 Standard Motion Control matches O3 V2V
 * ($0.126 per second of generated video).
 */
export const KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND =
  HOTEL_LOBBY_OUTPUT_RATE_USD_PER_SECOND;

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

export function estimateKairoBadTimesProviderCost(input: { duration: number }) {
  assertKairoBadTimesDuration(input.duration);
  return Number(
    (input.duration * KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND).toFixed(6)
  );
}

export function estimateKairoBadTimesCredits(input: { duration: number }) {
  return calculateGenjutsuCredits(estimateKairoBadTimesProviderCost(input));
}
