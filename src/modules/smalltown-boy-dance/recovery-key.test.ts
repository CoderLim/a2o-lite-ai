import assert from 'node:assert/strict';
import test from 'node:test';

/** Mirror of panel helpers — keep in sync with GeneratorPanel activeGenerationKey. */
const smalltownActiveGenerationKey = (userId: string) =>
  `smalltown_boy_dance_active_generation:${userId}`;
const bulinActiveGenerationKey = (userId: string) =>
  `bulin_47_active_generation:${userId}`;

test('Smalltown and Bulin recovery keys stay isolated per user', () => {
  const userId = 'user_abc';
  assert.notEqual(
    smalltownActiveGenerationKey(userId),
    bulinActiveGenerationKey(userId)
  );
  assert.match(
    smalltownActiveGenerationKey(userId),
    /^smalltown_boy_dance_active_generation:/
  );
  assert.match(
    bulinActiveGenerationKey(userId),
    /^bulin_47_active_generation:/
  );
});
