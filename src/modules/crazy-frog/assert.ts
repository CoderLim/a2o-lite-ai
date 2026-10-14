import {
  CRAZY_FROG_ASPECT_RATIO,
  CRAZY_FROG_DEFAULT_PROMPT,
  CRAZY_FROG_PRODUCT_ID,
  isCrazyFrogResolution,
} from './constants';

export class CrazyFrogPreflightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CrazyFrogPreflightError';
  }
}

type TaskOptions = {
  product?: unknown;
  prompt?: unknown;
  imageKeys?: unknown;
  contentTypes?: unknown;
  contentLengths?: unknown;
  useDefaultTemplate?: unknown;
  aspectRatio?: unknown;
  resolution?: unknown;
};

/**
 * Server-side product lock: fixed server R2 template (useDefaultTemplate),
 * exactly two reference images (lead then chaser), fixed prompt + 4:3 aspect.
 */
export function assertCrazyFrogInputs(options: TaskOptions | null) {
  if (!options || options.product !== CRAZY_FROG_PRODUCT_ID) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog generation is missing its product binding'
    );
  }

  if (options.useDefaultTemplate !== true) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog must use the server-controlled template'
    );
  }

  if (options.prompt !== CRAZY_FROG_DEFAULT_PROMPT) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog prompt does not match the fixed product prompt'
    );
  }

  if (options.aspectRatio !== CRAZY_FROG_ASPECT_RATIO) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog requires a fixed 4:3 aspect ratio'
    );
  }

  if (
    options.resolution != null &&
    !isCrazyFrogResolution(options.resolution)
  ) {
    throw new CrazyFrogPreflightError('Crazy Frog only supports 480p and 720p');
  }

  const imageKeys = Array.isArray(options.imageKeys) ? options.imageKeys : [];
  if (imageKeys.length !== 2) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog requires exactly two reference images (lead and chaser)'
    );
  }

  const contentTypes = Array.isArray(options.contentTypes)
    ? options.contentTypes
    : [];
  const contentLengths = Array.isArray(options.contentLengths)
    ? options.contentLengths
    : [];

  if (contentTypes.length !== 2 || contentLengths.length !== 2) {
    throw new CrazyFrogPreflightError(
      'Crazy Frog expects exactly two reference images (template is server-owned)'
    );
  }

  for (let i = 0; i < 2; i += 1) {
    const type = contentTypes[i];
    if (typeof type !== 'string' || !type.startsWith('image/')) {
      throw new CrazyFrogPreflightError('Crazy Frog references must be images');
    }
  }
}
