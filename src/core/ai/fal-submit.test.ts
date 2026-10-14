import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyFalSubmitFailure,
  falQueueQueryModel,
  isDefiniteFalSubmitRejection,
  isFalDefiniteInputRejection,
  isTransientFalHttpStatus,
  parseFalHttpStatusFromError,
} from './fal';
import { falInputMirrorFailureMessage } from './fal-storage';

test('classifies definite 4xx submit rejections as refundable', () => {
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 400'),
    'refund'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 401'),
    'refund'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 403'),
    'refund'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 404'),
    'refund'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 422'),
    'refund'
  );
});

test('classifies Failed to load video / mirror failures as refundable', () => {
  const loadVideoError = JSON.stringify({
    detail: [
      {
        loc: ['body', 'video_url'],
        msg: 'Failed to load video.',
        type: 'input_value_error',
      },
    ],
  });
  assert.equal(isFalDefiniteInputRejection(loadVideoError), true);
  assert.equal(classifyFalSubmitFailure(loadVideoError), 'refund');
  assert.equal(
    classifyFalSubmitFailure(
      falInputMirrorFailureMessage('source fetch HTTP 403')
    ),
    'refund'
  );
  assert.equal(
    isFalDefiniteInputRejection('{"type":"file_download_error"}'),
    true
  );
});

test('classifies 5xx / 429 / 408 submit failures as uncertain', () => {
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 500'),
    'uncertain'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 502'),
    'uncertain'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 429'),
    'uncertain'
  );
  assert.equal(
    classifyFalSubmitFailure('request failed with status: 408'),
    'uncertain'
  );
  assert.equal(classifyFalSubmitFailure('network down'), 'uncertain');
});

test('HTTP status helpers match Fal transport rules', () => {
  assert.equal(
    parseFalHttpStatusFromError('request failed with status: 502'),
    502
  );
  assert.equal(isTransientFalHttpStatus(502), true);
  assert.equal(isDefiniteFalSubmitRejection(502), false);
  assert.equal(isDefiniteFalSubmitRejection(404), true);
});

test('queue status/result uses Fal app id, not nested submit path', () => {
  assert.equal(
    falQueueQueryModel('fal-ai/kling-video/o3/standard/video-to-video/edit'),
    'fal-ai/kling-video'
  );
  assert.equal(
    falQueueQueryModel('minimax/h3/reference-to-video'),
    'minimax/h3'
  );
  assert.equal(falQueueQueryModel('fal-ai/flux/schnell'), 'fal-ai/flux');
  assert.equal(falQueueQueryModel('fal-ai/kling-video'), 'fal-ai/kling-video');
});
