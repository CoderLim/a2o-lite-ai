import { createFileRoute } from '@tanstack/react-router';

import {
  KAIRO_BAD_TIMES_POSTER_PATH,
  KAIRO_BAD_TIMES_PREVIEW_PATH,
} from '@/modules/kairo-bad-times/constants';
import { estimateKairoBadTimesCredits } from '@/modules/kairo-bad-times/pricing';
import { KairoBadTimesPreflightError } from '@/modules/kairo-bad-times/service';
import { getKairoBadTimesTemplateDurationSecondsRaw } from '@/modules/kairo-bad-times/storage';
import { normalizeKairoBadTimesDuration } from '@/modules/kairo-bad-times/video-metadata';
import { respData, respErr } from '@/lib/resp';

async function GET() {
  try {
    let durationSeconds: number | null = null;
    let billedDurationSeconds: number | null = null;
    let estimatedCredits: number | null = null;
    let templateAvailable = false;

    try {
      durationSeconds = await getKairoBadTimesTemplateDurationSecondsRaw();
      billedDurationSeconds = normalizeKairoBadTimesDuration(durationSeconds);
      estimatedCredits = estimateKairoBadTimesCredits({
        duration: billedDurationSeconds,
      });
      templateAvailable = true;
    } catch (error) {
      console.error('kairo-bad-times template duration unavailable:', error);
      templateAvailable = false;
    }

    return respData({
      durationSeconds,
      billedDurationSeconds,
      estimatedCredits,
      templateAvailable,
      previewUrl: KAIRO_BAD_TIMES_PREVIEW_PATH,
      posterUrl: KAIRO_BAD_TIMES_POSTER_PATH,
    });
  } catch (error) {
    console.error('kairo-bad-times template-meta failed:', error);
    if (error instanceof KairoBadTimesPreflightError) {
      return respErr(error.message, { status: 400 });
    }
    return respErr(
      error instanceof Error
        ? error.message
        : 'Template metadata is unavailable',
      { status: 404 }
    );
  }
}

export const Route = createFileRoute('/api/kairo-bad-times/template-meta')({
  server: {
    handlers: { GET },
  },
});
