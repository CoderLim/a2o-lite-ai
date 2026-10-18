import { createFileRoute } from '@tanstack/react-router';

import { absoluteUrl, localeLinks, socialMeta } from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Pricing } from '@/blocks/pricing';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteHeader } from '@/components/landing/SiteHeader';

const OG_IMAGE = '/imgs/generated/a2o-lite-ai-og.png';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const { canonical, alternates } = localeLinks('/pricing', locale);
    const title = m['site.pricing.standalone_meta_title']({}, { locale });
    const description = m['site.pricing.standalone_meta_desc']({}, { locale });
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
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
}
