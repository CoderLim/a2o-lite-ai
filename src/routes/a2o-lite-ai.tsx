import { createFileRoute } from '@tanstack/react-router';

import { resolveA2oLiteAiProviderTarget } from '@/modules/a2o-lite-ai/provider';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { A2oLiteAiGeneratorPanel } from '@/components/landing/A2oLiteAiGeneratorPanel';
import {
  A2oLiteAiSeoSections,
  getA2oLiteAiFaqItems,
  getA2oLiteAiHowToSteps,
} from '@/components/landing/A2oLiteAiSeoSections';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const OG_IMAGE = '/imgs/generated/a2o-lite-ai-og.png';
const PAGE_PATH = '/a2o-lite-ai';

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

function howToJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: m['site.a2o.seo.howto_title'](),
    totalTime: 'PT5M',
    step: getA2oLiteAiHowToSteps().map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
    })),
  };
}

function webApplicationJsonLd(canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'A2O LITE AI Video Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to try; generation uses Genjutsu AI credits',
    },
    url: canonical,
    description: m['site.a2o.page_description'](),
    image: absoluteUrl(OG_IMAGE),
  };
}

function A2oLiteAiPage() {
  const { creditProvider } = Route.useLoaderData();
  const canonical = absoluteUrl(PAGE_PATH);

  return (
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
      <SeoJsonLd value={faqJsonLd()} />
      <SeoJsonLd value={howToJsonLd()} />
      <SeoJsonLd value={webApplicationJsonLd(canonical)} />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(154,91,55,0.22),transparent_38%),linear-gradient(to_bottom,rgba(13,10,9,0.5),hsl(28_25%_9%)_78%)]" />
          <div className="absolute top-24 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[rgba(204,144,92,0.055)] blur-3xl" />
        </div>

        <div className="relative z-20">
          <SiteHeader />
        </div>

        <main className="relative z-10">
          <section className="mx-auto max-w-7xl px-4 pt-14 pb-10 text-center sm:pt-20 md:px-5 md:pb-12">
            <div className="mx-auto mb-4 flex w-fit flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-[rgba(204,144,92,0.2)] bg-[rgba(204,144,92,0.07)] px-3 py-1.5 text-xs font-medium text-[rgb(220,155,99)]">
                {m['site.a2o.hero_badge']()}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/45">
                {m['site.a2o.updated']()}
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
              {m['site.a2o.hero_title']()}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/58 sm:text-lg">
              {m['site.a2o.hero_description']()}
            </p>

            <div id="generator" className="mt-8 text-left sm:mt-10">
              <A2oLiteAiGeneratorPanel creditProvider={creditProvider} />
            </div>
          </section>

          <A2oLiteAiSeoSections />
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/a2o-lite-ai')({
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
        }),
        {
          property: 'og:image:alt',
          content: 'A2O LITE NEON dance video made from a photo',
        },
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: A2oLiteAiPage,
});
