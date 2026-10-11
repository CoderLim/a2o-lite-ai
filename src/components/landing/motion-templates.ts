import {
  BULIN_47_DEFAULT_PROMPT,
  BULIN_47_DEFAULT_RESOLUTION,
  BULIN_47_MODE,
  BULIN_47_TEMPLATE_PATH,
  BULIN_47_TEMPLATE_POSTER_PATH,
} from '@/modules/bulin-47/constants';
import { buildHotelLobbyPrompt } from '@/modules/hotel-lobby/prompt';
import {
  RUMPEL_DEFAULT_PROMPT,
  RUMPEL_DEFAULT_RESOLUTION,
  RUMPEL_MODE,
  RUMPEL_TEMPLATE_PATH,
  RUMPEL_TEMPLATE_POSTER_PATH,
} from '@/modules/rumpelstiltskin/constants';
import {
  ZOMBIE_HUG_DEFAULT_RESOLUTION,
  ZOMBIE_HUG_MODE,
  ZOMBIE_HUG_PROMPT,
  ZOMBIE_HUG_PUBLIC_TEMPLATE_PATH,
} from '@/modules/zombie-hug/prompt';

export type MotionTemplate = {
  id: string;
  /** Paraglide message key */
  titleKey: string;
  poster: string;
  sourceVideo: string;
  prompt: string;
  mode: 'motion-transfer' | 'objects-swap';
  resolution: '480p' | '720p' | '1080p';
  /** Card preview aspect. */
  aspect: 'portrait' | 'landscape';
};

/** Served from R2 via hotel-lobby API (not a static public/ file). */
const HOTEL_LOBBY_TEMPLATE_FILE_PATH = '/api/hotel-lobby/template-file';
const HOTEL_LOBBY_TEMPLATE_PREVIEW_PATH = '/api/hotel-lobby/template';

/**
 * Homepage templates. Gallery: portraits in the left column, landscapes
 * stacked in the right column (shows every template).
 */
export const MOTION_TEMPLATES: MotionTemplate[] = [
  {
    id: 'bulin-47',
    titleKey: 'site.templates.bulin_47',
    poster: BULIN_47_TEMPLATE_POSTER_PATH,
    sourceVideo: BULIN_47_TEMPLATE_PATH,
    prompt: BULIN_47_DEFAULT_PROMPT,
    mode: BULIN_47_MODE,
    resolution: BULIN_47_DEFAULT_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'rumpelstiltskin',
    titleKey: 'site.templates.rumpelstiltskin',
    poster: RUMPEL_TEMPLATE_POSTER_PATH,
    sourceVideo: RUMPEL_TEMPLATE_PATH,
    prompt: RUMPEL_DEFAULT_PROMPT,
    mode: RUMPEL_MODE,
    resolution: RUMPEL_DEFAULT_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'hotel-lobby',
    titleKey: 'site.templates.hotel_lobby',
    poster: '/readme/hotel-lobby.jpg',
    sourceVideo: HOTEL_LOBBY_TEMPLATE_FILE_PATH,
    prompt: buildHotelLobbyPrompt(2),
    mode: 'objects-swap',
    resolution: '720p',
    aspect: 'landscape',
  },
  {
    id: 'zombie-hug',
    titleKey: 'site.templates.zombie_hug',
    poster: '/readme/zombie-hug.jpg',
    sourceVideo: ZOMBIE_HUG_PUBLIC_TEMPLATE_PATH,
    prompt: ZOMBIE_HUG_PROMPT,
    mode: ZOMBIE_HUG_MODE,
    resolution: ZOMBIE_HUG_DEFAULT_RESOLUTION,
    aspect: 'landscape',
  },
];

export function getMotionTemplatesByAspect(): {
  portraits: MotionTemplate[];
  landscapes: MotionTemplate[];
} {
  return {
    portraits: MOTION_TEMPLATES.filter((t) => t.aspect === 'portrait'),
    landscapes: MOTION_TEMPLATES.filter((t) => t.aspect === 'landscape'),
  };
}

/** Optional preview URL when it differs from the downloadable source. */
export function getMotionTemplatePreviewSrc(template: MotionTemplate): string {
  if (template.id === 'hotel-lobby') return HOTEL_LOBBY_TEMPLATE_PREVIEW_PATH;
  return template.sourceVideo;
}
