import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { resolveA2oLiteAiProviderTarget } from '@/modules/a2o-lite-ai/provider';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { A2oLiteAiGeneratorPanel } from '@/components/landing/A2oLiteAiGeneratorPanel';
import {
  A2oLiteAiSeoSections,
  getA2oLiteAiFaqItems,
} from '@/components/landing/A2oLiteAiSeoSections';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const OG_IMAGE = '/imgs/generated/a2o-lite-ai-og.png';
const PAGE_PATH = '/';
const HERO_VIDEO_SRC = '/videos/a2o-lite-ai-tpl-v2.mp4';
const HERO_POSTER_SRC = '/videos/a2o-lite-ai-tpl-v2-poster.jpg';

/** Real NEON dance outputs shown in the Example results gallery + VideoObject. */
const A2O_EXAMPLE_CASES = [
  {
    id: 'case-01',
    src: '/videos/demos/a2o-lite-ai-case-01.mp4',
    poster: '/videos/demos/a2o-lite-ai-case-01-poster.jpg',
    duration: 'PT23S',
  },
  {
    id: 'case-02',
    src: '/videos/demos/a2o-lite-ai-case-02.mp4',
    poster: '/videos/demos/a2o-lite-ai-case-02-poster.jpg',
    duration: 'PT23S',
  },
] as const;

const A2O_DEMO_UPLOAD_DATE = '2026-10-16';

function websiteJsonLd(canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: envConfigs.app_name,
    url: canonical,
  };
}

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getA2oLiteAiFaqItems().map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function videoJsonLd() {
  const primary = A2O_EXAMPLE_CASES[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: m['site.a2o.example_title'](),
    description: m['site.a2o.example_caption'](),
    contentUrl: absoluteUrl(primary.src),
    thumbnailUrl: absoluteUrl(primary.poster),
    uploadDate: A2O_DEMO_UPLOAD_DATE,
    duration: primary.duration,
  };
}

function HomePage() {
  const { creditProvider } = Route.useLoaderData();
  const canonical = absoluteUrl(PAGE_PATH);

  return (
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
      <SeoJsonLd value={websiteJsonLd(canonical)} />
      <SeoJsonLd value={faqJsonLd()} />
      <SeoJsonLd value={videoJsonLd()} />

      <SiteHeader floating />

      <section className="relative flex min-h-svh w-full flex-col">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_POSTER_SRC})` }}
          />
          <video
            className="absolute inset-0 size-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_POSTER_SRC}
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(28_25%_9%/0.55)_0%,hsl(28_25%_9%/0.72)_45%,hsl(28_25%_9%)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(154,91,55,0.18),transparent_42%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pt-20 pb-12 text-center sm:pt-24 md:px-5 md:pb-16">
          <h1 className="mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
            {m['site.a2o.hero_title']()}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 whitespace-pre-line text-white/58 sm:text-lg">
            {m['site.a2o.hero_description']()}
          </p>

          <div id="generator" className="mt-8 text-left sm:mt-10">
            <A2oLiteAiGeneratorPanel creditProvider={creditProvider} />
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/40">
            {m['site.a2o.hero_trust']()}
          </p>
        </div>
      </section>

      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-4 pt-4 pb-14 md:px-5 md:pb-16">
          <h2 className="text-xs font-semibold tracking-[0.18em] text-[rgb(204,144,92)] uppercase">
            {m['site.a2o.example_title']()}
          </h2>
          <div className="mt-4 grid items-start gap-3 sm:grid-cols-2">
            {A2O_EXAMPLE_CASES.map((clip, index) => (
              <div
                key={clip.id}
                className="overflow-hidden rounded-[20px] border border-white/10 bg-black/25 p-2.5"
              >
                <video
                  src={clip.src}
                  poster={clip.poster}
                  title={`${m['site.a2o.example_title']()} ${index + 1}`}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full rounded-xl bg-black object-contain"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-white/34">
            {m['site.a2o.example_caption']()}
          </p>
        </section>

        <A2oLiteAiSeoSections />
      </main>

      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: () => {
    const locale = getLocale();
    const target = resolveA2oLiteAiProviderTarget();
    return { locale, creditProvider: target.provider };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['site.a2o.page_title']({}, { locale });
    const description = m['site.a2o.page_description']({}, { locale });
    const { canonical, alternates } = localeLinks(PAGE_PATH, locale);
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        ...socialMeta({
          title,
          description,
          url: canonical,
          image: absoluteUrl(OG_IMAGE),
          locale,
        }),
        {
          property: 'og:image:alt',
          content: m['site.a2o.og_image_alt']({}, { locale }),
        },
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: HomePage,
});
