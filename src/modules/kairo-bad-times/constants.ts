/** Product / billing scene identifier. */
export const KAIRO_BAD_TIMES_PRODUCT_ID = 'kairo-bad-times';

export const KAIRO_BAD_TIMES_SCENE = 'kairo-bad-times';
export const KAIRO_BAD_TIMES_PROVIDER = 'fal';

/** Fal Motion Control — server-only model id. */
export const KAIRO_BAD_TIMES_MODEL =
  'fal-ai/kling-video/v3/standard/motion-control';

/** FalProvider requires a non-empty prompt. */
export const KAIRO_BAD_TIMES_FIXED_PROMPT =
  'A character performing the reference motion.';

export const KAIRO_BAD_TIMES_CHARACTER_ORIENTATION = 'video' as const;
export const KAIRO_BAD_TIMES_KEEP_ORIGINAL_SOUND = true;

/** Local seed source (Node dev only). */
export const KAIRO_BAD_TIMES_LOCAL_TEMPLATE_PATH =
  'public/videos/kairo-bad-times-tpl.mp4';

/** Public static preview paths (no provider branding). */
export const KAIRO_BAD_TIMES_PREVIEW_PATH = '/videos/kairo-bad-times-tpl.mp4';
export const KAIRO_BAD_TIMES_POSTER_PATH =
  '/videos/kairo-bad-times-tpl-poster.jpg';

/** Versioned R2 key — bump when the master clip changes (v2 = ~29s source). */
export const KAIRO_BAD_TIMES_DEFAULT_TEMPLATE_VIDEO_KEY =
  'kairo-bad-times/templates/v2.mp4';
