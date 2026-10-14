import { parseIsoBmffDurationSeconds } from '@/modules/genjutsu/video-metadata';

import {
  H3_MAX_DURATION_SECONDS,
  H3_MIN_DURATION_SECONDS,
  HOTEL_LOBBY_MAX_VIDEO_EDGE_PX,
  HOTEL_LOBBY_MIN_VIDEO_EDGE_PX,
} from './pricing';
import { readHotelLobbyObjectRange } from './r2-range';

const HEAD_BYTES = 2 * 1024 * 1024;
const TAIL_BYTES = 8 * 1024 * 1024;
/** Full-object fallback when head/tail ISO-BMFF parse fails (custom uploads). */
const FULL_PROBE_MAX_BYTES = 32 * 1024 * 1024;

export const HOTEL_LOBBY_MIN_SOURCE_SECONDS = 3;
export const HOTEL_LOBBY_MAX_SOURCE_SECONDS = 15;

function parseTotalBytes(contentRange: string | null) {
  if (!contentRange) return null;
  const match = /\/(\d+)$/.exec(contentRange);
  if (!match) return null;
  const total = Number(match[1]);
  return Number.isSafeInteger(total) && total > 0 ? total : null;
}

async function fetchRange(url: string, range: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('Invalid reference-video URL protocol');
  }

  const response = await fetch(parsed, {
    headers: { Range: range },
    redirect: 'manual',
  });

  if (response.status >= 300 && response.status < 400) {
    response.body?.cancel().catch(() => undefined);
    throw new Error('Reference-video URL redirected unexpectedly');
  }

  // Some origins ignore Range and return 200 + full body — still usable for
  // small templates. Prefer 206 when present.
  if (response.status !== 206 && response.status !== 200) {
    response.body?.cancel().catch(() => undefined);
    throw new Error(
      'Reference-video storage must support byte-range reads for duration validation'
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const totalFromRange = parseTotalBytes(response.headers.get('content-range'));
  const contentLength = Number(response.headers.get('content-length') || '');
  const totalBytes =
    totalFromRange ??
    (response.status === 200 &&
    Number.isSafeInteger(contentLength) &&
    contentLength > 0
      ? contentLength
      : response.status === 200
        ? bytes.byteLength
        : null);

  return { bytes, totalBytes };
}

type ProbeChunk = { bytes: Uint8Array; totalBytes: number | null };

async function loadProbeChunksFromUrl(videoUrl: string): Promise<ProbeChunk[]> {
  const first = await fetchRange(videoUrl, `bytes=0-${HEAD_BYTES - 1}`);
  const chunks: ProbeChunk[] = [first];
  if (first.totalBytes && first.totalBytes > HEAD_BYTES) {
    const start = Math.max(0, first.totalBytes - TAIL_BYTES);
    if (start > 0 || first.bytes.byteLength < first.totalBytes) {
      chunks.push(await fetchRange(videoUrl, `bytes=${start}-`));
    }
  }
  return chunks;
}

async function loadProbeChunksFromKey(videoKey: string): Promise<ProbeChunk[]> {
  const first = await readHotelLobbyObjectRange({
    key: videoKey,
    start: 0,
    end: HEAD_BYTES - 1,
  });
  const chunks: ProbeChunk[] = [first];
  if (first.totalBytes && first.totalBytes > first.bytes.byteLength) {
    const start = Math.max(0, first.totalBytes - TAIL_BYTES);
    if (start > 0 || first.bytes.byteLength < first.totalBytes) {
      chunks.push(
        await readHotelLobbyObjectRange({
          key: videoKey,
          start,
        })
      );
    }
  } else if (!first.totalBytes && first.bytes.byteLength >= HEAD_BYTES) {
    // Missing Content-Range: also pull remaining bytes after the head window.
    chunks.push(
      await readHotelLobbyObjectRange({
        key: videoKey,
        start: HEAD_BYTES,
      })
    );
  }
  return chunks;
}

async function loadFullObjectChunk(videoKey: string): Promise<ProbeChunk> {
  return readHotelLobbyObjectRange({ key: videoKey, start: 0 });
}

function readEbmlVint(
  bytes: Uint8Array,
  offset: number
): { value: number; length: number } | null {
  if (offset >= bytes.length) return null;
  const first = bytes[offset];
  if (first === 0) return null;

  let length = 1;
  let mask = 0x80;
  while (length <= 8 && (first & mask) === 0) {
    length += 1;
    mask >>= 1;
  }
  if (length > 8 || offset + length > bytes.length) return null;

  let value = first & (mask - 1);
  for (let i = 1; i < length; i += 1) {
    value = value * 256 + bytes[offset + i];
  }
  return { value, length };
}

function readFloat64(bytes: Uint8Array, offset: number) {
  if (offset + 8 > bytes.length) return null;
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 8).getFloat64(
    0,
    false
  );
}

