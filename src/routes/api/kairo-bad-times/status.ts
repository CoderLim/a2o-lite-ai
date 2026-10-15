import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  assertKairoBadTimesGenerationId,
  getKairoBadTimesTaskById,
} from '@/modules/kairo-bad-times/billing';
import { reconcileKairoBadTimesGeneration } from '@/modules/kairo-bad-times/reconcile';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr, respJson } from '@/lib/resp';

async function GET({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1_000,
    keyPrefix: 'kairo-bad-times-status',
  });
  if (limited) return limited;

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized', { status: 401 });

    const generationId = assertKairoBadTimesGenerationId(
      new URL(request.url).searchParams.get('generationId')
    );
    const task = await getKairoBadTimesTaskById({
      generationId,
      userId: session.user.id,
    });

    if (!task) {
      return respJson(
        -1,
        'Generation not found',
        { code: 'GENERATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    return respData(await reconcileKairoBadTimesGeneration(task));
  } catch (error: any) {
    console.error('kairo-bad-times status failed:', error);
    return respErr(error?.message || 'Failed to query generation status', {
      status: 400,
    });
  }
}

export const Route = createFileRoute('/api/kairo-bad-times/status')({
  server: {
    handlers: { GET },
  },
});
