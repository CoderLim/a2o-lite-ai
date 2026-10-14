import assert from 'node:assert/strict';
import test from 'node:test';

import { SEEDANCE_HIGGSFIELD_MODEL } from './seedance-higgsfield';
import {
  isGenjutsuProductId,
  resolveGenjutsuProviderTarget,
  resolveProductProviderTarget,
  SMALLTOWN_BOY_DANCE_PRODUCT,
} from './workflow';

test('smalltown-boy-dance product pins seedance-higgsfield', () => {
  const target = resolveProductProviderTarget(
    SMALLTOWN_BOY_DANCE_PRODUCT,
    'objects-swap'
  );
  assert.equal(target.provider, 'seedance-higgsfield');
  assert.equal(target.model, SEEDANCE_HIGGSFIELD_MODEL);
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
  assert.equal(isGenjutsuProductId('bulin-47'), false);
  assert.equal(isGenjutsuProductId(''), false);
});
