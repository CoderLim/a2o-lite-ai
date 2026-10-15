import { probeHotelLobbyDurationSecondsRaw } from '@/modules/hotel-lobby/video-metadata';

import {
  KAIRO_BAD_TIMES_MAX_DURATION_SECONDS,
  KAIRO_BAD_TIMES_MIN_DURATION_SECONDS,
} from './pricing';

const DURATION_EPSILON_SECONDS = 0.001;

export function normalizeKairoBadTimesDuration(seconds: number) {
  if (
    !Number.isFinite(seconds) ||
    seconds < KAIRO_BAD_TIMES_MIN_DURATION_SECONDS - DURATION_EPSILON_SECONDS ||
    seconds > KAIRO_BAD_TIMES_MAX_DURATION_SECONDS + DURATION_EPSILON_SECONDS
  ) {
    throw new Error(
      `Template video must be between ${KAIRO_BAD_TIMES_MIN_DURATION_SECONDS} and ${KAIRO_BAD_TIMES_MAX_DURATION_SECONDS} seconds`
    );
  }

  return Math.min(
    KAIRO_BAD_TIMES_MAX_DURATION_SECONDS,
    Math.max(KAIRO_BAD_TIMES_MIN_DURATION_SECONDS, Math.round(seconds))
  );
}

export async function probeKairoBadTimesDurationSecondsRaw(videoUrl: string) {
  return probeHotelLobbyDurationSecondsRaw(videoUrl);
}

export async function probeKairoBadTimesDurationSeconds(videoUrl: string) {
  return normalizeKairoBadTimesDuration(
    await probeKairoBadTimesDurationSecondsRaw(videoUrl)
  );
}
