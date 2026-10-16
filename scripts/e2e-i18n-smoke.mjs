import assert from 'node:assert/strict';

/** Browser-independent SSR smoke test against the running Vite E2E server. */
export async function checkLocalizedPages(baseUrl) {
  const locales = ['es', 'pt-BR', 'fr', 'de'];
  const translatedPaths = ['/', '/pricing', '/ai-rumpelstiltskin', '/terms-of-service'];

  async function htmlFor(path) {
    const response = await fetch(baseUrl + path);
    assert.equal(response.status, 200, path + ': expected HTTP 200');
    return response.text();
  }

  function canonicalTag(html) {
    return html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || '';
  }

  for (const locale of locales) {
    for (const path of translatedPaths) {
      const localPath = '/' + locale + (path === '/' ? '' : path);
      const html = await htmlFor(localPath);
      assert.ok(
        html.includes('lang="' + locale + '"') || html.includes("lang='" + locale + "'"),
        localPath + ': wrong HTML language'
      );
      const expected = baseUrl + localPath;
      assert.ok(canonicalTag(html).includes(expected),
        localPath + ': missing self canonical ' + expected + ': ' + canonicalTag(html));
    }

    for (const path of ['/text-to-image', '/bulin-47-ai']) {
      const localPath = '/' + locale + path;
      const html = await htmlFor(localPath);
      assert.ok(canonicalTag(html).includes(baseUrl + path),
        localPath + ': English editorial fallback must canonicalize to English');
      assert.ok(!/hreflang=["'](?:es|pt-BR|fr|de)["']/.test(html),
        localPath + ': English editorial fallback must not advertise translated alternates');
    }
  }

  const response = await fetch(baseUrl + '/sitemap.xml');
  assert.equal(response.status, 200);
  const xml = await response.text();
  for (const locale of locales) {
    assert.ok(xml.includes(baseUrl + '/' + locale + '/ai-rumpelstiltskin'),
      locale + ': missing translated Rumpelstiltskin sitemap entry');
    assert.ok(!xml.includes(baseUrl + '/' + locale + '/text-to-image'),
      locale + ': English text-to-image incorrectly indexed');
    assert.ok(!xml.includes(baseUrl + '/' + locale + '/bulin-47-ai'),
      locale + ': English Bulin article incorrectly indexed');
  }
  console.log('✅ i18n SSR: locales, canonical and sitemap checks passed');
}
