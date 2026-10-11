export type DemoWorkAspect = 'portrait' | 'landscape';

export type DemoWorkRecreate = {
  mode: 'motion-transfer' | 'objects-swap';
  prompt: string;
  resolution: '480p' | '720p' | '1080p';
  /** Public URL under /videos/... */
  sourceVideo: string;
  /** Public image URLs under /videos/... or /imgs/... */
  referenceImages: string[];
};

export type DemoWork = {
  id: string;
  result: {
    src: string;
    poster: string;
    aspect: DemoWorkAspect;
  };
  /** Paraglide message key, e.g. site.demo.cats */
  labelKey: string;
  /** Present only when source + reference assets are available for recreate. */
  recreate?: DemoWorkRecreate;
};

export const PENDING_RECREATE_WORK_ID_KEY = 'genjutsu.pendingRecreateWorkId';

/**
 * Homepage showcase works. Recreate is enabled only when `recreate` is set
 * with real public media (not mismatched placeholders).
 */
export const DEMO_WORKS: DemoWork[] = [
  {
    id: 'two-cats-dance',
    result: {
      src: '/videos/demos/two-cats-dance.mp4',
      poster: '/videos/demos/two-cats-dance-poster.jpg',
      aspect: 'portrait',
    },
    labelKey: 'site.demo.cats',
    recreate: {
      mode: 'motion-transfer',
      prompt:
        'Two cats dancing together with playful energy, keep the original motion and camera, restyle the scene with warm cinematic lighting',
      resolution: '720p',
      sourceVideo: '/videos/demos/two-cats-dance.mp4',
      referenceImages: ['/videos/demos/two-cats-dance-poster.jpg'],
    },
  },
  {
    id: 'car-drop',
    result: {
      src: '/videos/demos/car-drop.mp4',
      poster: '/videos/demos/car-drop-poster.jpg',
      aspect: 'portrait',
    },
    labelKey: 'site.demo.car',
    recreate: {
      mode: 'objects-swap',
      prompt:
        'Replace the falling object with a sleek sports car while preserving the original drop motion and camera path',
      resolution: '720p',
      sourceVideo: '/videos/demos/car-drop.mp4',
      referenceImages: ['/videos/demos/car-drop-poster.jpg'],
    },
  },
  {
    id: 'cat-to-dog',
    result: {
      src: '/videos/demos/cat-to-dog.mp4',
      poster: '/videos/demos/cat-to-dog-poster.jpg',
      aspect: 'portrait',
    },
    labelKey: 'site.demo.catdog',
  },
  {
    id: 'demodemo',
    result: {
      src: '/videos/demos/demodemo.mp4',
      poster: '/videos/demos/demodemo-poster.jpg',
      aspect: 'landscape',
    },
    labelKey: 'site.demo.scene',
  },
  {
    id: 'jackson-cat',
    result: {
      src: '/videos/demos/jackson-cat.mp4',
      poster: '/videos/demos/jackson-cat-poster.jpg',
      aspect: 'landscape',
    },
    labelKey: 'site.demo.jackson',
  },
];

export function getDemoWorkById(id: string): DemoWork | undefined {
  return DEMO_WORKS.find((work) => work.id === id);
}

export function isRecreatableDemoWork(
  work: DemoWork
): work is DemoWork & { recreate: DemoWorkRecreate } {
  return Boolean(
    work.recreate &&
    work.recreate.sourceVideo &&
    work.recreate.referenceImages.length > 0
  );
}
