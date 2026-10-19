import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateGenjutsuCredits,
  canSeeSmokeCreditPack,
  estimateGenjutsuCredits,
  estimateGenjutsuCreditsForProvider,
  estimateGenjutsuListCost,
  estimateSeedanceCredits,
  GENJUTSU_CREDIT_PACKS,
  GENJUTSU_SMOKE_CREDIT_PACK,
  getSmallestSufficientCreditPack,
  listVisibleCreditPacks,
} from './pricing';

test('public video packs reserve enough credits for each 480p preview and full', () => {
  assert.deepEqual(
    GENJUTSU_CREDIT_PACKS.map((pack) => [
      pack.id,
      pack.priceCents,
      pack.credits,
    ]),
    [
      ['starter', 999, 1050],
      ['creator', 2699, 3150],
      ['pro', 4299, 5250],
      ['studio', 7999, 10500],
    ]
  );
});

test('video bundles keep a positive expected cost margin and volume discounts', () => {
  const [starter, creator, pro, studio] = GENJUTSU_CREDIT_PACKS;
  const modelCostUsd = (credits: number) => credits / 170;
  for (const pack of GENJUTSU_CREDIT_PACKS) {
    const margin = 1 - modelCostUsd(pack.credits) / (pack.priceCents / 100);
    assert.ok(
      margin >= 0.20 && margin < 0.40,
      `unexpected ${pack.id} model-cost margin ${margin}`
    );
  }
  assert.ok(
    starter.priceCents / starter.credits > creator.priceCents / creator.credits
  );
  assert.ok(
    creator.priceCents / creator.credits > pro.priceCents / pro.credits
  );
  assert.ok(pro.priceCents / pro.credits > studio.priceCents / studio.credits);
});

test('smoke pack is only visible to gengliming emails', () => {
  assert.equal(GENJUTSU_SMOKE_CREDIT_PACK.priceCents, 100);
  assert.equal(GENJUTSU_SMOKE_CREDIT_PACK.currency, 'cny');
  assert.equal(GENJUTSU_SMOKE_CREDIT_PACK.credits, 50);
  assert.equal(canSeeSmokeCreditPack('alice@example.com'), false);
  assert.equal(canSeeSmokeCreditPack('gengliming110@gmail.com'), true);
  assert.equal(canSeeSmokeCreditPack('dev+GENGLIMING@x.com'), true);
  assert.deepEqual(
    listVisibleCreditPacks('alice@example.com').map((p) => p.id),
    ['starter', 'creator', 'pro', 'studio']
  );
  assert.deepEqual(
    listVisibleCreditPacks('gengliming110@gmail.com').map((p) => p.id),
    ['starter', 'creator', 'pro', 'studio', 'smoke']
  );
});

test('provider USD cost is converted with the 1.7x credit multiplier', () => {
  assert.equal(calculateGenjutsuCredits(3.405), 579);
});

test('fallback estimates round input duration up to a whole second', () => {
  assert.equal(
    estimateGenjutsuListCost({
      durationSeconds: 3.1,
      resolution: '480p',
    }),
    4 * 0.318
  );
  assert.equal(
    estimateGenjutsuCredits({
      durationSeconds: 3.1,
      resolution: '480p',
    }),
    217
  );
});

test('fallback estimate caps source billing at 30 seconds and supports 1080p', () => {
  assert.equal(
    estimateGenjutsuListCost({
      durationSeconds: 45,
      resolution: '1080p',
    }),
    30 * 1.632
  );
});

test('list-rate fallback for 720p max clip reserves known credits', () => {
  // Used when /estimate returns pricing_description or fails.
  assert.equal(
    calculateGenjutsuCredits(
      estimateGenjutsuListCost({
        durationSeconds: 30,
        resolution: '720p',
      })
    ),
    3474
  );
});

test('credit gate chooses the smallest pack that covers the deficit', () => {
  assert.equal(
    getSmallestSufficientCreditPack({
      balance: 310,
      requiredCredits: 1600,
      email: 'alice@example.com',
    })?.id,
    'creator'
  );
  assert.equal(
    getSmallestSufficientCreditPack({
      balance: 320,
      requiredCredits: 700,
      email: 'alice@example.com',
    })?.id,
    'starter'
  );
});

test('video-pack deficit boundaries select the smallest sufficient public pack', () => {
  const cases: Array<[number, string | null]> = [
    [1049, 'starter'],
    [1050, 'starter'],
    [1051, 'creator'],
    [3150, 'creator'],
    [3151, 'pro'],
    [5250, 'pro'],
    [5251, 'studio'],
    [10500, 'studio'],
    [10501, null],
  ];
  for (const [deficit, expected] of cases) {
    assert.equal(
      getSmallestSufficientCreditPack({
        balance: 250,
        requiredCredits: 250 + deficit,
        email: 'alice@example.com',
      })?.id ?? null,
      expected,
      `deficit ${deficit}`
    );
  }
});

test('credit gate supports the internal smoke pack and does not under-sell large deficits', () => {
  assert.equal(
    getSmallestSufficientCreditPack({
      balance: 100,
      requiredCredits: 140,
      email: 'gengliming110@gmail.com',
    })?.id,
    'smoke'
  );
  assert.equal(
    getSmallestSufficientCreditPack({
      balance: 0,
      requiredCredits: 12000,
      email: 'alice@example.com',
    }),
    null
  );
});

test('display estimator tracks selected server provider', () => {
  const input = { durationSeconds: 4.1, resolution: '720p' as const };
  assert.equal(
    estimateGenjutsuCreditsForProvider({ ...input, provider: 'higgsfield' }),
    estimateGenjutsuCredits(input)
  );
  assert.equal(
    estimateGenjutsuCreditsForProvider({ ...input, provider: 'seedance' }),
    estimateSeedanceCredits(input)
  );
  assert.equal(
    estimateGenjutsuCreditsForProvider({
      ...input,
      provider: 'seedance-volcengine',
    }),
    estimateSeedanceCredits(input)
  );
  assert.equal(
    estimateGenjutsuCreditsForProvider({
      ...input,
      provider: 'seedance-seeapi',
    }),
    estimateSeedanceCredits(input)
  );
  assert.equal(
    estimateGenjutsuCreditsForProvider({
      ...input,
      provider: 'seedance-wavespeed',
    }),
    estimateSeedanceCredits(input)
  );
  assert.notEqual(
    estimateGenjutsuCreditsForProvider({
      ...input,
      provider: 'seedance-higgsfield',
      aspectRatio: '3:4',
    }),
    estimateSeedanceCredits(input)
  );
  assert.notEqual(
    estimateGenjutsuCredits(input),
    estimateSeedanceCredits(input)
  );
});

test('Seedance early-gate estimate matches the server customer quote without whole-second rounding', () => {
  assert.equal(
    estimateSeedanceCredits({
      durationSeconds: 4.1,
      resolution: '720p',
    }),
    475
  );
  assert.equal(
    estimateSeedanceCredits({
      durationSeconds: 30,
      resolution: '1080p',
    }),
    8546
  );
});
