export type DemoWorkAspect = 'portrait' | 'landscape';

export type DemoWork = {
  id: string;
  result: {
    src: string;
    poster: string;
    aspect: DemoWorkAspect;
  };
  /** Paraglide message key, e.g. site.demo.cats */
  labelKey: string;
};

/**
 * Homepage example-result gallery (edited outputs for inspiration only).
 * Not used as generation inputs — see motion-templates.ts for that.
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
  },
  {
    id: 'car-drop',
    result: {
      src: '/videos/demos/car-drop.mp4',
      poster: '/videos/demos/car-drop-poster.jpg',
      aspect: 'portrait',
    },
    labelKey: 'site.demo.car',
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
