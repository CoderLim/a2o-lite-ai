import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertCheckoutProductAllowed,
  getPricingProduct,
  listPricingProducts,
} from './pricing';

test('V1 server checkout resolves exactly four public USD packs', () => {
  const publicProducts = listPricingProducts('buyer@example.com');
  assert.deepEqual(
    publicProducts.map(({ productId, priceInCents, credits }) => [
      productId,
      priceInCents,
      credits,
    ]),
    [
      ['starter', 499, 400],
      ['creator', 999, 850],
      ['pro', 1999, 1750],
      ['studio', 3999, 3600],
    ]
  );
  assert.ok(publicProducts.every((p) => p.currency === 'usd'));
  assert.equal(getPricingProduct('mini'), null);
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
