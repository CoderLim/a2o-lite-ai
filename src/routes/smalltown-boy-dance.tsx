import { createFileRoute } from '@tanstack/react-router';

import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SmalltownBoyDanceGeneratorPanel } from '@/components/landing/SmalltownBoyDanceGeneratorPanel';

const OG_IMAGE = '/videos/smalltown-boy-dance-tpl-poster.jpg';

function SmalltownBoyDancePage() {
  return (
    <div className="min-h-screen bg-[hsl(28_25%_9%)] text-[rgb(237,234,222)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(154,91,55,0.22),transparent_38%),linear-gradient(to_bottom,rgba(13,10,9,0.5),hsl(28_25%_9%)_78%)]" />
          <div className="absolute top-24 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[rgba(204,144,92,0.055)] blur-3xl" />
        </div>

        <div className="relative z-20">
          <SiteHeader />
        </div>

        <main className="relative z-10">
          <section className="mx-auto max-w-7xl px-4 pt-14 pb-16 text-center sm:pt-20 md:px-5">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[rgba(204,144,92,0.2)] bg-[rgba(204,144,92,0.07)] px-3 py-1.5 text-xs font-medium text-[rgb(220,155,99)]">
              {m['site.smalltown.hero_badge']()}
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
    const { canonical, alternates } = localeLinks(
      '/smalltown-boy-dance',
      locale
    );
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
