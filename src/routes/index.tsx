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

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(154,91,55,0.22),transparent_38%),linear-gradient(to_bottom,hsl(13,10,9,0.5),hsl(28_25%_9%)_78%)]" />
          <div className="absolute top-24 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[rgba(204,144,92,0.055)] blur-3xl" />
        </div>

        <div className="relative z-20">
          <SiteHeader />
        </div>

        <main className="relative z-10">
          <section className="mx-auto max-w-7xl px-4 pt-14 pb-10 text-center sm:pt-20 md:px-5 md:pb-12">
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
          </section>

          <section className="mx-auto max-w-5xl px-4 pb-14 md:px-5 md:pb-16">
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
    // EN-only until site.a2o.* copy is translated — avoid hollow hreflang.
    const { canonical, alternates } = localeLinks(PAGE_PATH, locale, ['en']);
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        ...socialMeta({
          title,
          description,
          url: canonical,
          image: absoluteUrl(OG_IMAGE),
        }),
        {
          property: 'og:image:alt',
          content: 'A2O LITE NEON dance video made from a photo',
        },
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: HomePage,
});
