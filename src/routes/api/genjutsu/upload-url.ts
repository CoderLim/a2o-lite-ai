import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import {
  CRAZY_FROG_ASPECT_RATIO,
  CRAZY_FROG_PRODUCT_ID,
  CRAZY_FROG_RESOLUTIONS,
} from '@/modules/crazy-frog/constants';
import {
  assertGenerationId,
  bindGenjutsuUploadInputs,
  createGenjutsuAttempt,
  GenjutsuAttemptConflictError,
  getGenjutsuTaskById,
  markGenjutsuAttemptFailedPreflight,
} from '@/modules/genjutsu/billing';
import {
  createGenjutsuE2EUploadDescriptor,
  ensureGenjutsuE2ETemplateObject,
  isGenjutsuE2EMockEnabled,
} from '@/modules/genjutsu/e2e-mock';
import {
  assertGenjutsuUploadSize,
  createGenjutsuProxyUploadDescriptor,
  createGenjutsuR2UploadDescriptor,
  ensureCrazyFrogTemplateInR2,
  ensureSmalltownBoyDanceTemplateInR2,
  GENJUTSU_PROXY_UPLOAD_MAX_BYTES,
  getCrazyFrogTemplateVideoKey,
  getGenjutsuInputKey,
  getSmalltownBoyDanceTemplateVideoKey,
} from '@/modules/genjutsu/storage';
import type { GenjutsuProvider } from '@/modules/genjutsu/types';
import {
  isGenjutsuProductId,
  resolveProductProviderTarget,
} from '@/modules/genjutsu/workflow';
import {
  SMALLTOWN_ASPECT_RATIO,
  SMALLTOWN_PRODUCT_ID,
  SMALLTOWN_RESOLUTIONS,
} from '@/modules/smalltown-boy-dance/constants';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr, respJson } from '@/lib/resp';

const FIXED_TEMPLATE_IMAGE_COUNT = 2;

