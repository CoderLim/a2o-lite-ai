import { createFileRoute } from '@tanstack/react-router';

import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SmalltownBoyDanceGeneratorPanel } from '@/components/landing/SmalltownBoyDanceGeneratorPanel';
import {
  getSmalltownBoyDanceFaqItems,
  SmalltownBoyDanceSeoSections,
} from '@/components/landing/SmalltownBoyDanceSeoSections';
import { SeoJsonLd } from '@/components/seo-json-ld';

const OG_IMAGE = '/videos/smalltown-boy-dance-tpl-poster.jpg';
const PAGE_PATH = '/smalltown-boy-dance';
const DATE_MODIFIED = '2026-10-14';

function articleJsonLd(canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: m['site.smalltown.page_title'](),
    description: m['site.smalltown.page_description'](),
    dateModified: DATE_MODIFIED,
    datePublished: '2026-10-14',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    image: absoluteUrl(OG_IMAGE),
    author: {
      '@type': 'Organization',
      name: 'Genjutsu',
    },
  };
}

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getSmalltownBoyDanceFaqItems().map((item) => ({
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
    name: m['site.smalltown.seo.howto_title'](),
    description: m['site.smalltown.seo.howto_intro'](),
    step: [
      {
        '@type': 'HowToStep',
        name: m['site.smalltown.seo.step1_title'](),
        text: m['site.smalltown.seo.step1_body'](),
        image: absoluteUrl(
          '/images/smalltown-boy-dance/smalltown-boy-dance-moves-step-1.jpg'
        ),
      },
      {
        '@type': 'HowToStep',
        name: m['site.smalltown.seo.step2_title'](),
        text: m['site.smalltown.seo.step2_body'](),
        image: absoluteUrl(
          '/images/smalltown-boy-dance/smalltown-boy-dance-moves-step-2.jpg'
        ),
      },
      {
        '@type': 'HowToStep',
        name: m['site.smalltown.seo.step3_title'](),
        text: m['site.smalltown.seo.step3_body'](),
        image: absoluteUrl(
          '/images/smalltown-boy-dance/smalltown-boy-dance-moves-step-3.jpg'
        ),
      },
      {
        '@type': 'HowToStep',
        name: m['site.smalltown.seo.step4_title'](),
        text: m['site.smalltown.seo.step4_body'](),
        image: absoluteUrl(
          '/images/smalltown-boy-dance/smalltown-boy-dance-moves-step-4.jpg'
        ),
      },
      {
        '@type': 'HowToStep',
        name: m['site.smalltown.seo.step5_title'](),
        text: m['site.smalltown.seo.step5_body'](),
        image: absoluteUrl(
          '/images/smalltown-boy-dance/smalltown-boy-dance-moves-step-5.jpg'
        ),
      },
    ],
  };
}

function SmalltownBoyDancePage() {
  const canonical = absoluteUrl(PAGE_PATH);

  return (
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
      <SeoJsonLd value={articleJsonLd(canonical)} />
      <SeoJsonLd value={faqJsonLd()} />
      <SeoJsonLd value={howToJsonLd()} />

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
                {m['site.smalltown.hero_badge']()}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/45">
                {m['site.smalltown.updated']()}
              </span>
            </div>

            <h1 className="mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
              {m['site.smalltown.hero_title']()}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/58 sm:text-lg">
              {m['site.smalltown.hero_description']()}
            </p>

            <div id="generator" className="mt-8 text-left sm:mt-10">
              <SmalltownBoyDanceGeneratorPanel />
            </div>
          </section>

          <SmalltownBoyDanceSeoSections />
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/smalltown-boy-dance')({
  loader: () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['site.smalltown.page_title']({}, { locale });
    const description = m['site.smalltown.page_description']({}, { locale });
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
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: SmalltownBoyDancePage,
});
