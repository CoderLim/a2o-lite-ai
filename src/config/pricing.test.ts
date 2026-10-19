import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCheckoutProductAllowed,
  getPricingProduct,
  listPricingProducts,
} from './pricing';

test('server checkout resolves four public one-time 480p video bundles', () => {
  const publicProducts = listPricingProducts('buyer@example.com');
  assert.deepEqual(
    publicProducts.map(({ productId, priceInCents, credits }) => [
      productId,
      priceInCents,
      credits,
    ]),
    [
      ['starter', 999, 1050],
      ['creator', 2699, 3150],
      ['pro', 4299, 5250],
      ['studio', 7999, 10500],
    ]
  );
  assert.ok(publicProducts.every((p) => p.currency === 'usd'));
  assert.equal(getPricingProduct('mini'), null);
  assert.match(getPricingProduct('starter')?.productName || '', /1 480p Video/);
  assert.match(getPricingProduct('studio')?.description || '', /10 480p/);
});

test('retired Mini purchases are unavailable for NEW checkout', () => {
  assert.equal(getPricingProduct('mini'), null);
  assert.equal(getPricingProduct('not-a-product'), null);
});

test('internal smoke checkout remains access-controlled', () => {
  assert.throws(
    () => assertCheckoutProductAllowed('smoke', 'buyer@example.com'),
    /not available/
  );
  assert.doesNotThrow(() =>
    assertCheckoutProductAllowed('smoke', 'gengliming110@example.com')
  );
  assert.equal(getPricingProduct('smoke')?.credits, 50);
});
