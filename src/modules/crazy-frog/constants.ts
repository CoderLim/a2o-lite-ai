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
 * dark jacket, orange bike) including the mid-clip solo close-up of that rider.
 */
export const CRAZY_FROG_DEFAULT_PROMPT = [
  'Edit @Video 1. Replace BOTH original riders with the two reference identities throughout the entire video.',
  "CHARACTER 1: Replace the lead rider in the red-and-black plaid shirt, closest to the camera, with @Image 1. Use @Image 1 for this rider's complete identity: face, hair, body, clothing, and overall appearance.",
  "CHARACTER 2: Replace the pursuing rider wearing a red cap and dark jacket on the orange motorcycle with @Image 2. Use @Image 2 for this rider's complete identity in every appearance: face, hair, body, clothing, and overall appearance. Do not only transfer accessories, glasses, or minor facial traits.",
  'IMPORTANT: The pursuing rider is always CHARACTER 2 — even when far away, small in the frame, partially visible, temporarily occluded, or shown in a solo close-up. Every appearance of the pursuing rider must be replaced with @Image 2. Do not leave the pursuing rider as the original person in any frame.',
  'In the middle of the video, there is a solo close-up of the rider leaning forward over the orange motorcycle. This is CHARACTER 2, the SAME pursuing rider, not a new person, and must be fully replaced with @Image 2.',
  'Keep CHARACTER 1 and CHARACTER 2 visually distinct and consistent. Never swap, merge, or confuse the two identities. Both replacement characters inherit every action, pose, movement, camera cut, occlusion, disappearance, and reappearance of their corresponding original riders.',
  'Use @Video 1 only for motion, timing, camera movement, road, vehicles, chase choreography, perspective, and shot sequence. Preserve the original action and environment, but replace both original riders completely.',
].join(' ');
