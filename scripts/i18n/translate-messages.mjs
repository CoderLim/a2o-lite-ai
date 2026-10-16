#!/usr/bin/env node
/**
 * Incrementally translate the English Paraglide messages for one locale.
 *
 * Requires OPENAI_API_KEY and TRANSLATION_MODEL. No credentials are checked
 * into Git. Existing reviewed translations are preserved and every batch is
 * validated and checkpointed; a failed request never writes fake English.
 *
 * Usage:
 *   node scripts/i18n/translate-messages.mjs es --dry-run
 *   OPENAI_API_KEY=... TRANSLATION_MODEL=... node scripts/i18n/translate-messages.mjs es
 */
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const names = {
  es: 'Spanish (Spain / international Spanish)',
  'pt-BR': 'Brazilian Portuguese',
  fr: 'French (France)',
  de: 'German (Germany)',
};
const lang = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const sizeFlag = process.argv.find((flag) => flag.startsWith('--batch-size='));
const batchSize = sizeFlag ? Number(sizeFlag.slice('--batch-size='.length)) : 20;

if (!(lang in names) || !Number.isInteger(batchSize) || batchSize < 1 || batchSize > 40) {
  console.error('Usage: node scripts/i18n/translate-messages.mjs <es|pt-BR|fr|de> [--dry-run] [--batch-size=20]');
  process.exit(2);
}

const source = JSON.parse(await readFile('messages/en.json', 'utf8'));
const path = 'messages/' + lang + '.json';
let current;
try {
  current = JSON.parse(await readFile(path, 'utf8'));
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
  current = { $schema: source.$schema };
}

const keys = Object.keys(source).filter((k) => k !== '$schema');
const missing = keys.filter((k) => typeof current[k] !== 'string' || !current[k].trim());
console.log(names[lang] + ': ' + missing.length + ' missing messages out of ' + keys.length);
if (!missing.length || dryRun) process.exit(0);
if (!process.env.OPENAI_API_KEY || !process.env.TRANSLATION_MODEL) {
  console.error('Set OPENAI_API_KEY and TRANSLATION_MODEL before translating. --dry-run needs neither.');
  process.exit(2);
}
const endpoint = (process.env.TRANSLATION_API_BASE || 'https://api.openai.com/v1')
  .replace(/\/+$/, '') + '/chat/completions';

function symbols(value) {
  return [
    ...(value.match(/\{[A-Za-z_][A-Za-z_0-9]*\}/g) || []),
    ...(value.match(/@[Ii]mage\d+|@[Vv]ideo\d+/g) || []),
  ].sort().join('\u0000');
}

function verify(original, translated) {
  return typeof translated === 'string' &&
    translated.trim().length > 0 &&
    symbols(original) === symbols(translated);
}

async function translate(batch, attempt = 0) {
  const entries = Object.fromEntries(batch.map((k) => [k, source[k]]));
  const instructions = [
    'Translate the JSON values into fluent, natural ' + names[lang] + ' for a consumer AI video generator.',
    'Return one JSON object with EXACTLY the input keys and string values. No markdown, comments or extra keys.',
    'Preserve all brace parameters such as {count}, {name}, {resolution}, {email}, including case and spelling.',
    'Preserve literal @Image1, @Image2, @Video1 references, numbers, units, URLs, markup and formatting.',
    'Preserve Genjutsu AI, named trends, proper nouns, and model/provider names ONLY when the English source explicitly uses them in an appropriate context (for example, a comparison article).',
    'Never introduce or expose upstream backend engine/provider names in consumer-facing UI copy; follow the project policy in AGENTS.md. Prefer generic user-facing capability language for hidden implementation details.',
    'For upload guidance, simply say "upload a clear image" in the target language. Do not specifically instruct users to upload clear photos of real people or emphasize real-person faces. Keep consent and content-safety requirements when the source discusses them.',
    'Translate SEO descriptions in idiomatic marketing language without inventing capabilities or promises.',
    'Translate error messages precisely and retain payment / consent / safety meanings.',
    'Do not translate programming identifiers in the JSON keys.',
  ].join(' ');
  const payload = {
    model: process.env.TRANSLATION_MODEL,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: instructions },
      { role: 'user', content: JSON.stringify(entries) },
    ],
  };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });
    if (!res.ok) {
      const message = (await res.text()).slice(0, 500);
      throw Error('HTTP ' + res.status + ': ' + message);
    }
    const body = await res.json();
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw Error('Missing completion text');
    const translated = JSON.parse(content);
    const got = Object.keys(translated).sort();
    const want = [...batch].sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      throw Error('Model returned missing or unexpected keys');
    }
    for (const k of batch) {
      if (!verify(source[k], translated[k])) {
        throw Error('Empty translation or modified placeholder: ' + k);
      }
    }
    return translated;
  } catch (err) {
    if (attempt >= 2) throw new Error('Batch failed after three attempts: ' + err.message);
    await delay(1500 * (attempt + 1));
    return translate(batch, attempt + 1);
  }
}

async function save() {
  const next = { $schema: source.$schema };
  for (const k of keys) if (typeof current[k] === 'string') next[k] = current[k];
  await writeFile(path, JSON.stringify(next, null, 2) + '\n', 'utf8');
}

for (let i = 0; i < missing.length; i += batchSize) {
  const batch = missing.slice(i, i + batchSize);
  const result = await translate(batch);
  Object.assign(current, result);
  await save();
  console.log('Completed ' + Math.min(i + batchSize, missing.length) + '/' + missing.length);
}
console.log('Messages complete for ' + lang + '. Run check-coverage.mjs --strict and audit non-message content.');
