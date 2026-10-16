import type { HiggsfieldSeedanceAspectRatio } from '@/modules/genjutsu/seedance-higgsfield';
import type { GenjutsuMode } from '@/modules/genjutsu/types';
import { A2O_LITE_AI_PRODUCT } from '@/modules/genjutsu/workflow';

export const A2O_LITE_AI_PRODUCT_ID = A2O_LITE_AI_PRODUCT;

export const A2O_LITE_AI_MODE: GenjutsuMode = 'objects-swap';

export const A2O_LITE_AI_TEMPLATE_PATH = '/videos/a2o-lite-ai-tpl.mp4';
export const A2O_LITE_AI_TEMPLATE_POSTER_PATH =
  '/videos/a2o-lite-ai-tpl-poster.jpg';

/** ffprobe duration of public/videos/a2o-lite-ai-tpl.mp4 */
export const A2O_LITE_AI_TEMPLATE_DURATION_SECONDS = 14.941016;

export const A2O_LITE_AI_ASPECT_RATIO: HiggsfieldSeedanceAspectRatio = '4:3';

export const A2O_LITE_AI_RESOLUTIONS = ['480p', '720p'] as const;
export type A2oLiteAiResolution = (typeof A2O_LITE_AI_RESOLUTIONS)[number];
export const A2O_LITE_AI_DEFAULT_RESOLUTION: A2oLiteAiResolution = '480p';

export function isA2oLiteAiResolution(
  value: unknown
): value is A2oLiteAiResolution {
  return value === '480p' || value === '720p';
}

/**
 * Logical references only. `buildSeedanceWorkflowPrompt` maps
 * Reference 1/2 onto the active provider's image tokens.
 * Hair color and opening depth identify the original dancers, not the
 * replacement appearance.
 */
export const A2O_LITE_AI_DEFAULT_PROMPT = [
  'In the original source video, identify two distinct dancers:',
  '',
  'Dancer A: the dancer with warmer auburn or reddish-brown hair in the original video, generally nearer the camera in the opening shots.',
  'Replace Dancer A with Reference 1.',
  '',
  'Dancer B: the dancer with darker black or dark-brown hair in the original video, generally farther from the camera in the opening shots.',
  'Replace Dancer B with Reference 2.',
  '',
  "These labels refer to the two original dancers before replacement. Keep each original dancer's role consistently assigned across solo close-ups, two-person shots, position changes, and full-body dance shots.",
  '',
  'Do not exchange the two assignments or apply one reference to both dancers.',
].join('\n');

/** Exact prompts already shipped on in-flight tasks. Empty until the first revision. */
export const LEGACY_A2O_LITE_AI_PROMPTS = [] as const;
