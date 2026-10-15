import { createFileRoute } from '@tanstack/react-router';
import { Film, Images, Sparkles, WandSparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
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

const EXPLORE_LINKS = [
  [m['site.crazy.more_hotel'], '/hotel-lobby-ai'],
  [m['site.crazy.more_zombie'], '/ai-zombie-hug'],
  [m['site.crazy.more_bulin'], '/bulin-47-ai'],
  [m['site.crazy.more_genjutsu'], '/'],
  [m['site.crazy.more_pricing'], '/pricing'],
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
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
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
          <section className="mx-auto max-w-7xl px-4 pt-14 pb-12 text-center sm:pt-20 md:px-5 md:pb-16">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[rgba(204,144,92,0.2)] bg-[rgba(204,144,92,0.07)] px-3 py-1.5 text-xs font-medium text-[rgb(220,155,99)]">
              <WandSparkles className="size-3.5" />
              {m['site.kairo.hero_badge']()}
            </div>

            <h1 className="mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
              {m['site.kairo.hero_title']()}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/58 sm:text-lg">
              {m['site.kairo.hero_description']()}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/40">
              {m['site.kairo.inspired_note']()}
            </p>

            <div id="generator" className="mt-8 text-left sm:mt-10">
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
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(204,144,92,0.1)] text-[rgb(220,155,99)]">
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
            <div className="mx-auto max-w-5xl px-4 py-14 md:px-5 md:py-20">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {m['site.kairo.faq_title']()}
              </h2>
              <div className="mt-7 divide-y divide-white/7 rounded-2xl border border-white/8 bg-white/[0.02] px-5 sm:px-7">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question()} className="group py-5">
                    <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-white/82 sm:text-base">
                      {item.question()}
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
                      {item.answer()}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-16 md:px-5">
            <div className="rounded-[26px] border border-white/8 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                {m['site.crazy.explore_title']()}
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {EXPLORE_LINKS.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-[rgba(204,144,92,0.35)] hover:text-[rgb(220,155,99)]"
                  >
                    {label()}
                  </Link>
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
