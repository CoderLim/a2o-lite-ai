import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateGenjutsuCredits } from './pricing';
import {
  buildHiggsfieldSeedancePayload,
  clampHiggsfieldSeedanceDurationSeconds,
  estimateHiggsfieldSeedanceProviderCost,
  estimateHiggsfieldSeedanceTokenCost,
  higgsfieldSeedanceOutputDimensions,
} from './seedance-higgsfield';

test('Higgsfield Seedance 3:4 720p maps to 720×960', () => {
  assert.deepEqual(higgsfieldSeedanceOutputDimensions('720p', '3:4'), {
    width: 720,
    height: 960,
  });
});

test('duration clamps to integer 4–30', () => {
  assert.equal(clampHiggsfieldSeedanceDurationSeconds(21.455), 21);
  assert.equal(clampHiggsfieldSeedanceDurationSeconds(3.2), 4);
  assert.equal(clampHiggsfieldSeedanceDurationSeconds(40), 30);
});

test('token quote for 21.46s + 21s at 720×960 matches review ballpark', () => {
  const quote = estimateHiggsfieldSeedanceTokenCost({
    resolution: '720p',
    aspectRatio: '3:4',
    sourceDurationSeconds: 21.455238,
    outputDurationSeconds: 21,
  });
  // ceil(720*960*(21.455238+21)*24/1024) * 0.01284 / 1000 ≈ $8.83
  assert.ok(quote.providerCostUsd > 8.5 && quote.providerCostUsd < 9.2);
  const credits = calculateGenjutsuCredits(quote.providerCostUsd);
  assert.ok(credits > 1400 && credits < 1600);
});

test('provider cost estimate uses token source tag', () => {
  const estimate = estimateHiggsfieldSeedanceProviderCost({
    resolution: '720p',
    aspectRatio: '3:4',
    sourceDurationSeconds: 21.455238,
  });
  assert.equal(estimate.source, 'higgsfield_seedance_token_estimate');
  assert.equal(estimate.payload.aspectRatio, '3:4');
  assert.ok(!('task' in (estimate.payload as object)));
});

test('objects-swap uses video-edit payload shape (no duration/aspect)', () => {
  const payload = buildHiggsfieldSeedancePayload({
    mode: 'objects-swap',
    resolution: '720p',
    aspectRatio: '3:4',
    prompt: 'Change front to @Image1 and rear to @Image2.',
    videoUrl: 'https://example.com/template.mp4',
    imageUrls: [
      'https://example.com/front.jpg',
      'https://example.com/back.jpg',
    ],
    sourceDurationSeconds: 21.455238,
  });

  assert.equal(payload.video_url, 'https://example.com/template.mp4');
  assert.equal(payload.bitrate_mode, 'high');
  assert.equal(payload.generate_audio, true);
  assert.equal(payload.image_urls.length, 2);
  assert.equal((payload as { duration?: unknown }).duration, undefined);
  assert.equal((payload as { aspect_ratio?: unknown }).aspect_ratio, undefined);
  assert.equal((payload as { video_urls?: unknown }).video_urls, undefined);
  assert.equal((payload as { task?: unknown }).task, undefined);
  assert.match(payload.prompt, /^Edit @Video1/);
  assert.match(payload.prompt, /@Image1/);
  assert.match(payload.prompt, /@Image2/);
});

test('motion-transfer keeps reference-to-video payload shape', () => {
  const payload = buildHiggsfieldSeedancePayload({
    mode: 'motion-transfer',
    resolution: '720p',
    aspectRatio: '3:4',
    prompt: 'Use @Image1 for the lead dancer.',
    videoUrl: 'https://example.com/template.mp4',
    imageUrls: ['https://example.com/front.jpg'],
    sourceDurationSeconds: 21.455238,
  });

  assert.equal(payload.duration, 21);
  assert.equal(payload.aspect_ratio, '3:4');
  assert.deepEqual(payload.video_urls, ['https://example.com/template.mp4']);
  assert.equal((payload as { video_url?: unknown }).video_url, undefined);
});
