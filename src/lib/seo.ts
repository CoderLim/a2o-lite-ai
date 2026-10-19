import { envConfigs } from '@/config';
import { locales, localizeUrl } from '@/paraglide/runtime.js';

/** Absolute URL for social/share cards. Prefer raster over SVG. */
export function absoluteUrl(path = '/'): string {
  const base = envConfigs.app_url || 'http://localhost:3000';
  return new URL(path, base).href;
}

export function ogImageUrl(): string {
  return absoluteUrl(envConfigs.app_logo || '/logo.webp');
}

/** Open Graph locale tags (underscore form). */
const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  'pt-BR': 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
};

export function ogLocaleTag(locale: string): string {
  return OG_LOCALE_MAP[locale] ?? locale.replace('-', '_');
}

/** Shared Open Graph + Twitter tags for a public page. */
export function socialMeta(opts: {
  title: string;
  description: string;
  url?: string;
  image?: string;
  locale?: string;
  alternateLocales?: readonly string[];
}) {
  const image = opts.image || ogImageUrl();
  const locale = opts.locale ?? 'en';
  const alternateLocales = (opts.alternateLocales ?? locales).filter(
    (loc) => loc !== locale
  );
  return [
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: opts.title },
    { property: 'og:description', content: opts.description },
    { property: 'og:image', content: image },
    { property: 'og:locale', content: ogLocaleTag(locale) },
    ...alternateLocales.map((loc) => ({
      property: 'og:locale:alternate',
      content: ogLocaleTag(loc),
    })),
    ...(opts.url ? [{ property: 'og:url', content: opts.url }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: opts.title },
    { name: 'twitter:description', content: opts.description },
    { name: 'twitter:image', content: image },
  ];
}

/** Auth / account surfaces — keep out of the public index. */
export function noIndexMeta() {
  return [{ name: 'robots', content: 'noindex, nofollow' }];
}

/**
 * Canonical + hreflang alternate links for a locale-free path.
 * Limit supportedLocales to real translated versions for content-backed pages.
 * Missing translations may render an English fallback, but must not advertise
 * that fallback as a separate language version in search results.
 */
export function localeLinks(
  path: string,
  locale: string,
  supportedLocales: readonly string[] = locales
) {
  const available = locales.filter((loc) => supportedLocales.includes(loc));
  const canonicalLocale = available.includes(locale as (typeof locales)[number])
    ? locale
    : available.includes('en')
      ? 'en'
      : (available[0] ?? 'en');
  const urlFor = (loc: string) =>
    localizeUrl(absoluteUrl(path || '/'), {
      locale: loc as (typeof locales)[number],
    }).href;
  const defaultLocale = available.includes('en') ? 'en' : available[0]!;
  return {
    canonical: urlFor(canonicalLocale),
    alternates:
      available.length > 1
        ? [
            ...available.map((loc) => ({
              rel: 'alternate' as const,
              hrefLang: loc,
              href: urlFor(loc),
            })),
            {
              rel: 'alternate' as const,
              hrefLang: 'x-default',
              href: urlFor(defaultLocale),
            },
          ]
        : [],
  };
}
