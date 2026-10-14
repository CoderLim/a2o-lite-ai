import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FAL_INPUT_MIRROR_FAILED_PREFIX,
  falInputMirrorFailureMessage,
  mirrorHttpUrlToFalCdn,
} from './fal-storage';

test('falInputMirrorFailureMessage uses stable refundable prefix', () => {
  assert.equal(
    falInputMirrorFailureMessage('put HTTP 500'),
    `${FAL_INPUT_MIRROR_FAILED_PREFIX}put HTTP 500`
  );
});

test('mirrorHttpUrlToFalCdn initiates then PUTs source bytes', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; method?: string }> = [];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, method: init?.method });

    if (url.includes('/storage/upload/initiate')) {
      return new Response(
        JSON.stringify({
          upload_url: 'https://upload.example/put',
          file_url: 'https://v3.fal.media/files/demo.mp4',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (url === 'https://source.example/video.mp4') {
      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { 'Content-Type': 'video/mp4' },
      });
    }
    if (url === 'https://upload.example/put') {
      assert.equal(init?.method, 'PUT');
      return new Response(null, { status: 200 });
    }
    throw new Error(`unexpected fetch: ${url}`);
  }) as typeof fetch;

  try {
    const fileUrl = await mirrorHttpUrlToFalCdn({
      apiKey: 'test-key',
      sourceUrl: 'https://source.example/video.mp4',
      fileName: 'reference-video.mp4',
      contentType: 'video/mp4',
    });
    assert.equal(fileUrl, 'https://v3.fal.media/files/demo.mp4');
    assert.equal(calls.length, 3);
    assert.match(calls[0].url, /storage\/upload\/initiate/);
    assert.equal(calls[1].url, 'https://source.example/video.mp4');
    assert.equal(calls[2].url, 'https://upload.example/put');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('mirrorHttpUrlToFalCdn marks initiate failures for refund', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response('nope', { status: 401 })) as typeof fetch;

  try {
    await assert.rejects(
      () =>
        mirrorHttpUrlToFalCdn({
          apiKey: 'bad',
          sourceUrl: 'https://source.example/video.mp4',
          fileName: 'reference-video.mp4',
          contentType: 'video/mp4',
        }),
      (error: unknown) =>
        error instanceof Error &&
        error.message.startsWith(FAL_INPUT_MIRROR_FAILED_PREFIX)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