function readFloat32(bytes: Uint8Array, offset: number) {
  if (offset + 4 > bytes.length) return null;
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getFloat32(
    0,
    false
  );
}

/**
 * Best-effort WebM/Matroska duration from the Segment Info header.
 * MediaRecorder clips usually include Duration + TimestampScale near the start.
 */
export function parseWebmDurationSeconds(bytes: Uint8Array) {
  if (bytes.length < 16) return null;
  // EBML magic
  if (
    !(
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    )
  ) {
    return null;
  }

  let timestampScale = 1_000_000;
  let durationValue: number | null = null;

  for (let offset = 0; offset + 3 < bytes.length; offset += 1) {
    // TimestampScale = 0x2AD7B1
    if (
      bytes[offset] === 0x2a &&
      bytes[offset + 1] === 0xd7 &&
      bytes[offset + 2] === 0xb1
    ) {
      const size = readEbmlVint(bytes, offset + 3);
      if (!size || size.value <= 0 || size.value > 8) continue;
      const dataOffset = offset + 3 + size.length;
      if (dataOffset + size.value > bytes.length) continue;
      let value = 0;
      for (let i = 0; i < size.value; i += 1) {
        value = value * 256 + bytes[dataOffset + i];
      }
      if (value > 0) timestampScale = value;
      continue;
    }

    // Duration = 0x4489
    if (bytes[offset] === 0x44 && bytes[offset + 1] === 0x89) {
      const size = readEbmlVint(bytes, offset + 2);
      if (!size) continue;
      const dataOffset = offset + 2 + size.length;
      if (size.value === 8) {
        durationValue = readFloat64(bytes, dataOffset);
      } else if (size.value === 4) {
        durationValue = readFloat32(bytes, dataOffset);
      }
    }
  }

  if (
    durationValue == null ||
    !Number.isFinite(durationValue) ||
    durationValue <= 0
  ) {
    return null;
  }

  // Duration is in TimestampScale units (nanoseconds when scale is 1e6).
  const seconds = (durationValue * timestampScale) / 1e9;
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return seconds;
}

function parseReferenceDurationSeconds(bytes: Uint8Array) {
  return parseIsoBmffDurationSeconds(bytes) ?? parseWebmDurationSeconds(bytes);
}

export {
  HOTEL_LOBBY_MAX_VIDEO_EDGE_PX,
  HOTEL_LOBBY_MIN_VIDEO_EDGE_PX,
} from './pricing';

/** Tiny float tolerance only — not a product slack window. */
const DURATION_EPSILON_SECONDS = 0.001;

function readUint16(bytes: Uint8Array, offset: number) {
  if (offset < 0 || offset + 2 > bytes.byteLength) return null;
  return bytes[offset] * 0x100 + bytes[offset + 1];
}

