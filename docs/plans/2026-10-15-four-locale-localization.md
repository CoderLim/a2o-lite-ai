# ES / PT-BR / FR / DE localization

Status: **work in progress — do NOT merge or enable these locales yet.**

## Verified repository baseline (2026-10-15)

- Inlang / Paraglide base locale: `en`; enabled locales: `en`, `ja`, `ko`.
- English message catalog: 1,751 user-facing keys (excluding `$schema`).
- Four new language catalogs exist in `messages/{es,pt-BR,fr,de}.json`. Each initially contains 158 reviewed translations, not English placeholders.
- `src/config/locale/index.ts` contains the display labels, but Inlang deliberately does **not** advertise these languages while translation is incomplete.
- No changes to video-generation, upload, payments, ledger, API or production behavior.

## Complete the message catalog

Run with a model capable of JSON output (and a valid API key in your **local environment**, never in Git):

```bash
node scripts/i18n/check-coverage.mjs
node scripts/i18n/translate-messages.mjs es --dry-run
OPENAI_API_KEY=... TRANSLATION_MODEL=... node scripts/i18n/translate-messages.mjs es
OPENAI_API_KEY=... TRANSLATION_MODEL=... node scripts/i18n/translate-messages.mjs pt-BR
OPENAI_API_KEY=... TRANSLATION_MODEL=... node scripts/i18n/translate-messages.mjs fr
OPENAI_API_KEY=... TRANSLATION_MODEL=... node scripts/i18n/translate-messages.mjs de
node scripts/i18n/check-coverage.mjs --strict
```

This script checkpoints each successful batch. It validates message keys and `{count}` / `@Image1` / `@Video1` token preservation. It cannot guarantee linguistic quality: review all legal, policy, safety, payment and SEO strings manually.

## Full-site coverage is larger than JSON messages

**Do not launch solely on a 100% message-catalog result.** Audit and translate:

1. Main homepage SEO, generator, pricing, prompts, preview, error/loading, mobile navigation and user account settings.
2. Every trend/template route (Hotel Lobby AI, Crazy Frog AI, Kairo Bad Times, Smalltown Boy, Zombie Hug, Bulin 47, Rumpelstiltskin), including **hardcoded** JSX arrays and FAQ JSON-LD. Example: `src/routes/hotel-lobby-ai.tsx` contains hardcoded English `FAQ_ITEMS` not covered by Paraglide.
3. `/text-to-image` and other public routes with hardcoded English buttons, headings and SEO copy.
4. Markdown/MDX privacy policy, terms of service, refund policy and related legal texts. Preserve exact legal meaning; arrange human review before publication.
5. Every static blog MDX article. `src/content/posts/index.ts` registers three slugs and `getLocalPostLocales` must recognize real `<slug>.<locale>.mdx` files. Never pretend an English fallback is a translated article.
6. Hardcoded React UI, alt/aria/title/placeholder/toast strings, transaction messages, 404 and error boundaries.
7. Server-rendered metadata, FAQ JSON-LD, OpenGraph and `inLanguage`.

## Release gate

- Only after **every public route** has real translations for all four languages, update `project.inlang/settings.json` with `es`, `pt-BR`, `fr`, `de`; keep the current locales and base locale unchanged.
- Audit every `localeLinks` invocation. Supply `supportedLocales` for pages whose translations differ. Never advertise fallback English as ES/PT-BR/FR/DE.
- Update `src/routes/sitemap[.]xml.ts`: remove / modify the English-only route exclusion **only after actual translations exist**. Only emit locale URLs and reciprocal `hreflang` for real translated variants. Blog post language rows must continue to use `getLocalPostLocales`.
- Check canonical URLs, language switcher, `html lang`, `x-default`, `pt-BR` language casing, and schema JSON-LD.
- Run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test`, `pnpm format:check` and browse every new locale on representative desktop/mobile pages. This branch was not locally built because a working local checkout and dependency install were unavailable in this environment.
- Smoke-test **generation**, 4-second preview, credits estimation, buy-pack checkout, generation resume and logout under every new locale to rule out hidden language-dependent behavior.
- Review translated page layout for truncation, especially German and French long labels.
- Only then convert this draft PR to ready for review and merge.

## Why locales are not enabled yet

Paraglide falls back to English for missing messages. Enabling the four locales while catalogs are incomplete would create misleading localized URLs and `hreflang` annotations, potentially hurting SEO. The branch intentionally introduces real content and repeatable verification without deploying unfinished variants.
