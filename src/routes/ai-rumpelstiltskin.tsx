import { createFileRoute } from '@tanstack/react-router';
import { WandSparkles } from 'lucide-react';

import { localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { RumpelstiltskinGeneratorPanel } from '@/components/landing/RumpelstiltskinGeneratorPanel';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteHeader } from '@/components/landing/SiteHeader';

function AiRumpelstiltskinPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
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
            <RumpelstiltskinGeneratorPanel />
          </div>
        </section>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 md:px-5">
        <section className="pb-20">
          <div className="border-border/70 bg-card/60 rounded-[26px] border p-6 text-center sm:p-10">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              {m['site.rumpel.cta_title']()}
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-7">
              {m['site.rumpel.cta_desc']()}
            </p>
            <a
              href="#generator"
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
      '/ai-rumpelstiltskin',
      locale
    );
    return {
      meta: [
        { title: m['site.rumpel.page_title']() },
        { name: 'description', content: m['site.rumpel.page_description']() },
        ...socialMeta({
          title: m['site.rumpel.page_title'](),
          description: m['site.rumpel.page_description'](),
          url: canonical,
        }),
      ],
      links: [{ rel: 'canonical', href: canonical }, ...alternates],
    };
  },
  component: AiRumpelstiltskinPage,
});