function readUint32(bytes: Uint8Array, offset: number) {
  if (offset < 0 || offset + 4 > bytes.byteLength) return null;
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function isFourCc(bytes: Uint8Array, offset: number, tag: string) {
  return (
    offset + 4 <= bytes.byteLength &&
    bytes[offset] === tag.charCodeAt(0) &&
    bytes[offset + 1] === tag.charCodeAt(1) &&
    bytes[offset + 2] === tag.charCodeAt(2) &&
    bytes[offset + 3] === tag.charCodeAt(3)
  );
}

/**
 * ISO BMFF boxes start with size(4)+type(4). Scanning for fourcc alone false-
 * positives on ftyp compatible brands (e.g. `iso2avc1mp41` embeds `avc1`).
 * Real tkhd / VisualSampleEntry boxes are small; brand strings yield huge
 * "sizes" when the preceding 4 bytes are misread as a length.
 */
function isPlausibleIsoBmffBox(
  bytes: Uint8Array,
  typeOffset: number,
  minSize: number
) {
  const declaredSize = readUint32(bytes, typeOffset - 4);
  if (declaredSize == null || declaredSize < minSize) return false;
  // size==0 means "extends to EOF"; otherwise keep an upper bound so brand
  // strings like "iso2" (0x69736f32) never look like box headers.
  if (declaredSize === 0) return true;
  return declaredSize <= 4 * 1024 * 1024;
}

/**
 * Best-effort MP4/MOV display size from tkhd (16.16) or visual sample entries.
 * Returns null when metadata is missing (e.g. WebM).
 */
export function parseIsoBmffVideoDimensions(bytes: Uint8Array): {
  width: number;
  height: number;
} | null {
  let bestTkhd: { width: number; height: number } | null = null;
  let bestSample: { width: number; height: number } | null = null;

  const consider = (
    target: 'tkhd' | 'sample',
    width: number,
    height: number
  ) => {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width < 16 ||
      height < 16
    ) {
      return;
    }
    const w = Math.round(width);
    const h = Math.round(height);
    const prev = target === 'tkhd' ? bestTkhd : bestSample;
    if (!prev || w * h > prev.width * prev.height) {
      if (target === 'tkhd') bestTkhd = { width: w, height: h };
      else bestSample = { width: w, height: h };
    }
  };

  for (let typeOffset = 4; typeOffset + 8 < bytes.byteLength; typeOffset += 1) {
    if (isFourCc(bytes, typeOffset, 'tkhd')) {
      // tkhd v0 = 92 bytes, v1 = 104 bytes (including size+type).
      if (!isPlausibleIsoBmffBox(bytes, typeOffset, 92)) continue;
      const version = bytes[typeOffset + 4];
      const whOffset =
        version === 0 ? typeOffset + 80 : version === 1 ? typeOffset + 92 : -1;
      if (whOffset < 0 || whOffset + 8 > bytes.byteLength) continue;
      const widthFixed = readUint32(bytes, whOffset);
      const heightFixed = readUint32(bytes, whOffset + 4);
      if (widthFixed == null || heightFixed == null) continue;
      consider('tkhd', widthFixed / 65536, heightFixed / 65536);
      continue;
    }

    if (
      isFourCc(bytes, typeOffset, 'avc1') ||
      isFourCc(bytes, typeOffset, 'avc3') ||
      isFourCc(bytes, typeOffset, 'hvc1') ||
      isFourCc(bytes, typeOffset, 'hev1') ||
      isFourCc(bytes, typeOffset, 'vp09') ||
      isFourCc(bytes, typeOffset, 'av01') ||
      isFourCc(bytes, typeOffset, 'mp4v')
    ) {
      // VisualSampleEntry: size+type(8) + SampleEntry(8) + visual fields to
      // width/height (~32 from type) — real boxes are typically <1KB.
      if (!isPlausibleIsoBmffBox(bytes, typeOffset, 86)) continue;
      // VisualSampleEntry width/height are uint16 after SampleEntry(8) +
      // pre_defined/reserved/pre_defined[3](16), measured from the type fourcc.
      const width = readUint16(bytes, typeOffset + 28);
      const height = readUint16(bytes, typeOffset + 30);
      if (width != null && height != null) consider('sample', width, height);
    }
  }

  // Prefer tkhd display size; sample-entry dims are a fallback for partial reads.
  return bestTkhd ?? bestSample;
}

export function assertHotelLobbyVideoDimensions(input: {
  width: number;
  height: number;
}) {
  const { width, height } = input;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < HOTEL_LOBBY_MIN_VIDEO_EDGE_PX ||
    height < HOTEL_LOBBY_MIN_VIDEO_EDGE_PX ||
    width > HOTEL_LOBBY_MAX_VIDEO_EDGE_PX ||
    height > HOTEL_LOBBY_MAX_VIDEO_EDGE_PX
  ) {
    throw new Error(
      `Reference video must be between ${HOTEL_LOBBY_MIN_VIDEO_EDGE_PX}×${HOTEL_LOBBY_MIN_VIDEO_EDGE_PX} and ${HOTEL_LOBBY_MAX_VIDEO_EDGE_PX}×${HOTEL_LOBBY_MAX_VIDEO_EDGE_PX} pixels (got ${Math.round(width)}×${Math.round(height)})`
    );
  }
}

export function normalizeHotelLobbyDuration(seconds: number) {
  if (
    !Number.isFinite(seconds) ||
    seconds < HOTEL_LOBBY_MIN_SOURCE_SECONDS - DURATION_EPSILON_SECONDS ||
    seconds > HOTEL_LOBBY_MAX_SOURCE_SECONDS + DURATION_EPSILON_SECONDS
  ) {
    throw new Error(
      `Reference video must be between ${HOTEL_LOBBY_MIN_SOURCE_SECONDS} and ${HOTEL_LOBBY_MAX_SOURCE_SECONDS} seconds`
    );
  }

  return Math.min(
    HOTEL_LOBBY_MAX_SOURCE_SECONDS,
    Math.max(HOTEL_LOBBY_MIN_SOURCE_SECONDS, Math.round(seconds))
  );
}

