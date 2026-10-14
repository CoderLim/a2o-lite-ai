import {
  SMALLTOWN_DEFAULT_PROMPT,
  SMALLTOWN_PRODUCT_ID,
  SMALLTOWN_TEMPLATE_BYTES,
} from './constants';

export class SmalltownBoyDancePreflightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmalltownBoyDancePreflightError';
  }
}

type TaskOptions = {
  product?: unknown;
  prompt?: unknown;
  imageKeys?: unknown;
  contentTypes?: unknown;
  contentLengths?: unknown;
};

/**
 * Server-side product lock (I1): exactly two reference images, fixed prompt,
 * and the sealed source video byte size must match the public template.
 */
export function assertSmalltownBoyDanceInputs(options: TaskOptions | null) {
  if (!options || options.product !== SMALLTOWN_PRODUCT_ID) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance generation is missing its product binding'
    );
  }

  if (options.prompt !== SMALLTOWN_DEFAULT_PROMPT) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance prompt does not match the fixed product prompt'
    );
  }

  const imageKeys = Array.isArray(options.imageKeys) ? options.imageKeys : [];
  if (imageKeys.length !== 2) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance requires exactly two reference images (front and back)'
    );
  }

  const contentTypes = Array.isArray(options.contentTypes)
    ? options.contentTypes
    : [];
  const contentLengths = Array.isArray(options.contentLengths)
    ? options.contentLengths
    : [];

  if (contentTypes.length !== 3 || contentLengths.length !== 3) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance expects one template video plus two images'
    );
  }

  const videoType = contentTypes[0];
  if (typeof videoType !== 'string' || !videoType.startsWith('video/')) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance template must be a video'
    );
  }

  if (contentLengths[0] !== SMALLTOWN_TEMPLATE_BYTES) {
    throw new SmalltownBoyDancePreflightError(
      'Smalltown Boy Dance template does not match the fixed public template'
    );
  }

  for (let i = 1; i <= 2; i += 1) {
    const type = contentTypes[i];
    if (typeof type !== 'string' || !type.startsWith('image/')) {
      throw new SmalltownBoyDancePreflightError(
        'Smalltown Boy Dance references must be images'
      );
    }
  }
}
