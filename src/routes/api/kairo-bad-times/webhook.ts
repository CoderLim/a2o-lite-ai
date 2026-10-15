import { createFileRoute } from '@tanstack/react-router';

import { getKairoBadTimesTaskByRequestIdAnyUser } from '@/modules/kairo-bad-times/billing';
import { reconcileKairoBadTimesGeneration } from '@/modules/kairo-bad-times/reconcile';
import { respOk } from '@/lib/resp';

function readRequestId(payload: any, request: Request) {
  const url = new URL(request.url);
  const candidates = [
    payload?.request_id,
    payload?.requestId,
    payload?.id,
    payload?.data?.request_id,
    payload?.data?.requestId,
    url.searchParams.get('request_id'),
    url.searchParams.get('requestId'),
  ];
  return candidates.find(
    (value) => typeof value === 'string' && value.length >= 6
  ) as string | undefined;
}

async function POST({ request }: { request: Request }) {
  try {
    const payload = await request.json().catch(() => ({}));
    const requestId = readRequestId(payload, request);

    if (!requestId) return respOk();

    const task = await getKairoBadTimesTaskByRequestIdAnyUser(requestId);
    if (!task) return respOk();

    await reconcileKairoBadTimesGeneration(task);
  } catch (error) {
    console.error('kairo-bad-times webhook reconcile failed:', error);
  }

  return respOk();
}

export const Route = createFileRoute('/api/kairo-bad-times/webhook')({
  server: {
    handlers: { POST },
  },
});
