import { createFileRoute } from '@tanstack/react-router';
import { ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { HotelLobbyGeneratorPanel } from '@/components/landing/HotelLobbyGeneratorPanel';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const FAQ_ITEMS = [
  {
    question: m['site.crazy.faq1_q'],
    answer: m['site.crazy.faq1_a'],
  },
  {
    question: m['site.crazy.faq2_q'],
    answer: m['site.crazy.faq2_a'],
  },
  {
    question: m['site.crazy.faq3_q'],
    answer: m['site.crazy.faq3_a'],
  },
  {
    question: m['site.crazy.faq4_q'],
    answer: m['site.crazy.faq4_a'],
  },
  {
    question: m['site.crazy.faq5_q'],
    answer: m['site.crazy.faq5_a'],
  },
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
    name: 'How to make a Crazy Frog AI video',
    totalTime: 'PT2M',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Upload two photos',
        text: 'Use one photo for the foreground lead facing the camera, and one for the chaser behind.',
      },
      {
        '@type': 'HowToStep',
        name: 'Generate',
        text: 'The chase reference is fixed. Press generate; length follows the template.',
      },
      {
        '@type': 'HowToStep',
        name: 'Download and post',
        text: 'Download the MP4 and publish to Shorts, Reels, or TikTok with a licensed sound when required.',
      },
    ],
  };
}

function CrazyFrogAiPage() {
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
              {m['site.crazy.hero_badge']()}
            </div>

            <h1 className="mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
              {m['site.crazy.hero_title']()}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/58 sm:text-lg">
              {m['site.crazy.hero_description']()}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/40">
              {m['site.crazy.inspired_note']()}
            </p>

            <div id="generator" className="mt-8 text-left sm:mt-10">
              <HotelLobbyGeneratorPanel presetId="crazy-frog" />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-14 md:px-5 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {m['site.crazy.how_title']()}
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: m['site.crazy.step1_title'](),
                  desc: m['site.crazy.step1_desc'](),
                },
                {
                  title: m['site.crazy.step2_title'](),
                  desc: m['site.crazy.step2_desc'](),
                },
                {
                  title: m['site.crazy.step3_title'](),
                  desc: m['site.crazy.step3_desc'](),
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5 text-left"
                >
                  <h3 className="text-lg font-semibold text-white/90">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-y border-white/7 bg-white/[0.018]">
            <div className="mx-auto max-w-5xl px-4 py-14 md:px-5 md:py-20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-[rgb(220,155,99)]" />
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {m['site.crazy.faq_title']()}
                  </h2>
                  <div className="mt-8 space-y-5">
                    {FAQ_ITEMS.map((item) => (
                      <div key={item.question()}>
                        <h3 className="text-base font-semibold text-white/88">
                          {item.question()}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-white/48">
                          {item.answer()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-12 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-8 text-sm text-white/40">
              <p className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-[rgb(220,155,99)]" />
                {m['site.crazy.copyright']()}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/hotel-lobby-ai" className="hover:text-white/70">
                  Hotel Lobby AI
                </Link>
                <Link href="/pricing" className="hover:text-white/70">
                  {m['site.hotel.more4']()}
                </Link>
                <Link href="/creations" className="hover:text-white/70">
                  {m['site.hotel.more3']()}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/crazy-frog-ai')({
  loader: () => {
    const locale = getLocale();
    return {
      title: m['site.crazy.page_title']({}, { locale }),
      description: m['site.crazy.page_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? 'Crazy Frog AI';
    const description = loaderData?.description ?? '';
    const url = absoluteUrl('/crazy-frog-ai');
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        ...socialMeta({ title, description, url }),
      ],
      links: localeLinks('/crazy-frog-ai'),
    };
  },
  component: CrazyFrogAiPage,
});
