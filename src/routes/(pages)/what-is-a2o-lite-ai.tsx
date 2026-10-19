import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales } from '@/paraglide/runtime.js';
import { SeoJsonLd } from '@/components/seo-json-ld';

const PAGE_PATH = '/what-is-a2o-lite-ai';

const FAQ_KEYS = [
  { q: 'site.whatis.faq1_q', a: 'site.whatis.faq1_a' },
  { q: 'site.whatis.faq2_q', a: 'site.whatis.faq2_a' },
  { q: 'site.whatis.faq3_q', a: 'site.whatis.faq3_a' },
  { q: 'site.whatis.faq4_q', a: 'site.whatis.faq4_a' },
  { q: 'site.whatis.faq5_q', a: 'site.whatis.faq5_a' },
] as const;

function faqItems() {
  return FAQ_KEYS.map((item) => ({
    question: m[item.q](),
    answer: m[item.a](),
  }));
}

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems().map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function WhatIsA2oLiteAiPage() {
  const faq = faqItems();

  return (
    <>
      <SeoJsonLd value={faqJsonLd()} />
      <article className="space-y-10">
        <header className="border-border border-b pb-5">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            {m['site.whatis.h1']()}
          </h1>
        </header>

        <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
          <p>{m['site.whatis.intro']()}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.group_title']()}
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>{m['site.whatis.group_p1']()}</p>
            <p>{m['site.whatis.group_p2']()}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.ai_title']()}
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>{m['site.whatis.ai_p1']()}</p>
            <p>{m['site.whatis.ai_p2']()}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.mistaken_title']()}
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>{m['site.whatis.mistaken_intro']()}</p>
            <p>
              <strong className="text-foreground font-semibold">
                {m['site.whatis.mistaken_ai_group_label']()}
              </strong>{' '}
              {m['site.whatis.mistaken_ai_group_body']()}
            </p>
            <p>
              <strong className="text-foreground font-semibold">
                {m['site.whatis.mistaken_ai_sung_label']()}
              </strong>{' '}
              {m['site.whatis.mistaken_ai_sung_body']()}
            </p>
            <p>
              <strong className="text-foreground font-semibold">
                {m['site.whatis.mistaken_tool_label']()}
              </strong>{' '}
              {m['site.whatis.mistaken_tool_body']()}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.spread_title']()}
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>{m['site.whatis.spread_p1']()}</p>
            <p>{m['site.whatis.spread_p2']()}</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.not_title']()}
          </h2>
          <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-[15px] leading-7">
            <li>{m['site.whatis.not_li1']()}</li>
            <li>{m['site.whatis.not_li2']()}</li>
            <li>{m['site.whatis.not_li3']()}</li>
            <li>{m['site.whatis.not_li4']()}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.make_title']()}
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>{m['site.whatis.make_p1']()}</p>
            <p>{m['site.whatis.make_p2']()}</p>
            <p>
              {m['site.whatis.make_p3_before']()}{' '}
              <Link
                href="/#generator"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {m['site.whatis.make_p3_home']()}
              </Link>
              {m['site.whatis.make_p3_mid']()}{' '}
              <Link
                href="/pricing"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {m['site.whatis.make_p3_pricing']()}
              </Link>
              {m['site.whatis.make_p3_after']()}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {m['site.whatis.faq_title']()}
          </h2>
          <div className="divide-border divide-y rounded-xl border">
            {faq.map((item) => (
              <details key={item.question} className="group px-4 py-4 sm:px-5">
                <summary className="text-foreground cursor-pointer list-none text-sm font-semibold sm:text-base">
                  {item.question}
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-7">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}

export const Route = createFileRoute('/(pages)/what-is-a2o-lite-ai')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['site.whatis.page_title']({}, { locale }),
      description: m['site.whatis.page_description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title =
      loaderData?.title ?? m['site.whatis.page_title']({}, { locale: 'en' });
    const description =
      loaderData?.description ??
      m['site.whatis.page_description']({}, { locale: 'en' });
    const { canonical, alternates } = localeLinks(PAGE_PATH, locale, locales);
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        ...socialMeta({
          title,
          description,
          url: canonical,
          image: absoluteUrl('/imgs/generated/a2o-lite-ai-og.png'),
          locale,
        }),
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: WhatIsA2oLiteAiPage,
});
