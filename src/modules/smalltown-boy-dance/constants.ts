import type { HiggsfieldSeedanceAspectRatio } from '@/modules/genjutsu/seedance-higgsfield';
import type {
  GenjutsuMode,
  GenjutsuResolution,
} from '@/modules/genjutsu/types';
import { SMALLTOWN_BOY_DANCE_PRODUCT } from '@/modules/genjutsu/workflow';

export const SMALLTOWN_PRODUCT_ID = SMALLTOWN_BOY_DANCE_PRODUCT;

export const SMALLTOWN_MODE: GenjutsuMode = 'objects-swap';

export const SMALLTOWN_TEMPLATE_PATH = '/videos/smalltown-boy-dance-tpl.mp4';
export const SMALLTOWN_TEMPLATE_POSTER_PATH =
  '/videos/smalltown-boy-dance-tpl-poster.jpg';

/** ffprobe duration of public/videos/smalltown-boy-dance-tpl.mp4 */
export const SMALLTOWN_TEMPLATE_DURATION_SECONDS = 21.455238;

export const SMALLTOWN_ASPECT_RATIO: HiggsfieldSeedanceAspectRatio = '3:4';

/** First ship: hide 1080p — credit cost exceeds the largest single pack. */
export const SMALLTOWN_RESOLUTIONS = ['480p', '720p'] as const;
export type SmalltownResolution = (typeof SMALLTOWN_RESOLUTIONS)[number];
export const SMALLTOWN_DEFAULT_RESOLUTION: GenjutsuResolution = '720p';

export function isSmalltownResolution(
  value: unknown
): value is SmalltownResolution {
  return value === '480p' || value === '720p';
}

/**
 * Fixed dual-role prompt. @Image1 = front dancer, @Image2 = rear dancer.
 * Style mirrors Crazy Frog short imperatives for Seedance reference-to-video.
 */
export const SMALLTOWN_DEFAULT_PROMPT = [
  'Use @Video1 only for motion, timing, gestures, choreography, camera, and staging.',
  'Change the person in the front of @Video1 to be the person or character from @Image1 — do not keep the original front dancer.',
  'Change the person behind in @Video1 to be the person or character from @Image2 — do not keep the original rear dancer.',
  'Match each Image for face, hair, body, clothing, and species throughout the clip.',
  'Do not swap Image1 and Image2 or blend the two identities.',
].join(' ');
