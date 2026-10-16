#!/usr/bin/env node
/**
 * Compare all candidate translations with English.
 *
 * Without --strict: informational coverage report; still fails on malformed
 * translations, extraneous keys, or interpolation token mismatches.
 * With --strict: also fails when any source key has no translation.
 *
 * Examples:
 *   node scripts/i18n/check-coverage.mjs
 *   node scripts/i18n/check-coverage.mjs --strict
 */
import { readFile } from 'node:fs/promises';

const languages = ['es', 'pt-BR', 'fr', 'de'];
const strict = process.argv.includes('--strict');
const source = JSON.parse(await readFile('messages/en.json', 'utf8'));
const keys = Object.keys(source).filter((key) => key !== '$schema');
const expected = new Set(keys);
let failed = false;

function symbols(value) {
  return [
    ...(value.match(/\{[A-Za-z_][A-Za-z_0-9]*\}/g) || []),
    ...(value.match(/@[Ii]mage\d+|@[Vv]ideo\d+/g) || []),
  ].sort();
}

for (const lang of languages) {
  let translated;
  try {
    translated = JSON.parse(
      await readFile(`messages/${lang}.json`, 'utf8')
    );
  } catch (error) {
    console.error(`[${lang}] missing or invalid JSON: ${error.message}`);
    failed = true;
    continue;
  }
  const missing = keys.filter((key) => typeof translated[key] !== 'string' || !translated[key].trim());
  const extra = Object.keys(translated).filter((key) => key !== '$schema' && !expected.has(key));
  const changedTokens = keys.filter(
    (key) =>
      typeof translated[key] === 'string' &&
      JSON.stringify(symbols(translated[key])) !== JSON.stringify(symbols(source[key]))
  );
  console.log(
    `[${lang}] ${keys.length - missing.length}/${keys.length} keys (${((100 * (keys.length - missing.length)) / keys.length).toFixed(1)}%) | missing=${missing.length} extra=${extra.length} token-mismatch=${changedTokens.length}`
  );
  if (missing.length) console.log(`  missing: ${missing.slice(0, 15).join(', ')}${missing.length > 15 ? '…' : ''}`);
  if (extra.length) console.error(`  extra: ${extra.join(', ')}`);
  if (changedTokens.length) console.error(`  placeholders: ${changedTokens.join(', ')}`);
  if (extra.length || changedTokens.length || (strict && missing.length)) failed = true;
}

if (failed) process.exitCode = 1;
