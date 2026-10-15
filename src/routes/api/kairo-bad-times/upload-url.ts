import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { assertKairoBadTimesGenerationId } from '@/modules/kairo-bad-times/billing';
import { KairoBadTimesPreflightError } from '@/modules/kairo-bad-times/service';
import {
  assertKairoBadTimesUploadSize,
  createKairoBadTimesUploadDescriptor,
  getKairoBadTimesInputKey,
} from '@/modules/kairo-bad-times/storage';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 750,
    keyPrefix: 'kairo-bad-times-upload-url',
  });
  if (limited) return limited;

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized', { status: 401 });

    const body = await request.json().catch(() => ({}));
    const generationId = assertKairoBadTimesGenerationId(body.generationId);
    const contentTypes = Array.isArray(body.contentTypes)
      ? body.contentTypes.filter(
          (value: unknown): value is string => typeof value === 'string'
        )
      : [];
    const contentLengths = Array.isArray(body.contentLengths)
      ? body.contentLengths.map((value: unknown) => Number(value))
      : [];

    if (
      contentTypes.length !== 1 ||
      contentLengths.length !== 1 ||
      !Number.isFinite(contentLengths[0])
    ) {
      return respErr('Provide exactly one reference image', { status: 400 });
    }

    assertKairoBadTimesUploadSize(contentLengths[0]);
    const normalized = getKairoBadTimesInputKey({
      userId: session.user.id,
      generationId,
      contentType: contentTypes[0],
    });
    const upload = await createKairoBadTimesUploadDescriptor({
      userId: session.user.id,
      generationId,
      contentType: normalized.contentType,
      contentLength: contentLengths[0],
    });

    return respData({ uploads: [upload] });
  } catch (error: any) {
    console.error('kairo-bad-times upload-url failed:', error);
    if (error instanceof KairoBadTimesPreflightError) {
      return respErr(error.message, { status: 400 });
    }
    return respErr(error?.message || 'Failed to create upload URLs', {
      status: 400,
    });
  }
}

export const Route = createFileRoute('/api/kairo-bad-times/upload-url')({
  server: {
    handlers: { POST },
  },
});