function durationFromProbeChunks(
  chunks: ProbeChunk[],
  options?: { fallbackSeconds?: number }
) {
  let seconds: number | null = null;
  for (const chunk of chunks) {
    seconds = parseReferenceDurationSeconds(chunk.bytes);
    if (seconds != null) break;
  }

  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    if (
      typeof options?.fallbackSeconds === 'number' &&
      Number.isFinite(options.fallbackSeconds) &&
      options.fallbackSeconds > 0
    ) {
      return options.fallbackSeconds;
    }
    throw new Error(
      'Could not read the reference video duration. Use an MP4, MOV, or WebM with readable metadata.'
    );
  }

  return seconds;
}

function dimensionsFromProbeChunks(chunks: ProbeChunk[]) {
  let dims: { width: number; height: number } | null = null;
  for (const chunk of chunks) {
    dims = parseIsoBmffVideoDimensions(chunk.bytes);
    if (dims) break;
  }

  if (!dims) {
    throw new Error(
      'Could not read the reference video resolution. Use an MP4 or MOV with readable metadata.'
    );
  }

  assertHotelLobbyVideoDimensions(dims);
  return dims;
}

export async function probeHotelLobbyDurationSecondsRaw(
  videoUrl: string,
  options?: { fallbackSeconds?: number }
) {
  return durationFromProbeChunks(
    await loadProbeChunksFromUrl(videoUrl),
    options
  );
}

/** Prefer authenticated R2 range reads for sealed hotel-lobby keys. */
export async function probeHotelLobbyDurationSecondsRawFromKey(
  videoKey: string,
  options?: { fallbackSeconds?: number }
) {
  return durationFromProbeChunks(
    await loadProbeChunksFromKey(videoKey),
    options
  );
}

export async function probeHotelLobbyDurationSeconds(
  videoUrl: string,
  options?: { fallbackSeconds?: number }
) {
  return normalizeHotelLobbyDuration(
    await probeHotelLobbyDurationSecondsRaw(videoUrl, options)
  );
}

export async function probeHotelLobbyDurationSecondsFromKey(
  videoKey: string,
  options?: { fallbackSeconds?: number }
) {
  return normalizeHotelLobbyDuration(
    await probeHotelLobbyDurationSecondsRawFromKey(videoKey, options)
  );
}

/** H3 Lab: validate raw clip against MiniMax 5–15s before rounding for billing. */
export function normalizeH3LabDuration(seconds: number) {
  if (
    !Number.isFinite(seconds) ||
    seconds < H3_MIN_DURATION_SECONDS - DURATION_EPSILON_SECONDS ||
    seconds > H3_MAX_DURATION_SECONDS + DURATION_EPSILON_SECONDS
  ) {
    throw new Error(
      `Reference video must be between ${H3_MIN_DURATION_SECONDS} and ${H3_MAX_DURATION_SECONDS} seconds`
    );
  }

  return Math.min(
    H3_MAX_DURATION_SECONDS,
    Math.max(H3_MIN_DURATION_SECONDS, Math.round(seconds))
  );
}

export async function probeH3LabDurationSeconds(
  videoUrl: string,
  options?: { fallbackSeconds?: number }
) {
  return normalizeH3LabDuration(
    await probeHotelLobbyDurationSecondsRaw(videoUrl, options)
  );
}

export async function probeHotelLobbyVideoDimensions(videoUrl: string) {
  return dimensionsFromProbeChunks(await loadProbeChunksFromUrl(videoUrl));
}

export async function probeHotelLobbyVideoDimensionsFromKey(videoKey: string) {
  const chunks = await loadProbeChunksFromKey(videoKey);
  try {
    return dimensionsFromProbeChunks(chunks);
  } catch (error) {
    const total =
      chunks.find((chunk) => chunk.totalBytes != null)?.totalBytes ??
      chunks.reduce((max, chunk) => Math.max(max, chunk.bytes.byteLength), 0);
    if (total > 0 && total <= FULL_PROBE_MAX_BYTES) {
      return dimensionsFromProbeChunks([await loadFullObjectChunk(videoKey)]);
    }
    const readSizes = chunks.map((chunk) => chunk.bytes.byteLength).join('+');
    throw new Error(
      error instanceof Error
        ? `${error.message} (read ${readSizes || '0'} bytes)`
        : 'Could not read the reference video resolution. Use an MP4 or MOV with readable metadata.'
    );
  }
}
