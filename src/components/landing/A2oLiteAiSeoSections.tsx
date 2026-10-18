import type { ReactNode } from 'react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';

const FAQ_KEYS = [
  { q: 'site.a2o.seo.faq1_q', a: 'site.a2o.seo.faq1_a' },
  { q: 'site.a2o.seo.faq2_q', a: 'site.a2o.seo.faq2_a' },
  { q: 'site.a2o.seo.faq3_q', a: 'site.a2o.seo.faq3_a' },
  { q: 'site.a2o.seo.faq4_q', a: 'site.a2o.seo.faq4_a' },
  { q: 'site.a2o.seo.faq5_q', a: 'site.a2o.seo.faq5_a' },
  { q: 'site.a2o.seo.faq6_q', a: 'site.a2o.seo.faq6_a' },
  { q: 'site.a2o.seo.faq7_q', a: 'site.a2o.seo.faq7_a' },
  { q: 'site.a2o.seo.faq8_q', a: 'site.a2o.seo.faq8_a' },
  { q: 'site.a2o.seo.faq9_q', a: 'site.a2o.seo.faq9_a' },
  { q: 'site.a2o.seo.faq10_q', a: 'site.a2o.seo.faq10_a' },
  { q: 'site.a2o.seo.faq11_q', a: 'site.a2o.seo.faq11_a' },
  { q: 'site.a2o.seo.faq12_q', a: 'site.a2o.seo.faq12_a' },
] as const;

const HOW_STEPS = [
  {
    title: () => m['site.a2o.seo.step1_title'](),
    body: () => m['site.a2o.seo.step1_body'](),
  },
  {
    title: () => m['site.a2o.seo.step2_title'](),
    body: () => m['site.a2o.seo.step2_body'](),
  },
  {
    title: () => m['site.a2o.seo.step3_title'](),
    body: () => m['site.a2o.seo.step3_body'](),
  },
] as const;

const MEANING_ITEMS = [
  {
    title: () => m['site.a2o.seo.mean_parody_title'](),
    body: () => m['site.a2o.seo.mean_parody_body'](),
  },
  {
    title: () => m['site.a2o.seo.mean_voice_title'](),
    body: () => m['site.a2o.seo.mean_voice_body'](),
  },
  {
    title: () => m['site.a2o.seo.mean_faceswap_title'](),
    body: () => m['site.a2o.seo.mean_faceswap_body'](),
  },
] as const;

const ROUTINE_ITEMS = [
  {
    title: () => m['site.a2o.seo.routines_kpop_title'](),
    body: () => m['site.a2o.seo.routines_kpop_body'](),
  },
  {
    title: () => m['site.a2o.seo.routines_random_title'](),
    body: () => m['site.a2o.seo.routines_random_body'](),
  },
  {
    title: () => m['site.a2o.seo.routines_tiktok_title'](),
    body: () => m['site.a2o.seo.routines_tiktok_body'](),
  },
] as const;

const IDEA_ITEMS = [
  {
    title: () => m['site.a2o.seo.ideas_friends_title'](),
    body: () => m['site.a2o.seo.ideas_friends_body'](),
  },
  {
    title: () => m['site.a2o.seo.ideas_pet_title'](),
    body: () => m['site.a2o.seo.ideas_pet_body'](),
  },
  {
    title: () => m['site.a2o.seo.ideas_couple_title'](),
    body: () => m['site.a2o.seo.ideas_couple_body'](),
  },
] as const;

const PHOTO_KEYS = [
  'site.a2o.seo.photos_li1',
  'site.a2o.seo.photos_li2',
  'site.a2o.seo.photos_li3',
  'site.a2o.seo.photos_li4',
  'site.a2o.seo.photos_li5',
] as const;

const RELATED_LINKS = [
  {
    label: () => m['site.a2o.seo.more_genjutsu'](),
    href: '/#generator',
  },
  {
    label: () => m['site.a2o.seo.more_kpop'](),
    href: '/#more-routines',
  },
  {
    label: () => m['site.a2o.seo.more_pricing'](),
    href: '/pricing',
  },
  {
    label: () => m['site.a2o.seo.more_whatis'](),
    href: '/what-is-a2o-lite-ai',
  },
] as const;

export function getA2oLiteAiFaqItems() {
  return FAQ_KEYS.map((item) => ({
    question: m[item.q](),
    answer: m[item.a](),
  }));
}

function Section({
  id,
  title,
  children,
  tone = 'plain',
}: {
  id?: string;
  title: string;
  children: ReactNode;
  tone?: 'plain' | 'band';
}) {
  const inner = (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-5 md:py-20">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5 max-w-3xl space-y-4 text-sm leading-7 text-white/48 sm:text-base">
        {children}
      </div>
    </div>
  );

  if (tone === 'band') {
    return (
      <section id={id} className="border-y border-white/7 bg-white/[0.018]">
        {inner}
      </section>
    );
  }

  return <section id={id}>{inner}</section>;
}

function SubBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <h3 className="text-lg font-semibold text-white/88 sm:text-xl">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-white/45 sm:text-base">
        {children}
      </div>
    </div>
  );
}

export function A2oLiteAiSeoSections() {
  return (
    <div className="text-left">
      <Section id="how-to" title={m['site.a2o.seo.howto_title']()} tone="band">
        <p>{m['site.a2o.seo.howto_intro']()}</p>
        {HOW_STEPS.map((step) => (
          <SubBlock key={step.title()} title={step.title()}>
            <p>{step.body()}</p>
          </SubBlock>
        ))}
      </Section>

      <Section title={m['site.a2o.seo.what_title']()}>
        <p>{m['site.a2o.seo.what_intro']()}</p>
        <SubBlock title={m['site.a2o.seo.what_group_title']()}>
          <p>{m['site.a2o.seo.what_group_body']()}</p>
        </SubBlock>
        <SubBlock title={m['site.a2o.seo.what_ai_title']()}>
          <p>{m['site.a2o.seo.what_ai_body']()}</p>
          <p>{m['site.a2o.seo.what_ai_not']()}</p>
        </SubBlock>
        <SubBlock title={m['site.a2o.seo.what_search_title']()}>
          <p>{m['site.a2o.seo.what_search_body']()}</p>
        </SubBlock>
        <p className="mt-8">
          {m['site.a2o.seo.what_explainer_before']()}{' '}
          <Link
            href="/what-is-a2o-lite-ai"
            className="font-medium text-[rgb(220,155,99)] underline-offset-4 hover:underline"
          >
            {m['site.a2o.seo.what_explainer_link']()}
          </Link>{' '}
          {m['site.a2o.seo.what_explainer_after']()}
        </p>
      </Section>

      <Section title={m['site.a2o.seo.mean_title']()} tone="band">
        <p>{m['site.a2o.seo.mean_intro']()}</p>
        {MEANING_ITEMS.map((item) => (
          <SubBlock key={item.title()} title={item.title()}>
            <p>{item.body()}</p>
          </SubBlock>
        ))}
        <p className="mt-8">{m['site.a2o.seo.mean_outro']()}</p>
      </Section>

      <Section id="more-routines" title={m['site.a2o.seo.routines_title']()}>
        <p>{m['site.a2o.seo.routines_intro']()}</p>
        {ROUTINE_ITEMS.map((item) => (
          <SubBlock key={item.title()} title={item.title()}>
            <p>{item.body()}</p>
          </SubBlock>
        ))}
        <p className="mt-8">
          {m['site.a2o.seo.routines_outro_before']()}{' '}
          <Link
            href="/pricing"
            className="font-medium text-[rgb(220,155,99)] underline-offset-4 hover:underline"
          >
            {m['site.a2o.seo.routines_outro_link']()}
          </Link>{' '}
          {m['site.a2o.seo.routines_outro_after']()}
        </p>
      </Section>

      <Section title={m['site.a2o.seo.distinct_title']()} tone="band">
        <p>{m['site.a2o.seo.distinct_p1']()}</p>
        <p>{m['site.a2o.seo.distinct_p2']()}</p>
      </Section>

      <Section title={m['site.a2o.seo.ideas_title']()}>
        <p>{m['site.a2o.seo.ideas_intro']()}</p>
        {IDEA_ITEMS.map((item) => (
          <SubBlock key={item.title()} title={item.title()}>
            <p>{item.body()}</p>
          </SubBlock>
        ))}
      </Section>

      <Section title={m['site.a2o.seo.photos_title']()} tone="band">
        <ul className="list-disc space-y-2 pl-5">
          {PHOTO_KEYS.map((key) => (
            <li key={key}>{m[key]()}</li>
          ))}
        </ul>
        <p>{m['site.a2o.seo.photos_outro']()}</p>
      </Section>

      <Section title={m['site.a2o.seo.permission_title']()}>
        <p>{m['site.a2o.seo.permission_p1']()}</p>
        <p>{m['site.a2o.seo.permission_p2']()}</p>
      </Section>

      <section className="border-y border-white/7 bg-white/[0.018]">
        <div className="mx-auto max-w-5xl px-4 py-14 md:px-5 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {m['site.a2o.seo.faq_title']()}
          </h2>
          <div className="mt-7 divide-y divide-white/7 rounded-2xl border border-white/8 bg-white/[0.02] px-5 sm:px-7">
            {getA2oLiteAiFaqItems().map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-white/82 sm:text-base">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-5 md:pb-16">
        <div className="rounded-[26px] border border-white/8 bg-white/[0.02] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {m['site.a2o.seo.more_title']()}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
            {m['site.a2o.seo.more_intro']()}
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/55">
            {RELATED_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-medium text-[rgb(220,155,99)] underline-offset-4 hover:underline"
                >
                  {item.label()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
