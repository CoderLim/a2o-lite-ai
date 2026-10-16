import assert from 'node:assert/strict';
import test from 'node:test';

import { envConfigs } from '@/config';
import {
  CRAZY_FROG_PRODUCT,
  higgsfieldSeedanceObjectsSwapTarget,
  resolveProductProviderTarget,
  SMALLTOWN_BOY_DANCE_PRODUCT,
} from '@/modules/genjutsu/workflow';

import {
  A2oLiteAiProviderBindingError,
  A2oLiteAiProviderConfigError,
  assertA2oLiteAiProviderBinding,
  resolveA2oLiteAiProviderTarget,
} from './provider';

const original = envConfigs.genjutsu_product_provider;

function restore() {
  envConfigs.genjutsu_product_provider = original;
}

test('unset product provider uses the Higgsfield Seedance video-edit pair', () => {
  envConfigs.genjutsu_product_provider = '';
  try {
    assert.deepEqual(
      resolveA2oLiteAiProviderTarget(),
      higgsfieldSeedanceObjectsSwapTarget()
    );
    assert.deepEqual(resolveA2oLiteAiProviderTarget(), {
      provider: 'seedance-higgsfield',
      model: 'bytedance/seedance-2.5/video-edit',
    });
  } finally {
    restore();
  }
});

test('explicit seedance-higgsfield stays on the same pair', () => {
  envConfigs.genjutsu_product_provider = 'seedance-higgsfield';
  try {
    assert.deepEqual(
      resolveA2oLiteAiProviderTarget(),
      higgsfieldSeedanceObjectsSwapTarget()
    );
  } finally {
    restore();
  }
});

test('unsupported and unknown providers are rejected without a silent higgsfield model', () => {
  for (const value of [
    'seedance',
    'higgsfield',
    'seedance-wavespeed',
    'seedance-seeapi',
    'seedance-volcengine',
    'not-a-provider',
  ]) {
    envConfigs.genjutsu_product_provider = value;
    assert.throws(
      () => resolveA2oLiteAiProviderTarget(),
      A2oLiteAiProviderConfigError
    );
  }
  restore();
});

test('persisted binding must match the video-edit pair', () => {
  const expected = higgsfieldSeedanceObjectsSwapTarget();
  assert.doesNotThrow(() =>
    assertA2oLiteAiProviderBinding(expected.provider, expected.model)
  );
  assert.throws(
    () =>
      assertA2oLiteAiProviderBinding(
        'seedance-higgsfield',
        'higgsfield/genjutsu/object-swap/v1.0'
      ),
    A2oLiteAiProviderBindingError
  );
  assert.throws(
    () => assertA2oLiteAiProviderBinding('higgsfield', expected.model),
    A2oLiteAiProviderBindingError
  );
});

test('A2O provider env does not change Crazy Frog or Smalltown routing', () => {
  envConfigs.genjutsu_product_provider = 'seedance-wavespeed';
  try {
    const crazy = resolveProductProviderTarget(
      CRAZY_FROG_PRODUCT,
      'objects-swap'
    );
    const smalltown = resolveProductProviderTarget(
      SMALLTOWN_BOY_DANCE_PRODUCT,
      'objects-swap'
    );
    assert.equal(crazy.provider, 'seedance-wavespeed');
    assert.equal(smalltown.provider, 'seedance-wavespeed');
    assert.throws(
      () => resolveA2oLiteAiProviderTarget(),
      A2oLiteAiProviderConfigError
    );
  } finally {
    restore();
  }
});
