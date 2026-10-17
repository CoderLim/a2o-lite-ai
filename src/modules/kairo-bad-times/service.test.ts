import assert from 'node:assert/strict';
import test from 'node:test';

import {
  friendlyKairoBadTimesProviderError,
  isKairoBadTimesRefundableProviderFailure,
} from './service';

test('content policy / model moderation is refundable', () => {
  const falBody =
    '{"detail":[{"loc":["body"],"msg":"The content could not be processed because it contained material flagged by a content checker.","type":"content_policy_violation","url":"https://docs.fal.ai/errors#content_policy_violation","input":"","categories":["model_moderated"]}]}';
  assert.equal(isKairoBadTimesRefundableProviderFailure(falBody), true);
  assert.match(
    friendlyKairoBadTimesProviderError(falBody),
    /content|policy|moderated|photo/i
  );
});

test('input rejection patterns remain refundable', () => {
  assert.equal(
    isKairoBadTimesRefundableProviderFailure(
      'ValidationError: input_value_error — input was rejected'
    ),
    true
  );
  assert.equal(
    isKairoBadTimesRefundableProviderFailure(
      'No complete upper body detected in the image'
    ),
    true
  );
});

test('ambiguous lookup failures are not auto-refundable', () => {
  assert.equal(
    isKairoBadTimesRefundableProviderFailure('request failed with status: 404'),
    false
  );
  assert.equal(
    isKairoBadTimesRefundableProviderFailure(
      'Provider status lookup failed permanently. Credits remain reserved.'
    ),
    false
  );
});
