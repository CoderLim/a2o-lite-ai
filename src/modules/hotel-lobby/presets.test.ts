import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCrazyFrogPrompt,
  CRAZY_FROG_PRESET_ID,
  HOTEL_LOBBY_PRESET_ID,
  normalizeStoredPresetId,
  resolveHotelLobbyPreset,
} from './presets';
import { HotelLobbyPreflightError } from './prompt';

test('missing presetId resolves to hotel-lobby', () => {
  const preset = resolveHotelLobbyPreset(undefined);
  assert.equal(preset.id, HOTEL_LOBBY_PRESET_ID);
  assert.equal(preset.keepAudio, true);
  assert.equal(preset.aspectRatio, '16:9');
  assert.equal(preset.allowCustomVideo, true);
});

test('crazy-frog preset is fixed template, two images, keep audio', () => {
  const preset = resolveHotelLobbyPreset(CRAZY_FROG_PRESET_ID, {
    requireEnabled: false,
  });
  assert.equal(preset.id, CRAZY_FROG_PRESET_ID);
  assert.equal(preset.imageCount.min, 2);
  assert.equal(preset.imageCount.max, 2);
  assert.equal(preset.allowCustomVideo, false);
  assert.equal(preset.allowTrim, false);
  assert.equal(preset.keepAudio, true);
  assert.equal(preset.aspectRatio, '4:3');
  assert.equal(preset.enabled, true);
  assert.match(preset.templateVideoKey, /^hotel-lobby\/templates\//);
});

test('enabled crazy-frog resolves when requireEnabled', () => {
  const preset = resolveHotelLobbyPreset(CRAZY_FROG_PRESET_ID);
  assert.equal(preset.id, CRAZY_FROG_PRESET_ID);
  assert.equal(preset.enabled, true);
});

test('unknown preset rejects', () => {
  assert.throws(
    () => resolveHotelLobbyPreset('not-a-real-preset'),
    HotelLobbyPreflightError
  );
});

test('crazy frog prompt names both Elements and chase roles', () => {
  const prompt = buildCrazyFrogPrompt(2);
  assert.match(prompt, /@Video1/);
  assert.match(prompt, /@Element1/);
  assert.match(prompt, /@Element2/);
  assert.match(prompt, /Use @Video1 only for/i);
  assert.match(prompt, /foreground/i);
  assert.match(prompt, /chasing|chase|chaser/i);
  assert.match(prompt, /do not keep the original foreground rider/i);
  assert.match(prompt, /do not keep the original chaser/i);
  assert.match(prompt, /Do not swap Element1 and Element2/i);
  assert.throws(() => buildCrazyFrogPrompt(1), HotelLobbyPreflightError);
});

test('normalizeStoredPresetId defaults legacy tasks to hotel-lobby', () => {
  assert.equal(normalizeStoredPresetId(undefined), HOTEL_LOBBY_PRESET_ID);
  assert.equal(normalizeStoredPresetId(null), HOTEL_LOBBY_PRESET_ID);
  assert.equal(
    normalizeStoredPresetId(CRAZY_FROG_PRESET_ID),
    CRAZY_FROG_PRESET_ID
  );
});
