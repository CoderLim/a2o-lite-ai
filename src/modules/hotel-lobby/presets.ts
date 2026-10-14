import { envConfigs } from '@/config';

import type { HotelLobbyAspectRatio } from './pricing';
import { buildHotelLobbyPrompt, HotelLobbyPreflightError } from './prompt';

export const HOTEL_LOBBY_PRESET_ID = 'hotel-lobby' as const;
export const CRAZY_FROG_PRESET_ID = 'crazy-frog' as const;

export type HotelLobbyPresetId =
  | typeof HOTEL_LOBBY_PRESET_ID
  | typeof CRAZY_FROG_PRESET_ID;

export type HotelLobbyPreset = {
  id: HotelLobbyPresetId;
  version: number;
  /** Display name for My Creations / admin. */
  displayName: string;
  /** Credit ledger description while reserving. */
  creditDescription: string;
  templateVideoKey: string;
  imageCount: { min: number; max: number };
  allowCustomVideo: boolean;
  allowTrim: boolean;
  keepAudio: boolean;
  /** Stored in aiTask.options for admin/debug (not sent to Kling O3). */
  aspectRatio: HotelLobbyAspectRatio;
  enabled: boolean;
  promptFor: (imageCount: number) => string;
};

const DEFAULT_HOTEL_LOBBY_TEMPLATE_KEY = 'hotel-lobby/templates/default.mp4';
const CRAZY_FROG_TEMPLATE_KEY = 'hotel-lobby/templates/crazy-frog-v1.mp4';

function hotelLobbyTemplateVideoKey() {
  return (
    envConfigs.hotel_lobby_template_video_key?.trim() ||
    DEFAULT_HOTEL_LOBBY_TEMPLATE_KEY
  );
}

/**
 * Crazy Frog chase — Element1 = foreground lead (facing camera),
 * Element2 = chaser on the red vehicle behind.
 */
export function buildCrazyFrogPrompt(imageCount: number) {
  if (imageCount !== 2) {
    throw new HotelLobbyPreflightError(
      'Crazy Frog requires exactly two reference images'
    );
  }
  return [
    'In @Video1, replace the foreground rider who faces the camera and points',
    'forward with the person or character from @Element1.',
    'Replace the person chasing behind on the red vehicle with the person or',
    'character from @Element2.',
    'Preserve the original timing, body movements, gestures, camera motion,',
    'road, vehicle, and chase staging from @Video1.',
    'Match each Element for face, hair, body, clothing, and species throughout',
    'the clip. Do not swap Element1 and Element2 or blend the two identities.',
  ].join(' ');
}

const PRESETS: Record<HotelLobbyPresetId, HotelLobbyPreset> = {
  [HOTEL_LOBBY_PRESET_ID]: {
    id: HOTEL_LOBBY_PRESET_ID,
    version: 1,
    displayName: 'Hotel Lobby',
    creditDescription: 'Reserve credits for Hotel Lobby AI generation',
    get templateVideoKey() {
      return hotelLobbyTemplateVideoKey();
    },
    imageCount: { min: 1, max: 2 },
    allowCustomVideo: true,
    allowTrim: true,
    keepAudio: true,
    aspectRatio: '16:9',
    enabled: true,
    promptFor: buildHotelLobbyPrompt,
  },
  [CRAZY_FROG_PRESET_ID]: {
    id: CRAZY_FROG_PRESET_ID,
    version: 1,
    displayName: 'Crazy Frog',
    creditDescription: 'Reserve credits for Crazy Frog AI generation',
    templateVideoKey: CRAZY_FROG_TEMPLATE_KEY,
    imageCount: { min: 2, max: 2 },
    allowCustomVideo: false,
    allowTrim: false,
    keepAudio: true,
    aspectRatio: '4:3',
    /**
     * Enable after uploading the Kling-safe 960×720 template to
     * `hotel-lobby/templates/crazy-frog-v1.mp4` (see docs/assets + enablement).
     */
    enabled: false,
    promptFor: buildCrazyFrogPrompt,
  },
};

export function isHotelLobbyPresetId(
  value: unknown
): value is HotelLobbyPresetId {
  return value === HOTEL_LOBBY_PRESET_ID || value === CRAZY_FROG_PRESET_ID;
}

/**
 * Resolve a client-supplied preset. Missing/empty → hotel-lobby (legacy).
 * Unknown or disabled IDs throw HotelLobbyPreflightError.
 */
export function resolveHotelLobbyPreset(
  value: unknown,
  options?: { requireEnabled?: boolean }
): HotelLobbyPreset {
  const requireEnabled = options?.requireEnabled !== false;

  if (value == null || value === '') {
    return PRESETS[HOTEL_LOBBY_PRESET_ID];
  }

  if (!isHotelLobbyPresetId(value)) {
    throw new HotelLobbyPreflightError('Unknown generation preset');
  }

  const preset = PRESETS[value];
  if (requireEnabled && !preset.enabled) {
    throw new HotelLobbyPreflightError(
      `${preset.displayName} is not available yet`
    );
  }
  return preset;
}

/** Public meta for the generator UI (no secrets). */
export function getHotelLobbyPresetPublicMeta(preset: HotelLobbyPreset) {
  return {
    presetId: preset.id,
    version: preset.version,
    displayName: preset.displayName,
    imageCount: preset.imageCount,
    allowCustomVideo: preset.allowCustomVideo,
    allowTrim: preset.allowTrim,
    keepAudio: preset.keepAudio,
    aspectRatio: preset.aspectRatio,
    enabled: preset.enabled,
  };
}

export function displayNameForHotelLobbyPresetId(
  presetId: unknown
): string | null {
  if (!isHotelLobbyPresetId(presetId)) return null;
  return PRESETS[presetId].displayName;
}

/** Missing presetId on older tasks → Hotel Lobby. */
export function normalizeStoredPresetId(value: unknown): HotelLobbyPresetId {
  if (isHotelLobbyPresetId(value)) return value;
  return HOTEL_LOBBY_PRESET_ID;
}
