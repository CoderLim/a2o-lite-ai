import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';

/**
 * Per-path locale lists. Only advertise language versions that have real
 * translated content (not English fallbacks under a locale prefix).
 * Homepage / what-is are EN-only until a2o copy is translated.
 */
const STATIC_PATHS: { path: string; locales: readonly string[] }[] = [
  { path: '', locales: ['en'] },
  { path: '/pricing', locales },
  { path: '/what-is-a2o-lite-ai', locales: ['en'] },
  { path: '/privacy-policy', locales },
  { path: '/terms-of-service', locales },
  { path: '/refund-policy', locales },
];

type Entry = {
  path: string;
  locale: string;
  alternateLocales?: string[];
  lastModified?: string;
  changeFrequency: string;
  priority: number;
};

/** Prefer the request host so prod never emits a baked localhost URL. */
function siteOrigin(request: Request): string {
  try {
    return new URL(request.url).origin;
  } catch {
    return envConfigs.app_url || 'http://localhost:3000';
  }
}

function urlFor(origin: string, path: string, locale: string): string {
  return localizeUrl(`${origin}${path || '/'}`, {
    locale: locale as (typeof locales)[number],
  }).href;
}

function entryXml(origin: string, e: Entry): string {
  const alternateLocales = e.alternateLocales ?? [];
  const alternates =
    alternateLocales.length <= 1
      ? ''
      : [
          ...alternateLocales.map(
            (loc) =>
              `    <xhtml:link rel="alternate" hreflang="${loc}" href="${urlFor(origin, e.path, loc)}"/>`
          ),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(origin, e.path, alternateLocales[0])}"/>`,
        ].join('\n');

  return [
    '  <url>',
    `    <loc>${urlFor(origin, e.path, e.locale)}</loc>`,
    alternates || null,
    e.lastModified ? `    <lastmod>${e.lastModified}</lastmod>` : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
    '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = siteOrigin(request);
        const entries: Entry[] = STATIC_PATHS.flatMap((item) =>
          item.locales.map((locale) => ({
            path: item.path,
            locale,
            alternateLocales: [...item.locales],
            changeFrequency: 'weekly',
            priority: item.path === '' ? 1 : 0.8,
          }))
        );

        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.map((e) => entryXml(origin, e)),
          '</urlset>',
        ].join('\n');

        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
