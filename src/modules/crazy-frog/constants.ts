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
 * Fixed dual-role chase prompt for Seedance video-edit (WaveSpeed).
 * Asset tags must use a space: @Video 1 / @Image N (not @Video1 / @Image1).
 * @Image 1 = lead (plaid shirt, nearest camera); @Image 2 = pursuer (red cap,
 * dark jacket, orange bike) including the ~5–6.5s solo close-up of that rider.
 */
export const CRAZY_FROG_DEFAULT_PROMPT = [
  'Edit @Video 1. Replace BOTH original human riders with the characters from the two reference images throughout the entire video.',
  "CHARACTER 1: Replace the lead rider in the red-and-black plaid shirt, closest to the camera, with @Image 1. Use @Image 1 for the character's complete face, hair, body and clothing.",
  "CHARACTER 2: Replace the pursuing rider wearing a red cap and dark jacket on the orange motorcycle with @Image 2. Use @Image 2 for the character's complete face, hair, body and clothing, not just accessories or facial details.",
  'IMPORTANT: Around 5–6.5 seconds, the video cuts to a solo close-up of the original rider leaning forward over the orange motorcycle. This is CHARACTER 2, the SAME pursuing rider, not a new person. Replace this entire close-up rider with @Image 2 as well.',
  'Both replacement characters inherit every action, pose, movement, camera cut, occlusion, disappearance and reappearance of their corresponding original riders. Apply the replacements consistently in close-ups, wide shots and every other shot.',
  "@Video 1 provides only the original motion, timing, camera movement, vehicles, road and shot sequence. The original riders' faces, bodies and clothing must not be retained. Preserve everything else in the video.",
].join(' ');
