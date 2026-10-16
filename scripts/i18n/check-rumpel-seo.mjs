#!/usr/bin/env node
/**
 * Guard editorial translations separately from Paraglide/MDX.
 *
 * Stable IDs protect against array reordering. The English source fingerprints
 * force translators to review content edits even when an existing ID is reused.
 * Update EXPECTED_ENGLISH_BLOCK_HASHES only alongside reviewed translations.
 */
import { readFile } from 'node:fs/promises';

const route = await readFile('src/routes/ai-rumpelstiltskin.tsx', 'utf8');
const translated = await readFile('src/components/landing/rumpel-seo-i18n.ts', 'utf8');
const groups = {
  faq: 'FAQ_ITEMS',
  steps: 'HOW_STEPS',
  locks: 'HAND_LOCKS',
  rules: 'RULES',
};
const EXPECTED_ENGLISH_BLOCK_HASHES = {
  "FAQ_ITEMS": "4ee29c39",
  "HOW_STEPS": "4ee719b1",
  "HAND_LOCKS": "1ab13d19",
  "RULES": "ce52576b"
};
const LOCALES = ['es', 'pt-BR', 'fr', 'de'];
const REQUIRED_SECTIONS = [
  'whatTitle', 'whatP1', 'whatP2', 'whatP3', 'imageAlt',
  'lostTitle', 'lostP1', 'lostP2', 'three', 'howTitle',
  'handTitle', 'handIntro', 'handLinkBefore', 'handLink',
  'rulesTitle', 'rulesBefore', 'rulesLink', 'faqTitle',
  'howToName', 'articleAbout',
];

let errors = 0;
function assert(ok, message) {
  if (!ok) {
    console.error('INVALID rumpel SEO: ' + message);
    errors++;
  }
}
function fingerprint(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
function jsonDeclaration(source, prefix, suffix) {
  const begin = source.indexOf(prefix);
  assert(begin !== -1, 'missing declaration ' + prefix);
  if (begin === -1) return null;
  const start = begin + prefix.length;
  const end = source.indexOf(suffix, start);
  assert(end !== -1, 'missing declaration terminator ' + suffix);
  if (end === -1) return null;
  try {
    return JSON.parse(source.slice(start, end));
  } catch (e) {
    assert(false, 'malformed JSON declaration: ' + e.message);
    return null;
  }
}
const declaredIds = jsonDeclaration(translated, 'export const RUMPEL_SEO_IDS = ', ' as const;');
const copies = jsonDeclaration(translated, 'const copies: Record<string, RumpelSeoCopy> = ', ';\nexport function getRumpelSeoCopy');

if (declaredIds && copies) {
  for (const [group, sourceName] of Object.entries(groups)) {
    const blockMatch = route.match(new RegExp('const ' + sourceName + ' = \\[([\\s\\S]*?)\\] as const;'));
    assert(!!blockMatch, 'missing source array ' + sourceName);
    if (!blockMatch) continue;
    const englishIds = [...blockMatch[1].matchAll(/\\bid:\\s*'([^']+)'/g)].map((m) => m[1]);
    const ids = declaredIds[group] ?? [];
    assert(new Set(englishIds).size === englishIds.length, sourceName + ' contains duplicate IDs');
    assert(new Set(ids).size === ids.length, group + ' contains duplicate declared IDs');
    assert(englishIds.length > 0, sourceName + ' has no keyed entries');
    assert(JSON.stringify([...englishIds].sort()) === JSON.stringify([...ids].sort()),
      sourceName + ' IDs differ from translation IDs');
    const actualHash = fingerprint(blockMatch[1].replace(/\\s+/g, ' '));
    assert(actualHash === EXPECTED_ENGLISH_BLOCK_HASHES[sourceName],
      sourceName + ' English source changed; review translations and refresh its fingerprint');
    for (const locale of LOCALES) {
      const dict = copies[locale]?.[group];
      assert(dict && typeof dict === 'object' && !Array.isArray(dict),
        locale + '/' + group + ' must be keyed by stable IDs');
      if (!dict || Array.isArray(dict)) continue;
      assert(JSON.stringify(Object.keys(dict).sort()) === JSON.stringify([...ids].sort()),
        locale + '/' + group + ' missing or extra IDs');
      for (const id of ids) {
        const value = dict[id];
        const valid = group === 'rules'
          ? typeof value === 'string' && value.trim().length > 0
          : Array.isArray(value) && value.length === 2 && value.every((s) => typeof s === 'string' && s.trim());
        assert(!!valid, locale + '/' + group + '/' + id + ' has invalid localized content');
      }
    }
  }
  for (const locale of LOCALES) {
    const sections = copies[locale]?.sections;
    assert(sections && typeof sections === 'object', locale + ' missing article sections');
    if (!sections) continue;
    assert(JSON.stringify(Object.keys(sections).sort()) === JSON.stringify([...REQUIRED_SECTIONS].sort()),
      locale + ' editorial section keys changed');
    for (const key of REQUIRED_SECTIONS) {
      assert(typeof sections[key] === 'string' && sections[key].trim().length > 0,
        locale + ' missing section ' + key);
    }
  }
}
assert(route.includes("inLanguage: getRumpelSeoCopy(getLocale()) ? getLocale() : 'en'"),
  'English editorial fallback must declare inLanguage en');
if (errors) process.exitCode = 1;
else console.log('Rumpel SEO: four locales, keyed content and English source fingerprints verified.');
