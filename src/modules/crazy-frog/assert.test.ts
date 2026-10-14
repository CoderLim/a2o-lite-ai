import assert from 'node:assert/strict';
import test from 'node:test';

import { assertCrazyFrogInputs, CrazyFrogPreflightError } from './assert';
import {
  CRAZY_FROG_ASPECT_RATIO,
  CRAZY_FROG_DEFAULT_PROMPT,
  CRAZY_FROG_PRODUCT_ID,
} from './constants';

const validOptions = {
  product: CRAZY_FROG_PRODUCT_ID,
  prompt: CRAZY_FROG_DEFAULT_PROMPT,
  useDefaultTemplate: true,
  aspectRatio: CRAZY_FROG_ASPECT_RATIO,
  resolution: '720p',
  imageKeys: ['genjutsu/u/g/reference-01.jpg', 'genjutsu/u/g/reference-02.jpg'],
  contentTypes: ['image/jpeg', 'image/jpeg'],
  contentLengths: [1000, 1200],
};

test('accepts server-template binding with two images', () => {
  assert.doesNotThrow(() => assertCrazyFrogInputs(validOptions));
});

test('rejects client-uploaded video path (no useDefaultTemplate)', () => {
  assert.throws(
    () =>
      assertCrazyFrogInputs({
        ...validOptions,
        useDefaultTemplate: false,
        contentTypes: ['video/mp4', 'image/jpeg', 'image/jpeg'],
        contentLengths: [3_620_755, 1000, 1200],
      }),
    CrazyFrogPreflightError
  );
});

test('rejects single image', () => {
  assert.throws(
    () =>
      assertCrazyFrogInputs({
        ...validOptions,
        imageKeys: ['only-one.jpg'],
        contentTypes: ['image/jpeg'],
        contentLengths: [1000],
      }),
    CrazyFrogPreflightError
  );
});

test('rejects prompt tampering', () => {
  assert.throws(
    () =>
      assertCrazyFrogInputs({
        ...validOptions,
        prompt: 'hacked prompt',
      }),
    CrazyFrogPreflightError
  );
});

test('rejects wrong aspect ratio', () => {
  assert.throws(
    () =>
      assertCrazyFrogInputs({
        ...validOptions,
        aspectRatio: '16:9',
      }),
    CrazyFrogPreflightError
  );
});

test('rejects 1080p', () => {
  assert.throws(
    () =>
      assertCrazyFrogInputs({
        ...validOptions,
        resolution: '1080p',
      }),
    CrazyFrogPreflightError
  );
});
