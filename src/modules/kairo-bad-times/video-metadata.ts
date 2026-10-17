import { parseIsoBmffDurationSeconds } from '@/modules/genjutsu/video-metadata';
import {
  parseWebmDurationSeconds,
  probeHotelLobbyDurationSecondsRaw,
} from '@/modules/hotel-lobby/video-metadata';

import {
  KAIRO_BAD_TIMES_MAX_DURATION_SECONDS,
  KAIRO_BAD_TIMES_MIN_DURATION_SECONDS,
} from './pricing';

const DURATION_EPSILON_SECONDS = 0.001;
const LOCAL_PROBE_HEAD_BYTES = 2 * 1024 * 1024;
const LOCAL_PROBE_TAIL_BYTES = 4 * 1024 * 1024;

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

/** Node-only: probe duration from a local MP4/WebM without hitting R2. */
export async function probeKairoBadTimesLocalFileDurationSecondsRaw(
  absolutePath: string
) {
  const { open } = await import('node:fs/promises');
  const { stat } = await import('node:fs/promises');
  const totalBytes = (await stat(absolutePath)).size;
  if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
    throw new Error('Local template file is empty');
  }

  const file = await open(absolutePath, 'r');
  try {
    const headLen = Math.min(LOCAL_PROBE_HEAD_BYTES, totalBytes);
    const head = new Uint8Array(headLen);
    await file.read(head, 0, headLen, 0);
    let seconds =
      parseIsoBmffDurationSeconds(head) ?? parseWebmDurationSeconds(head);

    if (seconds == null && totalBytes > LOCAL_PROBE_HEAD_BYTES) {
      const start = Math.max(0, totalBytes - LOCAL_PROBE_TAIL_BYTES);
      const tailLen = totalBytes - start;
      const tail = new Uint8Array(tailLen);
      await file.read(tail, 0, tailLen, start);
      seconds =
        parseIsoBmffDurationSeconds(tail) ?? parseWebmDurationSeconds(tail);
    }

    if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
      throw new Error('Could not read local template duration');
    }
    return seconds;
  } finally {
    await file.close();
  }
}

export async function probeKairoBadTimesDurationSeconds(videoUrl: string) {
  return normalizeKairoBadTimesDuration(
    await probeKairoBadTimesDurationSecondsRaw(videoUrl)
  );
}
