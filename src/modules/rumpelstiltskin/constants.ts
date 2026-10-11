import type { GenjutsuMode } from '@/modules/genjutsu/types';

export const RUMPEL_MODE: GenjutsuMode = 'objects-swap';

export const RUMPEL_TEMPLATE_PATH = '/videos/rumpelstiltskin-tpl.mp4';
export const RUMPEL_TEMPLATE_POSTER_PATH =
  '/videos/rumpelstiltskin-tpl-poster.jpg';

/** Browser-metadata duration of public/videos/rumpelstiltskin-tpl.mp4 (ffprobe). */
export const RUMPEL_TEMPLATE_DURATION_SECONDS = 9.3;

export const RUMPEL_RESOLUTIONS = ['480p', '720p', '1080p'] as const;
export type RumpelResolution = (typeof RUMPEL_RESOLUTIONS)[number];
export const RUMPEL_DEFAULT_RESOLUTION: RumpelResolution = '720p';

/**
 * Fixed Objects Swap prompt for the Rumpelstiltskin tiptoe preset.
 * Keep the barn staging; replace only the dancer with @Image1.
 */
export const RUMPEL_DEFAULT_PROMPT =
  'Replace the dancer in @Video1 with the subject in @Image1. Keep the original shush gesture, barn set, camera path, and tiptoe timing. Use only this authorized likeness.';

export async function loadRumpelTemplateFile(): Promise<File> {
  const response = await fetch(RUMPEL_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error('Failed to load the Rumpelstiltskin template video');
  }
  const blob = await response.blob();
  return new File([blob], 'rumpelstiltskin-tpl.mp4', {
    type: blob.type || 'video/mp4',
  });
}
