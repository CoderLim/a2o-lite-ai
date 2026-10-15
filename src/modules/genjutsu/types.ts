export type GenjutsuMode = 'motion-transfer' | 'objects-swap';

export type GenjutsuResolution = '480p' | '720p' | '1080p';

export type GenjutsuProvider =
  | 'higgsfield'
  | 'seedance'
  | 'seedance-volcengine'
  | 'seedance-higgsfield'
  | 'seedance-seeapi';

/** Allowlisted product ids that pin a provider target on attempt. */
export type GenjutsuProductId = 'smalltown-boy-dance' | 'crazy-frog';

export type GenjutsuProviderTarget = {
  provider: GenjutsuProvider;
  model: string;
};
