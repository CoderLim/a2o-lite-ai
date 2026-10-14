import { createFileRoute } from '@tanstack/react-router';

import { resolveHotelLobbyPreset } from '@/modules/hotel-lobby/presets';
import { HotelLobbyPreflightError } from '@/modules/hotel-lobby/service';
import { getHotelLobbyTemplatePreviewUrl } from '@/modules/hotel-lobby/storage';

async function GET({ request }: { request: Request }) {
  try {
    const { searchParams } = new URL(request.url);
    // Preview may load a disabled preset (Generate stays blocked elsewhere).
    const preset = resolveHotelLobbyPreset(searchParams.get('presetId'), {
      requireEnabled: false,
    });
    const url = await getHotelLobbyTemplatePreviewUrl(preset.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('hotel-lobby template unavailable:', error);
    const message =
      error instanceof HotelLobbyPreflightError
        ? error.message
        : 'Hotel Lobby template is not configured';
    return new Response(message, {
      status: error instanceof HotelLobbyPreflightError ? 400 : 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

export const Route = createFileRoute('/api/hotel-lobby/template')({
  server: {
    handlers: { GET },
  },
});
