#!/usr/bin/env node
/** Audit localized MDX content before activating new locales.
 * node scripts/i18n/check-content.mjs [--strict]
 */
import { readFile, readdir } from 'node:fs/promises';

const locales = ['es', 'pt-BR', 'fr', 'de'];
const pages = ['privacy-policy', 'terms-of-service', 'refund-policy'];
const blogDir = 'src/content/posts';
const pageDir = 'src/content/pages';
const strict = process.argv.includes('--strict');
const files = await readdir(blogDir);
const blogSlugs = files.filter((n) => n.endsWith('.en.mdx')).map((n) => n.slice(0, -7));
let missing = 0;
let invalid = 0;

async function check(base, slug, locale) {
  const path = base + '/' + slug + '.' + locale + '.mdx';
  let content;
  try { content = await readFile(path, 'utf8'); }
  catch (err) {
    if (err.code === 'ENOENT') {
      missing++;
      console.log('MISSING: ' + path);
      return;
    }
    throw err;
  }
  if (!/export const meta\s*=\s*\{/.test(content)
      || !/\btitle\s*:/.test(content)
      || !/\bdescription\s*:/.test(content)
      || !/^#{2,3}\s+\S/m.test(content)
      || /TODO_TRANSLATE|TRANSLATION_PLACEHOLDER/.test(content)) {
    invalid++;
    console.error('INVALID: ' + path);
  }
}

for (const locale of locales) {
  for (const page of pages) await check(pageDir, page, locale);
  for (const slug of blogSlugs) await check(blogDir, slug, locale);
}
console.log('Locales: ' + locales.length + '; legal pages: ' + pages.length
  + '; blog posts: ' + blogSlugs.length + '; missing: ' + missing + '; invalid: ' + invalid);
if (invalid || (strict && missing)) process.exitCode = 1;
