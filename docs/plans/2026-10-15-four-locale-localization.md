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


## Progress audit (2026-10-15, follow-up) — SUPERSEDED

> Historical snapshot only. The missing Terms of Service and three English blog translations listed below **were resolved on 2026-10-16**; the main branch added a fourth English blog post, which is also now translated. Do not use this earlier section as a current blocker list.

- All four `messages/*.json` catalogs now contain 1,751/1,751 source message keys. This indicates key presence, **not certified translation quality**. A token scan found no missing interpolation placeholders in those catalogs.
- The four localized privacy policy and refund policy MDX files are present.
- All four `terms-of-service.<locale>.mdx` files are **still missing**. Do not enable locale URLs for the legal terms until translated and checked for legal equivalence.
- Three bundled English blog articles have no translated `es`, `pt-BR`, `fr`, or `de` MDX equivalents (12 files missing).
- `scripts/i18n/check-content.mjs --strict` now tests these non-JSON gaps; keep it in the release gate, alongside `check-coverage.mjs --strict`.
- Further audit hardcoded English in `src/routes/text-to-image.tsx` and verify public trend pages. Locale registration in `project.inlang/settings.json` remains disabled intentionally.
- Inherited English messaging may be inaccurate: `site.seo.faq2_a` claims human faces are always rejected even though some trend routes offer real-person substitutions; reconcile this against current provider and moderation policy before publishing translations.

**Do not merge this PR as a complete localization without resolving these points and running build + browser checks.**


## Update: content translations and editorial SEO (2026-10-16)

- All **4 translated Terms of Service** MDX files are now included. These are translations of the existing English policy; they still require human legal review. In particular, the original restrictions on real-human reference photos may not match some currently supported trend generators.
- All **12 translated blog MDX articles** are included (Higgsfield Alternative, Bulin 47, Rumpelstiltskin × ES/PT-BR/FR/DE). Video source paths, metadata dates, supported prompt references and heading counts have been checked against the English originals.
- The Rumpelstiltskin editorial page now has per-language long-form copy, translated FAQ and HowTo schema metadata in `src/components/landing/rumpel-seo-i18n.ts`. The published English original remains the fallback for languages without a complete editorial translation.
- Sitemap restricts `/text-to-image` to English because its interface, SEO metadata and supporting sections remain hardcoded in English; the Rumpelstiltskin route emits alternates only after those languages are activated. Blog sitemap entries are restricted to enabled locales, even when translated MDX drafts exist.
- **Do not enable ES/PT-BR/FR/DE yet** without verifying hardcoded landing-page UI, correcting contradictory legal/FAQ statements, and passing a full build + visual/browser test.

## Synchronization and strict CI (2026-10-16)

- Merged `main` at `e3db39a3dab32ce753fd8908715b5e0b1723456e` into the Draft PR branch without force-push. This retains its original commit history and includes the latest templates, video files, original Burning Bridges article, and JA/KO editions. After the sync, the branch was 0 commits behind that `main` snapshot. This was a **merge sync, not a rewritten-history rebase**.
- Added **Burning Bridges** local blog translations (`es`, `pt-BR`, `fr`, `de`), bringing local blog article variants to 16 files across four blogs.
- New source message keys `site.templates.dog_kick_bottle` and `site.templates.3_meters_above_the_sky` plus the renamed gas-station-dance label were updated in all four translation catalogs: **1,753 / 1,753** keys. No interpolation or asset-reference token mismatches found in cross-language review.
- Added `.github/workflows/i18n-coverage.yaml` to enforce `check-coverage.mjs --strict` and `check-content.mjs --strict` on pull requests touching translation content. This is a new guard, not a claim that full Vite build or browser smoke tests passed.
- Revised `translate-messages.mjs` so future model translations must not introduce internal backend engine names into consumer-facing UI. External-provider names may still be appropriate in explicit comparison articles.
- **Remaining gates:** reconcile the English `site.seo.faq2_a` and legal human-face policies with the actual consent-based model capabilities, then propagate approved English source changes into four languages; audit hardcoded English in `/text-to-image` and remaining specialized routes; manually review legal translations; successfully complete `pnpm build`, unit/E2E tests and per-locale browser SEO smoke tests; only then activate locales, update sitemap/hreflang and consider merge.
