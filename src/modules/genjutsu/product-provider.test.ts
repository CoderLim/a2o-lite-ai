import assert from 'node:assert/strict';
import test from 'node:test';

import {
  A2O_LITE_AI_PRODUCT,
  CRAZY_FROG_PRODUCT,
  isGenjutsuProductId,
  resolveGenjutsuProviderTarget,
  resolveProductProviderTarget,
  SMALLTOWN_BOY_DANCE_PRODUCT,
} from './workflow';

test('smalltown-boy-dance follows the mode env router', () => {
  const fallback = resolveGenjutsuProviderTarget('objects-swap');
  const target = resolveProductProviderTarget(
    SMALLTOWN_BOY_DANCE_PRODUCT,
    'objects-swap'
  );
  assert.deepEqual(target, fallback);
});

test('crazy-frog follows the mode env router', () => {
  const fallback = resolveGenjutsuProviderTarget('objects-swap');
  const target = resolveProductProviderTarget(
    CRAZY_FROG_PRODUCT,
    'objects-swap'
  );
  assert.deepEqual(target, fallback);
});

test('unknown product falls back to mode env router', () => {
  const fallback = resolveGenjutsuProviderTarget('objects-swap');
  const viaProduct = resolveProductProviderTarget(
    'not-a-product',
    'objects-swap'
  );
  assert.deepEqual(viaProduct, fallback);
});

test('missing product falls back to mode env router', () => {
  const fallback = resolveGenjutsuProviderTarget('motion-transfer');
  assert.deepEqual(
    resolveProductProviderTarget(undefined, 'motion-transfer'),
    fallback
  );
  assert.deepEqual(
    resolveProductProviderTarget(null, 'motion-transfer'),
    fallback
  );
});

test('isGenjutsuProductId allowlist', () => {
  assert.equal(isGenjutsuProductId(SMALLTOWN_BOY_DANCE_PRODUCT), true);
  assert.equal(isGenjutsuProductId(CRAZY_FROG_PRODUCT), true);
  assert.equal(isGenjutsuProductId(A2O_LITE_AI_PRODUCT), true);
  assert.equal(isGenjutsuProductId('bulin-47'), false);
  assert.equal(isGenjutsuProductId(''), false);
});
