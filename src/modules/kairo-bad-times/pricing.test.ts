import assert from 'node:assert/strict';
import test from 'node:test';

import {
  estimateKairoBadTimesCredits,
  estimateKairoBadTimesProviderCost,
  KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND,
} from './pricing';

test('Kairo Bad Times estimate follows published per-second rate', () => {
  assert.equal(KAIRO_BAD_TIMES_OUTPUT_RATE_USD_PER_SECOND, 0.126);
  assert.equal(estimateKairoBadTimesProviderCost({ duration: 30 }), 3.78);
  // ceil(3.78 * 100 * 1.7) = 643
  assert.equal(estimateKairoBadTimesCredits({ duration: 30 }), 643);
});

test('v2 ~29s template credits', () => {
  assert.equal(estimateKairoBadTimesProviderCost({ duration: 29 }), 3.654);
  // ceil(3.654 * 100 * 1.7) = 622
  assert.equal(estimateKairoBadTimesCredits({ duration: 29 }), 622);
});

test('4s paid preview credits', () => {
  assert.equal(estimateKairoBadTimesProviderCost({ duration: 4 }), 0.504);
  // ceil(0.504 * 100 * 1.7) = 86
  assert.equal(estimateKairoBadTimesCredits({ duration: 4 }), 86);
});

test('pet DreamActor 15s template credits ($0.05/s)', () => {
  assert.equal(
    estimateKairoBadTimesProviderCost({ duration: 15, subject: 'pet' }),
    0.75
  );
  // ceil(0.75 * 100 * 1.7) = 128
  assert.equal(
    estimateKairoBadTimesCredits({ duration: 15, subject: 'pet' }),
    128
  );
});

test('human rate unchanged when subject omitted', () => {
  assert.equal(estimateKairoBadTimesProviderCost({ duration: 15 }), 1.89);
});

test('3s template clip matches Fal rate plus Genjutsu credit markup', () => {
  assert.equal(estimateKairoBadTimesProviderCost({ duration: 3 }), 0.378);
  // ceil(0.378 * 100 * 1.7) = 65
  assert.equal(estimateKairoBadTimesCredits({ duration: 3 }), 65);
});

test('duration is constrained to the 3–30 second range', () => {
  assert.throws(() => estimateKairoBadTimesProviderCost({ duration: 2 }));
  assert.throws(() => estimateKairoBadTimesProviderCost({ duration: 31 }));
});
