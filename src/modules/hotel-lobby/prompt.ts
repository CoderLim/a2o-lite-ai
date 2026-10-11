export class HotelLobbyPreflightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HotelLobbyPreflightError';
  }
}

/**
 * Kling O3 prompt — reference video as @Video1 and subjects as @ElementN
 * (https://fal.ai/models/fal-ai/kling-video/o3/standard/video-to-video/edit).
 *
 * Keep this short and imperative like Fal's playground examples. Long
 * "preserve everything" wording tends to leave original performers in place
 * (especially for a second Element).
 */
export function buildHotelLobbyPrompt(imageCount: number) {
  if (imageCount === 1) {
    return [
      'Use @Video1 only for motion, timing, gestures, camera, framing, microphone, orange booth, and shot progression.',
      'Change every visible performer in @Video1 to be the subject from @Element1. Match face, hair, body, clothing, and species from @Element1 for the whole clip.',
      'Keep the booth, microphone, choreography, and background from @Video1. Do not add extra people.',
    ].join(' ');
  }

  if (imageCount === 2) {
    return [
      'Use @Video1 only for motion, timing, gestures, camera, framing, microphone, orange booth, and shot progression.',
      'Change the left performer in @Video1 to be the person or character from @Element1.',
      'Change the right performer in @Video1 to be the person or character from @Element2 — do not keep the original right performer.',
      'Match each side to its Element for face, hair, body, clothing, and species throughout the clip. Do not swap left/right or blend the two identities.',
      'Keep the booth, microphone, choreography, and background from @Video1.',
    ].join(' ');
  }

  throw new HotelLobbyPreflightError(
    'Hotel Lobby requires one or two reference images'
  );
}
