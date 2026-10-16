import assert from 'node:assert/strict';
import test from 'node:test';

import { envConfigs } from '@/config';
import {
  CRAZY_FROG_PRODUCT,
  higgsfieldSeedanceObjectsSwapTarget,
  resolveGenjutsuProviderTarget,
  resolveProductProviderTarget,
  SMALLTOWN_BOY_DANCE_PRODUCT,
} from '@/modules/genjutsu/workflow';

import {
  A2oLiteAiProviderBindingError,
  assertA2oLiteAiProviderBinding,
  resolveA2oLiteAiProviderTarget,
} from './provider';

const originalProduct = envConfigs.genjutsu_product_provider;
const originalObjectSwap = envConfigs.genjutsu_object_swap_provider;

function restore() {
  envConfigs.genjutsu_product_provider = originalProduct;
  envConfigs.genjutsu_object_swap_provider = originalObjectSwap;
}

test('A2O follows the shared objects-swap env router', () => {
  envConfigs.genjutsu_product_provider = '';
  envConfigs.genjutsu_object_swap_provider = 'seedance-wavespeed';
  try {
    const expected = resolveGenjutsuProviderTarget('objects-swap');
    assert.deepEqual(resolveA2oLiteAiProviderTarget(), expected);
    assert.equal(
      resolveA2oLiteAiProviderTarget().provider,
      'seedance-wavespeed'
    );
    assert.equal(
      resolveA2oLiteAiProviderTarget().model,
      'bytedance/seedance-2.5/video-edit'
    );
  } finally {
    restore();
  }
});

test('GENJUTSU_PRODUCT_PROVIDER overrides A2O like Crazy Frog / Smalltown', () => {
  envConfigs.genjutsu_object_swap_provider = 'seedance-wavespeed';
  envConfigs.genjutsu_product_provider = 'seedance-higgsfield';
  try {
    assert.deepEqual(
      resolveA2oLiteAiProviderTarget(),
      higgsfieldSeedanceObjectsSwapTarget()
    );
    assert.deepEqual(
      resolveA2oLiteAiProviderTarget(),
      resolveProductProviderTarget(CRAZY_FROG_PRODUCT, 'objects-swap')
    );
  } finally {
    restore();
  }
});

test('A2O tracks Crazy Frog and Smalltown under the same product override', () => {
  envConfigs.genjutsu_product_provider = 'seedance-wavespeed';
  try {
    const a2o = resolveA2oLiteAiProviderTarget();
    const crazy = resolveProductProviderTarget(
      CRAZY_FROG_PRODUCT,
      'objects-swap'
    );
    const smalltown = resolveProductProviderTarget(
      SMALLTOWN_BOY_DANCE_PRODUCT,
      'objects-swap'
    );
    assert.deepEqual(a2o, crazy);
    assert.deepEqual(a2o, smalltown);
    assert.equal(a2o.provider, 'seedance-wavespeed');
  } finally {
    restore();
  }
});

test('persisted Seedance-family bindings stay valid across env switches', () => {
  envConfigs.genjutsu_object_swap_provider = 'seedance-wavespeed';
  envConfigs.genjutsu_product_provider = '';
  try {
    const higgsfield = higgsfieldSeedanceObjectsSwapTarget();
    assert.doesNotThrow(() =>
      assertA2oLiteAiProviderBinding(higgsfield.provider, higgsfield.model)
    );
    assert.doesNotThrow(() =>
      assertA2oLiteAiProviderBinding(
        'seedance-wavespeed',
        'bytedance/seedance-2.5/video-edit'
      )
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
      () =>
        assertA2oLiteAiProviderBinding(
          'higgsfield',
          'higgsfield/genjutsu/object-swap/v1.0'
        ),
      A2oLiteAiProviderBindingError
    );
  } finally {
    restore();
  }
});
