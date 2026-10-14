import { createFileRoute } from '@tanstack/react-router';
import {
  CheckCircle2,
  Download,
  Film,
  ImageIcon,
  Sparkles,
  WandSparkles,
  XCircle,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { absoluteUrl, localeLinks, ogImageUrl, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { HotelLobbyGeneratorPanel } from '@/components/landing/HotelLobbyGeneratorPanel';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SeoJsonLd } from '@/components/seo-json-ld';

const DATE_PUBLISHED = '2026-10-11';
const DATE_MODIFIED = '2026-10-11';
const GENERATOR_HREF = '#generator';
const PAGE_PATH = '/ai-rumpelstiltskin';
/** English SEO body only — do not advertise ja/ko as translated alternates. */
const SEO_LOCALES = ['en'] as const;
const COVER_PATH = '/imgs/blog/how-to-make-rumpelstiltskin-ai-video-cover.jpg';
const APP_NAME = 'Genjutsu AI';

/** Visible FAQ + FAQPage JSON-LD must stay character-identical. */
const FAQ_ITEMS = [
  {
    question: 'Is the Rumpelstiltskin 1987 clip from a real movie?',
    answer:
      "No. A Rumpelstiltskin film did come out in 1987 — a Cannon Movie Tales musical starring Billy Barty — but this barn scene isn't in it. The clip is AI-generated and first posted to Instagram in August 2026.",
  },
  {
    question: 'What is the Rumpelstiltskin dance?',
    answer:
      "It's the sly tiptoe routine from the viral clip: a little man in a velvet tuxedo creeps across a hay barn on his toes, shushes the camera, and keeps tiptoeing as straw turns to gold.",
  },
  {
    question: 'How do I make a Rumpelstiltskin AI video?',
    answer:
      "Upload one photo of yourself and open the Rumpelstiltskin template. The character, barn and film grade are pre-set, so there's no prompt to write. The clip renders in a few minutes.",
  },
  {
    question: 'Can I use the original audio?',
    answer:
      'Only if you hold rights to it. The track that made the trend spread is a commercial release. Use a cleared track, or a licensed template sound.',
  },
  {
    question: "Why does the video say 1987 if it's not from 1987?",
    answer:
      "That's the joke — and also the misinformation. The caption was written to make it look like a lost film. If you make your own, put a made-up title on the card and label it AI.",
  },
] as const;

const HOW_STEPS = [
  {
    name: 'Upload one photo',
    text: 'Full-body works best — the model needs room for the dance steps. Front-facing, face fully visible, no sunglasses or masks, one person only.',
  },
  {
    name: 'Open the Rumpelstiltskin template',
    text: 'The character, the barn, the gold and the 80s film grade are already locked in. Pick this template and you skip prompt writing entirely.',
  },
  {
    name: 'Generate and download',
    text: 'The clip renders in a few minutes in HD, with the tiptoe, the shush and the gold already choreographed. Label the result as AI when you post.',
  },
] as const;

const HAND_LOCKS = [
  {
    title: 'Lock the character first',
    text: 'One character sheet — front, side, full body — from an image model. Attach the same sheet to every shot. Face drift between shots is what happens when you skip this.',
  },
  {
    title: 'Lock the set as a still',
    text: 'Generate the barn as a photograph first — night, hay bales, one lantern, deep shadows, film look baked in. If the still looks digital, the video will too.',
  },
  {
    title: 'Animate in beats of 4–6 seconds',
    text: 'One beat per generation: the tiptoe; the stop and the finger to the lips; the woman turning; the dance. Long takes drift.',
  },
  {
    title: 'Grade it like a print, not a filter',
    text: 'Name the stock and its flaws in the prompt — "1970s fairy-tale film still, 16mm, visible grain, soft focus, light halation." Then add grain and a hint of vertical jitter in the edit.',
  },
  {
    title: 'Audio last',
    text: 'And clear it — see the rights section below.',
  },
] as const;

const RULES = [
  {
    ok: true,
    text: "Do build your own version. Rumpelstiltskin is a Brothers Grimm character from 1812 — public domain, no living person's likeness involved. Putting your own photo in it is clean.",
  },
  {
    ok: false,
    text: "Don't label it a real film. Rumpelstiltskin (1987) exists; the rights sit with Amazon MGM, and the actors and Billy Barty's estate are real people whose work you'd be misattributing. Invent a title — a fake studio and a fake year are funnier and safe.",
  },
  {
    ok: false,
    text: "Don't put real people in it. Versions starring public figures have circulated, but uploading someone else's likeness without written permission is off the table, full stop. Your photo, a friend's with permission, or nobody.",
  },
  {
    ok: false,
    text: 'Don\'t use the Riff Raff track as your audio unless you have rights to it. "Tip Toe Wing in My Jawwdinz" is a Mad Decent release, and a trending-sounds library is not a licence. Use a cleared track or a template sound you\'re licensed for.',
  },
  {
    ok: true,
    text: 'Do label it AI. Put "AI" on the same title card, not in a comment nobody reads.',
  },
] as const;

function faqJsonLd() {
  return {
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
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
    '@type': 'HowTo',
    name: 'How to make a Rumpelstiltskin AI video',
    step: HOW_STEPS.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
    })),
  };
}

