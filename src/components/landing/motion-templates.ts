import { buildHotelLobbyPrompt } from '@/modules/hotel-lobby/prompt';
import {
  ZOMBIE_HUG_DEFAULT_RESOLUTION,
  ZOMBIE_HUG_MODE,
  ZOMBIE_HUG_PROMPT,
  ZOMBIE_HUG_PUBLIC_TEMPLATE_PATH_9X16,
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

const DEFAULT_OBJECTS_RESOLUTION = '720p' as const;

/**
 * Homepage motion templates. Aspect follows the source clip
 * (portrait 9:16 / landscape 16:9) for gallery layout.
 * Kling O3 product pages (Crazy Frog, Rumpelstiltskin, Bulin 47) are not
 * listed here — Recreate would send them through Genjutsu.
 */
export const MOTION_TEMPLATES: MotionTemplate[] = [
  {
    id: 'zombie-hug',
    titleKey: 'site.templates.zombie_hug',
    poster: '/readme/zombie-hug.jpg',
    sourceVideo: ZOMBIE_HUG_PUBLIC_TEMPLATE_PATH_9X16,
    prompt: ZOMBIE_HUG_PROMPT,
    mode: ZOMBIE_HUG_MODE,
    resolution: ZOMBIE_HUG_DEFAULT_RESOLUTION,
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
    id: 'cat-to-dog',
    titleKey: 'site.templates.cat_to_dog',
    poster: '/videos/cat-to-dog-tpl-poster.jpg',
    sourceVideo: '/videos/cat-to-dog-tpl.mp4',
    prompt:
      'Replace the cat in @Video1 with the subject in @Image1. Keep the original motion, camera path, lighting, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'cat-fight',
    titleKey: 'site.templates.cat_fight',
    poster: '/videos/cat-fight-tpl-poster.jpg',
    sourceVideo: '/videos/cat-fight-tpl.mp4',
    prompt:
      'Replace the cats in @Video1 with the subject in @Image1. Keep the fight choreography, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'landscape',
  },
  {
    id: 'bruce-li-dog',
    titleKey: 'site.templates.bruce_li_dog',
    poster: '/videos/bruce-li-dog-tpl-poster.jpg',
    sourceVideo: '/videos/bruce-li-dog-tpl.mp4',
    prompt:
      'Replace the dog in @Video1 with the subject in @Image1. Keep the kung-fu moves, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'cat-jackson',
    titleKey: 'site.templates.cat_jackson',
    poster: '/videos/cat-jackson-tpl-poster.jpg',
    sourceVideo: '/videos/cat-jackson-tpl.mp4',
    prompt:
      'Replace the dancing cat in @Video1 with the subject in @Image1. Keep the dance moves, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'landscape',
  },
  {
    id: 'car-drop',
    titleKey: 'site.templates.car_drop',
    poster: '/videos/car-drop-tpl-poster.jpg',
    sourceVideo: '/videos/car-drop-tpl.mp4',
    prompt:
      'Replace the car in @Video1 with the subject in @Image1. Keep the drop motion, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'two-cats-dance',
    titleKey: 'site.templates.two_cats_dance',
    poster: '/videos/two-cats-dance-tpl-poster.jpg',
    sourceVideo: '/videos/two-cats-dance-tpl.mp4',
    prompt:
      'Replace the cats in @Video1 with the subject in @Image1. Keep the dance moves, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'dog-two-girl-dance',
    titleKey: 'site.templates.dog_two_girl_dance',
    poster: '/videos/dog-two-girl-dance-tpl-poster.jpg',
    sourceVideo: '/videos/dog-two-girl-dance-tpl.mp4',
    prompt:
      'Replace the puppy in @Video1 with the animal in @Image1. Keep the two girls dancing, camera path, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
  {
    id: 'long-trival',
    titleKey: 'site.templates.long_trival',
    poster: '/videos/long-trival-tpl-poster.jpg',
    sourceVideo: '/videos/long-trival-tpl.mp4',
    prompt:
      'Replace the man in @Video1 with the subject in @Image1. Keep the long-travel vibe, camera path, lighting, and timing. Use only this authorized likeness.',
    mode: 'objects-swap',
    resolution: DEFAULT_OBJECTS_RESOLUTION,
    aspect: 'portrait',
  },
];

/** Optional preview URL when it differs from the downloadable source. */
export function getMotionTemplatePreviewSrc(template: MotionTemplate): string {
  if (template.id === 'hotel-lobby') return HOTEL_LOBBY_TEMPLATE_PREVIEW_PATH;
  return template.sourceVideo;
}
