import type { HiggsfieldSeedanceAspectRatio } from '@/modules/genjutsu/seedance-higgsfield';
import type {
  GenjutsuMode,
  GenjutsuResolution,
} from '@/modules/genjutsu/types';
import { CRAZY_FROG_PRODUCT } from '@/modules/genjutsu/workflow';

export const CRAZY_FROG_PRODUCT_ID = CRAZY_FROG_PRODUCT;

export const CRAZY_FROG_MODE: GenjutsuMode = 'objects-swap';

export const CRAZY_FROG_TEMPLATE_PATH = '/videos/crazy-frog-tpl.mp4';
export const CRAZY_FROG_TEMPLATE_POSTER_PATH =
  '/videos/crazy-frog-tpl-poster.jpg';

/** ffprobe duration of public/videos/crazy-frog-tpl.mp4 */
export const CRAZY_FROG_TEMPLATE_DURATION_SECONDS = 11.400998;

export const CRAZY_FROG_ASPECT_RATIO: HiggsfieldSeedanceAspectRatio = '4:3';

/** First ship: hide 1080p — credit cost exceeds the largest single pack. */
export const CRAZY_FROG_RESOLUTIONS = ['480p', '720p'] as const;
export type CrazyFrogResolution = (typeof CRAZY_FROG_RESOLUTIONS)[number];
export const CRAZY_FROG_DEFAULT_RESOLUTION: GenjutsuResolution = '480p';

export function isCrazyFrogResolution(
  value: unknown
): value is CrazyFrogResolution {
  return value === '480p' || value === '720p';
}

/**
 * Fixed dual-role chase prompt for Seedance video-edit.
 * @Image1 = foreground lead facing camera; @Image2 = chaser on red vehicle.
 */
export const CRAZY_FROG_DEFAULT_PROMPT = [
  'Use @Video1 only for motion, timing, gestures, camera, road, vehicle, and chase staging.',
  'Change the large foreground rider who faces the camera and points forward in @Video1 to be the person or character from @Image1 — do not keep the original foreground rider.',
  'Change the smaller person chasing behind on the red vehicle in @Video1 to be the person or character from @Image2 — do not keep the original chaser.',
  'Match each Image for face, hair, body, clothing, and species throughout the clip.',
  'Do not swap Image1 and Image2 or blend the two identities.',
].join(' ');
