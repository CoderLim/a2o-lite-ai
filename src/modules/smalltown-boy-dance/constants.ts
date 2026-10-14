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

/** Exact byte size of the public template — used for server-side identity (I1). */
export const SMALLTOWN_TEMPLATE_BYTES = 3_018_016;

export const SMALLTOWN_ASPECT_RATIO: HiggsfieldSeedanceAspectRatio = '3:4';

export const SMALLTOWN_RESOLUTIONS = ['480p', '720p', '1080p'] as const;
export type SmalltownResolution = (typeof SMALLTOWN_RESOLUTIONS)[number];
export const SMALLTOWN_DEFAULT_RESOLUTION: GenjutsuResolution = '720p';

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

export async function loadSmalltownBoyDanceTemplateFile(): Promise<File> {
  const response = await fetch(SMALLTOWN_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error('Failed to load the Smalltown Boy Dance template video');
  }
  const blob = await response.blob();
  return new File([blob], 'smalltown-boy-dance-tpl.mp4', {
    type: blob.type || 'video/mp4',
  });
}
