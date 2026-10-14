import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  assertGenerationId,
  getGenjutsuTaskByGenerationId,
  getGenjutsuTaskById,
} from '@/modules/genjutsu/billing';
import {
  getGenjutsuE2EUrlForStorageKey,
  isGenjutsuE2EMockEnabled,
} from '@/modules/genjutsu/e2e-mock';
import {
  createGenjutsuR2ReadUrl,
  getGenjutsuInputPrefix,
  getGenjutsuSealedInputPrefix,
} from '@/modules/genjutsu/storage';
import { hasPermission } from '@/modules/rbac/service';

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function redirectResponse(url: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}

function parseOptions(value: string | null | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function assertReferenceKeyOwned(params: {
  userId: string;
  generationId: string;
  storageKey: string;
}) {
  if (
    !params.storageKey ||
    params.storageKey.includes('..') ||
    params.storageKey.includes('\\') ||
    params.storageKey.startsWith('/')
  ) {
    throw new Error('Invalid Genjutsu reference storage key');
  }
  const stagingPrefix = getGenjutsuInputPrefix(params);
  const sealedPrefix = getGenjutsuSealedInputPrefix(params);
  if (
    !params.storageKey.startsWith(stagingPrefix) &&
    !params.storageKey.startsWith(sealedPrefix)
  ) {
    throw new Error('Invalid Genjutsu reference storage key');
  }
  if (
    !/\/reference-0[1-8]\.(?:jpg|png|webp|gif|avif|heic|heif)$/i.test(
      params.storageKey
    )
  ) {
    throw new Error('Invalid Genjutsu reference storage key');
  }
}

async function GET({
  request,
  params,
}: {
  request: Request;
  params: { generationId: string; index: string };
}) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return errorResponse('Unauthorized', 401);

  const generationId = assertGenerationId(params.generationId);
  const index = Number(params.index);
  // 1-based reference slot (reference-01 → index 1).
  if (!Number.isInteger(index) || index < 1 || index > 8) {
    return errorResponse('Invalid reference index', 400);
  }

  const isAdmin = await hasPermission(session.user.id, 'admin.*');
  const task = isAdmin
    ? await getGenjutsuTaskByGenerationId(generationId)
    : await getGenjutsuTaskById({
        generationId,
        userId: session.user.id,
      });
  if (!task) return errorResponse('Generation reference not found', 404);

  const options = parseOptions(task.options);
  const imageKeys = Array.isArray(options?.imageKeys)
    ? options.imageKeys.filter(
        (value: unknown): value is string => typeof value === 'string'
      )
    : [];
  const storageKey = imageKeys[index - 1];
  if (!storageKey) return errorResponse('Generation reference not found', 404);

  try {
    assertReferenceKeyOwned({
      userId: task.userId,
      generationId: task.id,
      storageKey,
    });
  } catch {
    return errorResponse('Generation reference not found', 404);
  }

  if (isGenjutsuE2EMockEnabled()) {
    const mockUrl = getGenjutsuE2EUrlForStorageKey(storageKey);
    return mockUrl
      ? redirectResponse(mockUrl)
      : errorResponse('E2E reference object not found', 404);
  }

  return redirectResponse(await createGenjutsuR2ReadUrl(storageKey));
}

export const Route = createFileRoute(
  '/api/genjutsu/reference/$generationId/$index'
)({
  server: {
    handlers: { GET },
  },
});
