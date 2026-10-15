import { createFileRoute } from '@tanstack/react-router';
import { Film, Images, Sparkles, WandSparkles } from 'lucide-react';

import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { KairoBadTimesGeneratorPanel } from '@/components/landing/KairoBadTimesGeneratorPanel';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const OG_IMAGE = '/videos/kairo-bad-times-tpl-poster.jpg';

const FAQ_ITEMS = [
  { question: m['site.kairo.faq1_q'], answer: m['site.kairo.faq1_a'] },
  { question: m['site.kairo.faq2_q'], answer: m['site.kairo.faq2_a'] },
  { question: m['site.kairo.faq3_q'], answer: m['site.kairo.faq3_a'] },
  { question: m['site.kairo.faq4_q'], answer: m['site.kairo.faq4_a'] },
  { question: m['site.kairo.faq5_q'], answer: m['site.kairo.faq5_a'] },
] as const;

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

function howToJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: m['site.kairo.how_title'](),
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        name: m['site.kairo.step1_title'](),
        text: m['site.kairo.step1_desc'](),
      },
      {
        '@type': 'HowToStep',
        name: m['site.kairo.step2_title'](),
        text: m['site.kairo.step2_desc'](),
      },
      {
        '@type': 'HowToStep',
        name: m['site.kairo.step3_title'](),
        text: m['site.kairo.step3_desc'](),
      },
    ],
  };
}

function KairoBadTimesPage() {
  return (
    <div className="min-h-screen bg-[hsl(220_18%_8%)] text-[rgb(232,236,242)]">
      <SeoJsonLd value={faqJsonLd()} />
      <SeoJsonLd value={howToJsonLd()} />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(88,120,180,0.18),transparent_42%),linear-gradient(to_bottom,rgba(10,14,22,0.55),hsl(220_18%_8%)_80%)]" />
          <div className="absolute top-20 left-1/2 h-[380px] w-[820px] -translate-x-1/2 rounded-full bg-[rgba(96,140,210,0.06)] blur-3xl" />
        </div>

        <div className="relative z-20">
          <SiteHeader />
        </div>

        <main className="relative z-10">
          <section className="mx-auto max-w-5xl px-4 pt-8 pb-10 text-center sm:pt-12 md:px-5 md:pb-12">
            <div className="mx-auto mb-3 flex w-fit items-center gap-2 rounded-full border border-[rgba(120,160,220,0.22)] bg-[rgba(120,160,220,0.08)] px-3 py-1.5 text-xs font-medium text-[rgb(170,200,240)]">
              <WandSparkles className="size-3.5" />
              {m['site.kairo.hero_badge']()}
            </div>

            <h1 className="mx-auto max-w-4xl text-[28px] leading-[1.08] font-bold tracking-[-1.2px] sm:text-[36px] md:text-[44px]">
              {m['site.kairo.hero_title']()}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
              {m['site.kairo.hero_description']()}
            </p>

            <div id="generator" className="mt-6 text-left">
              <KairoBadTimesGeneratorPanel />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-14 md:px-5 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {m['site.kairo.how_title']()}
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Images,
                  title: m['site.kairo.step1_title'],
                  desc: m['site.kairo.step1_desc'],
                },
                {
                  icon: Film,
                  title: m['site.kairo.step2_title'],
                  desc: m['site.kairo.step2_desc'],
                },
                {
                  icon: Sparkles,
                  title: m['site.kairo.step3_title'],
                  desc: m['site.kairo.step3_desc'],
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title()}
                    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-left"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(120,160,220,0.12)] text-[rgb(170,200,240)]">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-white/90">
                      {step.title()}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {step.desc()}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-y border-white/7 bg-white/[0.018]">
            <div className="mx-auto max-w-3xl px-4 py-14 md:px-5 md:py-20">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {m['site.kairo.faq_title']()}
              </h2>
              <div className="mt-8 space-y-5">
                {FAQ_ITEMS.map((item) => (
                  <div key={item.question()}>
                    <h3 className="text-base font-semibold text-white/88">
                      {item.question()}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/48">
                      {item.answer()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/kairo-bad-times')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['site.kairo.page_title']({}, { locale });
    const description = m['site.kairo.page_description']({}, { locale });
    const { canonical, alternates } = localeLinks('/kairo-bad-times', locale);
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
  component: KairoBadTimesPage,
});
