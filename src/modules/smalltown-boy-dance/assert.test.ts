import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertSmalltownBoyDanceInputs,
  SmalltownBoyDancePreflightError,
} from './assert';
import {
  SMALLTOWN_DEFAULT_PROMPT,
  SMALLTOWN_PRODUCT_ID,
  SMALLTOWN_TEMPLATE_BYTES,
} from './constants';

const validOptions = {
  product: SMALLTOWN_PRODUCT_ID,
  prompt: SMALLTOWN_DEFAULT_PROMPT,
  imageKeys: ['genjutsu/a.jpg', 'genjutsu/b.jpg'],
  contentTypes: ['video/mp4', 'image/jpeg', 'image/jpeg'],
  contentLengths: [SMALLTOWN_TEMPLATE_BYTES, 1000, 1200],
};

test('accepts valid two-image template binding', () => {
  assert.doesNotThrow(() => assertSmalltownBoyDanceInputs(validOptions));
});

test('rejects wrong template byte size', () => {
  assert.throws(
    () =>
      assertSmalltownBoyDanceInputs({
        ...validOptions,
        contentLengths: [1, 1000, 1200],
      }),
    SmalltownBoyDancePreflightError
  );
});

test('rejects single image', () => {
  assert.throws(
    () =>
      assertSmalltownBoyDanceInputs({
        ...validOptions,
        imageKeys: ['only-one.jpg'],
        contentTypes: ['video/mp4', 'image/jpeg'],
        contentLengths: [SMALLTOWN_TEMPLATE_BYTES, 1000],
      }),
    SmalltownBoyDancePreflightError
  );
});

test('rejects prompt tampering', () => {
  assert.throws(
    () =>
      assertSmalltownBoyDanceInputs({
        ...validOptions,
        prompt: 'hacked prompt',
      }),
    SmalltownBoyDancePreflightError
  );
});
