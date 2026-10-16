import { createFileRoute } from '@tanstack/react-router';

import { resolveA2oLiteAiProviderTarget } from '@/modules/a2o-lite-ai/provider';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { A2oLiteAiGeneratorPanel } from '@/components/landing/A2oLiteAiGeneratorPanel';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const OG_IMAGE = '/videos/a2o-lite-ai-tpl-poster.jpg';
const PAGE_PATH = '/a2o-lite-ai';
const DATE_MODIFIED = '2026-10-16';

const FAQ_ITEMS = [
  { question: m['site.a2o.faq1_q'], answer: m['site.a2o.faq1_a'] },
  { question: m['site.a2o.faq2_q'], answer: m['site.a2o.faq2_a'] },
  { question: m['site.a2o.faq3_q'], answer: m['site.a2o.faq3_a'] },
  { question: m['site.a2o.faq4_q'], answer: m['site.a2o.faq4_a'] },
] as const;

function articleJsonLd(canonical: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: m['site.a2o.page_title'](),
    description: m['site.a2o.page_description'](),
    dateModified: DATE_MODIFIED,
    datePublished: DATE_MODIFIED,
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
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer(),
      },
    })),
  };
}

function A2oLiteAiPage() {
  const { creditProvider } = Route.useLoaderData();
  const canonical = absoluteUrl(PAGE_PATH);

  return (
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
      <SeoJsonLd value={articleJsonLd(canonical)} />
      <SeoJsonLd value={faqJsonLd()} />

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

          <section className="mx-auto max-w-3xl px-4 pb-16 md:px-5">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              {m['site.a2o.faq_title']()}
            </h2>
            <div className="mt-8 space-y-6 text-left">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question()}>
                  <h3 className="text-base font-medium text-white/88">
                    {item.question()}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {item.answer()}
                  </p>
                </div>
              ))}
            </div>
          </section>
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
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: A2oLiteAiPage,
});
