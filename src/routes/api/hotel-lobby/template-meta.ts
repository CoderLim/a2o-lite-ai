import { createFileRoute } from '@tanstack/react-router';

import {
  getHotelLobbyPresetPublicMeta,
  resolveHotelLobbyPreset,
} from '@/modules/hotel-lobby/presets';
import { estimateHotelLobbyCredits } from '@/modules/hotel-lobby/pricing';
import { HotelLobbyPreflightError } from '@/modules/hotel-lobby/service';
import { getHotelLobbyTemplateDurationSecondsRaw } from '@/modules/hotel-lobby/storage';
import { normalizeHotelLobbyDuration } from '@/modules/hotel-lobby/video-metadata';
import { respData, respErr } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  try {
    const { searchParams } = new URL(request.url);
    const preset = resolveHotelLobbyPreset(searchParams.get('presetId'), {
      requireEnabled: false,
    });

    let durationSeconds: number | null = null;
    let billedDurationSeconds: number | null = null;
    let estimatedCredits: number | null = null;
    let templateAvailable = false;

    try {
      durationSeconds = await getHotelLobbyTemplateDurationSecondsRaw(
        preset.id
      );
      billedDurationSeconds = normalizeHotelLobbyDuration(durationSeconds);
      estimatedCredits = estimateHotelLobbyCredits({
        duration: billedDurationSeconds,
        imageCount: preset.imageCount.min,
        maxImages: preset.imageCount.max,
      });
      templateAvailable = true;
    } catch (error) {
      console.error('hotel-lobby template duration unavailable:', error);
      templateAvailable = false;
    }

    return respData({
      durationSeconds,
      billedDurationSeconds,
      estimatedCredits,
      templateAvailable,
      ...getHotelLobbyPresetPublicMeta(preset),
    });
  } catch (error) {
    console.error('hotel-lobby template-meta failed:', error);
    if (error instanceof HotelLobbyPreflightError) {
      return respErr(error.message, { status: 400 });
    }
    return respErr(
      error instanceof Error
        ? error.message
        : 'Hotel Lobby template duration is unavailable',
      { status: 404 }
    );
  }
}

export const Route = createFileRoute('/api/hotel-lobby/template-meta')({
  server: {
    handlers: { GET },
  },
});