function articleJsonLd() {
  const pageUrl = absoluteUrl(PAGE_PATH);
  const coverUrl = absoluteUrl(COVER_PATH);
  return {
    '@type': 'Article',
    headline:
      'AI Rumpelstiltskin: The Tip-Toe Barn Video, and How to Make Your Own',
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    about: 'Rumpelstiltskin 1987 tip-toe AI video trend',
    image: coverUrl,
    author: {
      '@type': 'Organization',
      name: APP_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: APP_NAME,
      logo: {
        '@type': 'ImageObject',
        url: ogImageUrl(),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };
}

function graphJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [articleJsonLd(), howToJsonLd(), faqJsonLd()],
  };
}

function AiRumpelstiltskinPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SeoJsonLd value={graphJsonLd()} />

      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-[260]">
          <SiteHeader />
        </div>

        <section className="mx-auto w-full max-w-7xl px-4 pt-20 pb-8 text-center sm:pt-24 md:px-5 md:pb-10">
          <div className="border-primary/20 bg-primary/10 text-primary mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
            <WandSparkles className="size-3.5" />
            {m['site.rumpel.hero_badge']()}
          </div>

          <h1 className="text-foreground mx-auto max-w-4xl text-[34px] leading-[1.08] font-bold tracking-[-1.4px] sm:text-[44px] md:text-[56px]">
            {m['site.rumpel.hero_title']()}
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-3xl text-base leading-7 sm:text-lg">
            {m['site.rumpel.hero_desc']()}
          </p>

          <div id="generator" className="mt-8 scroll-mt-24 text-left sm:mt-10">
            <HotelLobbyGeneratorPanel presetId="rumpelstiltskin" />
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-5">
        <section id="what-is" className="scroll-mt-24 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              What the Rumpelstiltskin 1987 clip actually is
            </h2>
            <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-7 sm:text-base">
              <p>
                A child-sized man with frizzy ginger hair, painted-on wrinkles,
                a black velvet tuxedo and a bow tie peeks from behind a hay
                bale, tiptoes toward the camera, raises a finger to his lips,
                dances in the straw, and turns it into a pile of gold coins.
              </p>
              <p>
                The caption says 1987. There is no such scene. The real{' '}
                <em>Rumpelstiltskin</em> (1987) was a Cannon Movie Tales musical
                shot in Israel, with Billy Barty in his only lead role — a
                feathered cap, a brown tunic, and a spinning wheel in a castle
                room. No barn. No tuxedo.
              </p>
              <p>
                The clip is AI-generated. Know Your Meme traces it to an August
                27, 2026 Instagram reel by @stroinaya, whose caption was Russian
                ad copy for an AI course and named no tool. It sat mostly
                unnoticed until late September, when someone paired it with Riff
                Raff&apos;s &quot;Tip Toe Wing in My Jawwdinz&quot; (2014) and a
                TikTok posted September 29 set off the wave. From there it went
                to X — one repost reached 11.4 million views — and spread across
                TikTok, Reels and Shorts under the hashtag
                #tiptoeinginmyjordans. Remixes swapping the imp for other faces
                arrived within three days, and half the internet went looking
                for a movie that doesn&apos;t exist.
              </p>
            </div>
            <figure className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={COVER_PATH}
                alt="Rumpelstiltskin AI tip-toe barn video trend — AI-generated 1987-style clip"
                className="h-auto w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        <section id="lost-film" className="scroll-mt-24 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Why people think it&apos;s a lost film
            </h2>
            <div className="text-muted-foreground mt-5 space-y-4 text-sm leading-7 sm:text-base">
              <p>
                Three things sell the illusion: the grain, the grade and the
                caption. Soft focus, warm saturated Technicolor, a slight gate
                weave, and a period-serif title card reading
                &quot;Rumpelstiltskin (1987)&quot; — on a clip that has no title
                card, no watermark and no credits in its source version.
              </p>
              <p>
                The tells are the usual AI ones: the imp&apos;s face geometry
                shifts between the shush and the grin, the gold arrives as an
                instant pile, and no spinning wheel ever appears.
              </p>
            </div>
          </div>
        </section>

        <section id="how-to" className="scroll-mt-24 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
              Three steps
            </p>
            <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              How to make your own Rumpelstiltskin AI video
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {HOW_STEPS.map((step, index) => {
              const icons = [ImageIcon, Film, Download] as const;
              const Icon = icons[index] ?? Sparkles;
              return (
                <div
                  key={step.name}
                  className="border-border/70 bg-card/95 rounded-2xl border p-5"
                >
                  <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-foreground mt-5 text-lg font-semibold">
                    {index + 1}. {step.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={GENERATOR_HREF}
              className="text-primary text-sm font-medium underline-offset-2 hover:underline"
            >
              {m['site.rumpel.try_generator']()}
            </Link>
          </div>
        </section>

        <section id="by-hand" className="scroll-mt-24 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              Doing it by hand: the three locks
            </h2>
            <p className="text-muted-foreground mt-5 text-sm leading-7 sm:text-base">
              If you&apos;d rather build the look yourself in any image-to-video
              model, the reconstructed method is three locks and short beats:
            </p>
            <div className="mt-8 space-y-5">
              {HAND_LOCKS.map((lock) => (
                <div key={lock.title}>
                  <h3 className="text-foreground text-lg font-semibold">
                    {lock.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-7 sm:text-base">
                    {lock.text}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-8 text-sm leading-7 sm:text-base">
              Prefer the homepage Genjutsu flow with your own template upload?
              See the step-by-step guide:{' '}
              <Link
                href="/blog/how-to-make-rumpelstiltskin-ai-video"
                className="text-primary underline-offset-2 hover:underline"
              >
                How to make a Rumpelstiltskin AI video on Genjutsu AI
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="rules" className="scroll-mt-24 py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
              What you can and can&apos;t do with this trend
            </h2>
            <ul className="mt-7 space-y-4">
              {RULES.map((rule) => (
                <li
                  key={rule.text.slice(0, 40)}
                  className="text-muted-foreground flex gap-3 text-sm leading-7 sm:text-base"
                >
                  {rule.ok ? (
                    <CheckCircle2 className="text-primary mt-0.5 size-5 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-400/80" />
                  )}
                  <span>{rule.text}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-6 text-sm leading-7">
              Full rules are in our{' '}
              <Link
                href="/terms-of-service"
                className="text-primary underline-offset-2 hover:underline"
              >
                Acceptable Use Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-14 md:py-20">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Rumpelstiltskin AI FAQ
          </h2>
          <div className="border-border/70 bg-card/60 divide-border/60 mt-7 divide-y rounded-2xl border px-5 sm:px-7">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="text-foreground/85 cursor-pointer list-none pr-6 text-sm font-semibold sm:text-base">
                  {item.question}
                </summary>
                <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-7">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="border-border/70 bg-card/60 rounded-[26px] border p-6 text-center sm:p-10">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              {m['site.rumpel.cta_title']()}
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-7">
              {m['site.rumpel.cta_desc']()}
            </p>
            <a
              href={GENERATOR_HREF}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[rgb(204,144,92)] px-6 text-sm font-semibold text-[rgb(247,246,243)] transition hover:brightness-105"
            >
              {m['site.rumpel.hero_cta']()}
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export const Route = createFileRoute('/ai-rumpelstiltskin')({
  loader: () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const { canonical, alternates } = localeLinks(
      PAGE_PATH,
      locale,
      SEO_LOCALES
    );
    const cover = absoluteUrl(COVER_PATH);
    return {
      meta: [
        { title: m['site.rumpel.page_title']() },
        { name: 'description', content: m['site.rumpel.page_description']() },
        ...socialMeta({
          title: m['site.rumpel.page_title'](),
          description: m['site.rumpel.page_description'](),
          url: canonical,
          image: cover,
        }),
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: AiRumpelstiltskinPage,
});