async function POST({ request }: { request: Request }) {
  let generationIdForFailure: string | null = null;
  let userIdForFailure: string | null = null;
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1_000,
    keyPrefix: 'genjutsu-upload-url',
  });
  if (limited) return limited;

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return respErr('Unauthorized', { status: 401 });
    }
    userIdForFailure = session.user.id;

    const body = await request.json().catch(() => ({}));
    const generationId = assertGenerationId(body.generationId);
    generationIdForFailure = generationId;
    const mode = body.mode;
    const resolution = body.resolution;
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    const product =
      typeof body.product === 'string' && isGenjutsuProductId(body.product)
        ? body.product
        : undefined;
    const isSmalltown = product === SMALLTOWN_PRODUCT_ID;
    const isCrazyFrog = product === CRAZY_FROG_PRODUCT_ID;
    const isCrazyFrogPreview = isCrazyFrog && body.preview === true;
    // Full Crazy Frog / Smalltown: server template + image-only uploads.
    // Crazy Frog preview: client uploads trimmed ≤4s clip + two images.
    const isFixedTemplateProduct =
      (isSmalltown || isCrazyFrog) && !isCrazyFrogPreview;

    if (mode !== 'motion-transfer' && mode !== 'objects-swap') {
      return respErr('Invalid Genjutsu mode', { status: 400 });
    }
    if (
      resolution !== '480p' &&
      resolution !== '720p' &&
      resolution !== '1080p'
    ) {
      return respErr('Invalid Genjutsu resolution', { status: 400 });
    }
    if (
      isSmalltown &&
      !SMALLTOWN_RESOLUTIONS.includes(
        resolution as (typeof SMALLTOWN_RESOLUTIONS)[number]
      )
    ) {
      return respErr('Smalltown Boy Dance only supports 480p and 720p', {
        status: 400,
      });
    }
    if (
      isCrazyFrog &&
      !CRAZY_FROG_RESOLUTIONS.includes(
        resolution as (typeof CRAZY_FROG_RESOLUTIONS)[number]
      )
    ) {
      return respErr('Crazy Frog only supports 480p and 720p', {
        status: 400,
      });
    }
    if (isCrazyFrogPreview && resolution !== '480p') {
      return respErr('Crazy Frog preview must use 480p', { status: 400 });
    }

    const contentTypes = Array.isArray(body.contentTypes)
      ? body.contentTypes.filter(
          (value: unknown): value is string => typeof value === 'string'
        )
      : typeof body.contentType === 'string'
        ? [body.contentType]
        : [];
    const contentLengths = Array.isArray(body.contentLengths)
      ? body.contentLengths.map((value: unknown) => Number(value))
      : [];

    if (isCrazyFrogPreview) {
      if (contentTypes.length !== 3 || contentLengths.length !== 3) {
        return respErr(
          'Crazy Frog preview requires one trimmed video plus two reference images',
          { status: 400 }
        );
      }
      const videoMime =
        contentTypes[0]?.split(';', 1)[0]?.trim().toLowerCase() || '';
      if (!videoMime.startsWith('video/')) {
        return respErr('Crazy Frog preview first upload must be a video', {
          status: 400,
        });
      }
      for (let i = 1; i < 3; i += 1) {
        const mime =
          contentTypes[i]?.split(';', 1)[0]?.trim().toLowerCase() || '';
        if (!mime.startsWith('image/')) {
          return respErr(
            'Crazy Frog preview references must be images (JPG, PNG, WebP, or GIF)',
            { status: 400 }
          );
        }
      }
    } else if (isFixedTemplateProduct) {
      if (
        contentTypes.length !== FIXED_TEMPLATE_IMAGE_COUNT ||
        contentLengths.length !== FIXED_TEMPLATE_IMAGE_COUNT
      ) {
        return respErr(
          isCrazyFrog
            ? 'Upload exactly two reference images (lead and chaser)'
            : 'Upload exactly two reference images (front and back)',
          { status: 400 }
        );
      }
      for (const contentType of contentTypes) {
        const mime = contentType.split(';', 1)[0]?.trim().toLowerCase() || '';
        if (!mime.startsWith('image/')) {
          return respErr(
            'Both uploads must be images (JPG, PNG, WebP, or GIF)',
            { status: 400 }
          );
        }
      }

      try {
        if (isGenjutsuE2EMockEnabled()) {
          ensureGenjutsuE2ETemplateObject(
            isCrazyFrog
              ? getCrazyFrogTemplateVideoKey()
              : getSmalltownBoyDanceTemplateVideoKey()
          );
        } else if (isCrazyFrog) {
          await ensureCrazyFrogTemplateInR2();
        } else {
          await ensureSmalltownBoyDanceTemplateInR2();
        }
      } catch (error: any) {
        return respJson(
          -1,
          error?.message ||
            (isCrazyFrog
              ? 'Crazy Frog template is not configured in R2.'
              : 'Smalltown Boy Dance template is not configured in R2.'),
          { code: 'TEMPLATE_NOT_CONFIGURED' },
          { status: 503 }
        );
      }
    } else if (
      contentTypes.length < 2 ||
      contentTypes.length > 9 ||
      contentLengths.length !== contentTypes.length
    ) {
      return respErr(
        'Provide one source video plus 1-8 reference images with file sizes',
        { status: 400 }
      );
    }

    // Fixed-template products: indices 1–2 are images (0 reserved for server template).
    // Homepage / Crazy Frog preview: index 0 = video, 1+ = images.
    const normalizedInputs = contentTypes.map(
      (contentType: string, fileIndex: number) => {
        const storageIndex = isFixedTemplateProduct ? fileIndex + 1 : fileIndex;
        const contentLength = contentLengths[fileIndex];
        assertGenjutsuUploadSize(storageIndex, contentLength);
        return {
          ...getGenjutsuInputKey({
            userId: session.user.id,
            generationId,
            index: storageIndex,
            contentType,
          }),
          storageIndex,
          contentLength,
        };
      }
    );

    // C1: prefer the provider/model already persisted on the attempt so
    // product-scoped pages do not conflict with the global env router.
    const existing = await getGenjutsuTaskById({
      generationId,
      userId: session.user.id,
    });
    const resolved = resolveProductProviderTarget(product, mode);
    const target = existing
      ? {
          provider: (existing.provider ||
            resolved.provider) as GenjutsuProvider,
          model: existing.model || resolved.model,
        }
      : resolved;

    await createGenjutsuAttempt({
      generationId,
      userId: session.user.id,
      mode,
      resolution,
      prompt,
      product,
      ...target,
    });

    if (isFixedTemplateProduct) {
      await bindGenjutsuUploadInputs({
        generationId,
        userId: session.user.id,
        mode,
        resolution,
        prompt,
        product,
        ...target,
        useDefaultTemplate: true,
        aspectRatio: isCrazyFrog
          ? CRAZY_FROG_ASPECT_RATIO
          : SMALLTOWN_ASPECT_RATIO,
        imageKeys: normalizedInputs.map((item) => item.key),
        contentTypes: normalizedInputs.map((item) => item.contentType),
        contentLengths,
      });
    } else {
      await bindGenjutsuUploadInputs({
        generationId,
        userId: session.user.id,
        mode,
        resolution,
        prompt,
        product,
        ...target,
        preview: isCrazyFrogPreview || undefined,
        aspectRatio: isCrazyFrogPreview ? CRAZY_FROG_ASPECT_RATIO : undefined,
        videoKey: normalizedInputs[0].key,
        imageKeys: normalizedInputs.slice(1).map((item) => item.key),
        contentTypes: normalizedInputs.map((item) => item.contentType),
        contentLengths,
      });
    }

    const uploads = [];
    for (let fileIndex = 0; fileIndex < contentTypes.length; fileIndex += 1) {
      const item = normalizedInputs[fileIndex];
      const contentLength = item.contentLength;

      if (isGenjutsuE2EMockEnabled()) {
        uploads.push(
          createGenjutsuE2EUploadDescriptor(request, {
            contentType: item.contentType,
            storageKey: item.key,
          })
        );
      } else if (contentLength > GENJUTSU_PROXY_UPLOAD_MAX_BYTES) {
        uploads.push(
          await createGenjutsuR2UploadDescriptor({
            userId: session.user.id,
            generationId,
            index: item.storageIndex,
            contentType: item.contentType,
            contentLength,
          })
        );
      } else {
        uploads.push(
          createGenjutsuProxyUploadDescriptor(request, {
            userId: session.user.id,
            generationId,
            index: item.storageIndex,
            contentType: item.contentType,
            contentLength,
          })
        );
      }
    }

    return respData({
      uploads: isFixedTemplateProduct
        ? uploads.map((upload, fileIndex) => ({
            ...upload,
            index: fileIndex + 1,
          }))
        : uploads,
    });
  } catch (error: any) {
    if (error instanceof GenjutsuAttemptConflictError) {
      return respJson(-1, error.message, { code: error.code }, { status: 409 });
    }

    if (generationIdForFailure && userIdForFailure) {
      await markGenjutsuAttemptFailedPreflight({
        generationId: generationIdForFailure,
        userId: userIdForFailure,
        stage: 'upload_setup',
        errorCode: 'UPLOAD_SETUP_FAILED',
        error: error?.message || 'Failed to create upload URL',
      }).catch(() => undefined);
    }

    console.error('genjutsu upload-url failed:', error);
    return respErr(error?.message || 'Failed to create upload URL', {
      status: 400,
    });
  }
}

export const Route = createFileRoute('/api/genjutsu/upload-url')({
  server: {
    handlers: { POST },
  },
});
