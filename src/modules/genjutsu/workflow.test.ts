import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSeedanceWorkflowPrompt, getSeedanceTask } from './workflow';

test('maps motion transfer to Seedance reference task', () => {
  assert.equal(getSeedanceTask('motion-transfer'), 'reference');
});

test('maps object swap to Seedance editing task', () => {
  assert.equal(getSeedanceTask('objects-swap'), 'editing');
});

test('object swap replaces a person with the reference complete appearance', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt: 'Replace the lead rider with Reference 1',
    imageCount: 1,
  });

  assert.match(prompt, /Edit @Video1 by replacing only the targets/);
  assert.match(prompt, /Reference 1 maps to @Image1/);
  assert.match(
    prompt,
    /entire person, character, animal, or object is requested to be replaced/
  );
  assert.match(prompt, /complete visible appearance/);
  assert.match(prompt, /not just selected features or accessories/);
  assert.match(prompt, /Replace the lead rider with Reference 1/);
});

test('object swap maps two people to two reference images', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt:
      'Replace the lead rider with Reference 1 and the pursuing rider with Reference 2',
    imageCount: 2,
  });

  assert.match(prompt, /Reference 1 = @Image1/);
  assert.match(prompt, /Reference 2 = @Image2/);
  assert.match(prompt, /which reference image belongs to which target/);
  assert.match(
    prompt,
    /Replace the lead rider with Reference 1 and the pursuing rider with Reference 2/
  );
});

test('object swap allows multiple views of the same target', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt:
      'References 1, 2, and 3 are different views of the same squirrel. Replace the squirrel with that identity.',
    imageCount: 3,
  });

  assert.match(prompt, /Reference 3 = @Image3/);
  assert.match(prompt, /multiple views of the same target/);
  assert.doesNotMatch(
    prompt,
    /Do not assume they are alternate views of the same subject/
  );
});

test('object swap covers non-person targets such as cars, products, and animals', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt: 'Replace the orange motorcycle with Reference 1',
    imageCount: 1,
  });

  assert.match(prompt, /animal, or object/);
  assert.match(prompt, /Replace the orange motorcycle with Reference 1/);
});

test('clothing-only object swap does not require a full identity change', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt:
      'Replace only the red jacket with the clothing from Reference 1',
    imageCount: 1,
  });

  assert.match(
    prompt,
    /When the instruction requests only a specific attribute, such as clothing or a prop, modify only that attribute/
  );
  assert.match(
    prompt,
    /Replace only the red jacket with the clothing from Reference 1/
  );
  assert.match(
    prompt,
    /When an entire person, character, animal, or object is requested to be replaced/
  );
});

test('scene replacement is not forced to keep the original location', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt: 'Replace the street with the forest location from Reference 1',
    imageCount: 1,
  });

  assert.match(
    prompt,
    /elements that are not designated as replacement targets/
  );
  assert.match(
    prompt,
    /Replace the street with the forest location from Reference 1/
  );
  assert.doesNotMatch(prompt, /Preserve everything unrelated/);
  assert.doesNotMatch(
    prompt,
    /preserve the original (background|scene|location|environment)/i
  );
});

test('object swap keeps cross-shot identity through cuts and occlusion', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt: 'Replace the pursuing rider with Reference 1',
    imageCount: 1,
  });

  assert.match(
    prompt,
    /different camera angles, close-ups, camera cuts, occlusions, and reappearances/
  );
  assert.match(
    prompt,
    /explicitly assigned to a reference image is a replacement target, not an unrelated element to preserve/
  );
});

test('object swap without a prompt falls back conservatively', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    imageCount: 2,
  });

  assert.match(prompt, /Use visual correspondence conservatively/);
  assert.match(prompt, /Only modify targets with a clear match/);
  assert.match(prompt, /do not merge unrelated references/);
});

test('motion transfer keeps motion-camera contract without assuming a character replacement', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'motion-transfer',
    userPrompt: 'Move the whole fight into the forest from Reference 1',
    imageCount: 1,
  });

  assert.match(
    prompt,
    /source of motion, timing, poses, choreography, camera movement/
  );
  assert.match(prompt, /Use @Image1 as a visual reference/);
  assert.match(prompt, /location, environment/);
  assert.match(prompt, /Move the whole fight into the forest/);
  assert.match(
    prompt,
    /changes clearly indicated by the user instruction and references/
  );
  assert.doesNotMatch(prompt, /replacement character/);
  assert.doesNotMatch(
    prompt,
    /Do not copy the original replaced subject identity/
  );
  assert.doesNotMatch(prompt, /Preserve the original environment/);
  assert.doesNotMatch(prompt, /Rebuild only/);
});

test('motion transfer supports character plus location references', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'motion-transfer',
    userPrompt:
      'Use Reference 1 for the fighter and Reference 2 for the location',
    imageCount: 2,
  });

  assert.match(prompt, /Reference 1 = @Image1/);
  assert.match(prompt, /Reference 2 = @Image2/);
  assert.match(
    prompt,
    /characters, products, wardrobe, props, locations, environments/
  );
  assert.match(
    prompt,
    /Preserve the motion, timing, camera movement, framing, and shot progression/
  );
  assert.match(prompt, /Use Reference 1 for the fighter/);
});

test('motion transfer multi-reference prompt allows multiple views of one element', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'motion-transfer',
    userPrompt:
      'Use References 1, 2, and 3 as different views of the same squirrel',
    imageCount: 3,
  });

  assert.match(prompt, /Reference 3 = @Image3/);
  assert.match(prompt, /multiple views of the same element/);
  assert.doesNotMatch(
    prompt,
    /Do not assume they are alternate views of the same subject/
  );
});

test('motion transfer without a prompt stays conservative and role-neutral', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'motion-transfer',
    imageCount: 1,
  });

  assert.match(prompt, /If a clear visual correspondence exists/);
  assert.match(prompt, /Otherwise preserve the source appearance/);
  assert.match(prompt, /preserving the motion, camera, timing, framing/);
  assert.doesNotMatch(prompt, /primary appearance transformation/);
  assert.doesNotMatch(prompt, /replacement character/);
  assert.doesNotMatch(prompt, /Rebuild only/);
});

test('custom provider reference tokens are preserved', () => {
  const prompt = buildSeedanceWorkflowPrompt({
    mode: 'objects-swap',
    userPrompt: 'Replace the bottle',
    imageCount: 2,
    references: {
      video: '<video_ref_1>',
      images: ['<image_ref_1>', '<image_ref_2>'],
    },
  });

  assert.match(prompt, /Edit <video_ref_1> by replacing only the targets/);
  assert.match(prompt, /Reference 1 = <image_ref_1>/);
  assert.match(prompt, /Reference 2 = <image_ref_2>/);
  assert.doesNotMatch(prompt, /@Video1/);
});
