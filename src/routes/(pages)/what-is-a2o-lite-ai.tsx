import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/core/i18n/navigation';
import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { SeoJsonLd } from '@/components/seo-json-ld';

const PAGE_PATH = '/what-is-a2o-lite-ai';
const PAGE_TITLE = 'What Is A2O LITE AI? The AI Part, Explained';
const PAGE_DESCRIPTION =
  'A plain answer to what "A2O LITE AI" means: the group, what the AI part of A2O actually does, and why the term spread after the NEON debut.';

/** Info-page FAQ only — distinct from the homepage FAQ set. */
const WHAT_IS_FAQ = [
  {
    question: 'Is A2O LITE an AI group?',
    answer:
      'No. Nine real members, real vocals, one AI fan-interaction feature bolted on. Those are different things.',
  },
  {
    question: 'Does "A2O LITE AI" refer to the members\' avatars?',
    answer:
      'Partly. The avatars belong to the fan-interaction service, and they are the reason the word "AI" is attached to the group at all — but the avatars are a feature, not the act.',
  },
  {
    question: 'Why do so many AI edits of the stage exist?',
    answer:
      'Because the debut briefly made the stage the most recognisable thing on short-form feeds. That is the entire explanation; there is no official AI-edits programme.',
  },
  {
    question: 'Is there an official place to find these AI clips?',
    answer:
      'No. They are fan-made and scattered across platforms, which is a large part of why the search phrase never resolved to one destination.',
  },
  {
    question: "Can I use the group's name or logo on my own site?",
    answer:
      'That is a trademark question rather than an SEO one, and the safe answer is not to. Use the name descriptively when you need to refer to the group, and avoid building a brand or domain around it.',
  },
] as const;

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: WHAT_IS_FAQ.map((item) => ({
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
  return (
    <>
      <SeoJsonLd value={faqJsonLd()} />
      <article className="space-y-10">
        <header className="border-border border-b pb-5">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
            What Is A2O LITE AI?
          </h1>
        </header>

        <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
          <p>
            Short answer: &quot;A2O LITE AI&quot; is not a product, and it is
            not a description of the group itself. It is a search phrase that
            grew out of the group&apos;s debut — a label people started using
            for the wave of AI-made edits that spread across short-form
            platforms afterwards.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            The group behind the name
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>
              A2O LITE is a girl group under A2O Entertainment, the label
              founded by Lee Soo-man. The group debuted on October 13, 2026 as a
              nine-member act with the digital single &quot;NEON.&quot;
            </p>
            <p>
              That is the whole of it as far as the name goes: A2O LITE is a
              real act with real members, and the phrase people search for is a
              later addition, not part of their official branding.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            What the &quot;AI&quot; part actually refers to
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>
              A2O&apos;s AI angle is Blooming Talk — a fan-interaction service
              built on AI avatars of the members. Through it, fans can hold
              voice and video conversations with an AI representation of a
              member.
            </p>
            <p>
              Put simply: it is a companion layer that sits on top of the group.
              It is not how the music is made, and it is not what the members
              are.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            What &quot;A2O LITE AI&quot; is often mistaken for
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>Three readings come up again and again, and all three miss.</p>
            <p>
              <strong className="text-foreground font-semibold">
                That the group is AI-generated.
              </strong>{' '}
              The members are real performers. An AI avatar of a person is a
              rendering of that person, not a substitute for them.
            </p>
            <p>
              <strong className="text-foreground font-semibold">
                That the songs are AI-sung.
              </strong>{' '}
              The records are sung by the members. The AI side project concerns
              conversations, not vocals.
            </p>
            <p>
              <strong className="text-foreground font-semibold">
                That it is a tool.
              </strong>{' '}
              It is not something you sign up for or download. It is a search
              phrase — one that, until now, had no product page attached to it.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Why the term spread so quickly
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>
              The phrase took off in the days right after the debut, when
              short-form platforms filled with AI-labelled edits of the
              &quot;NEON&quot; stage: parody montages, synthesised voice covers,
              and face swaps that dropped other people into the choreography.
            </p>
            <p>
              Those clips all shared one label. When enough of them stack up in
              the same feed, the label becomes the search — which is why a term
              nobody used a month earlier now returns a page of results that
              reads more like a trend than a product.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            What A2O LITE AI is not
          </h2>
          <ul className="text-foreground/90 list-disc space-y-2 pl-5 text-[15px] leading-7">
            <li>It is not a virtual idol group.</li>
            <li>
              It is not a voice-cloning product, and it does not offer
              members&apos; voices for reuse.
            </li>
            <li>
              It is not an official tool, and it is not affiliated with A2O
              Entertainment.
            </li>
            <li>
              It does not mean the members are less real than any other
              act&apos;s.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            Can you make an A2O LITE-style dance video?
          </h2>
          <div className="text-foreground/90 space-y-4 text-[15px] leading-7">
            <p>
              You can make a NEON-style duo dance video here, and it takes two
              photos. What it will not do is put the real members in your clip.
            </p>
            <p>
              The tool uses a fixed two-person stage template — the same
              framing, the same lighting, the same two-role choreography every
              time. Only the two faces change, and they should be your own
              photos or photos you have clear permission to use. No
              member&apos;s likeness or voice is reproduced anywhere in the
              workflow.
            </p>
            <p>
              That is the honest version of the offer: you get the stage, not
              the stars. If that is what you were looking for, the generator is{' '}
              <Link
                href="/#generator"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                on the homepage
              </Link>
              . Credit costs and available tiers are on{' '}
              <Link
                href="/pricing"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Pricing
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            A2O LITE AI FAQ
          </h2>
          <div className="divide-border divide-y rounded-xl border">
            {WHAT_IS_FAQ.map((item) => (
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
    return { locale, title: PAGE_TITLE, description: PAGE_DESCRIPTION };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = loaderData?.title ?? PAGE_TITLE;
    const description = loaderData?.description ?? PAGE_DESCRIPTION;
    const { canonical, alternates } = localeLinks(PAGE_PATH, locale, ['en']);
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        ...socialMeta({
          title,
          description,
          url: canonical,
          image: absoluteUrl('/imgs/generated/a2o-lite-ai-og.png'),
        }),
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: WhatIsA2oLiteAiPage,
});
