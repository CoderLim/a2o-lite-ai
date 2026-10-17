import {
  AIMediaType,
  AITaskStatus,
  FalProvider,
  isFalPermanentQueryFailure,
} from '@/core/ai';
import { envConfigs } from '@/config';
import { getConfig } from '@/modules/config/service';

import {
  getKairoBadTimesFixedPrompt,
  getKairoBadTimesModel,
  KAIRO_BAD_TIMES_CHARACTER_ORIENTATION,
  KAIRO_BAD_TIMES_KEEP_ORIGINAL_SOUND,
  KAIRO_BAD_TIMES_MODEL,
  type KairoBadTimesSubject,
} from './constants';
import { assertKairoBadTimesDuration } from './pricing';

/**
 * Provider rejected the job before a usable render — safe to auto-refund.
 * Includes input validation and content-policy blocks (Fal may surface these
 * as RESULT_FETCH_PERMANENT_ERROR JSON rather than a normal FAILED status).
 */
export function isKairoBadTimesRefundableProviderFailure(
  error: string
): boolean {
  return /input_value_error|input was rejected|no complete upper body|upper body detected|content_policy_violation|model_moderated|flagged by a content checker/i.test(
    error
  );
}

/** @deprecated Prefer isKairoBadTimesRefundableProviderFailure */
export function isKairoBadTimesInputRejection(error: string): boolean {
  return isKairoBadTimesRefundableProviderFailure(error);
}

export function friendlyKairoBadTimesProviderError(error: string): string {
  if (
    /content_policy_violation|model_moderated|flagged by a content checker/i.test(
      error
    )
  ) {
    return 'This photo was blocked by the content checker. Try another photo, or switch to Pet if the subject is an animal.';
  }
  if (/no complete upper body|upper body detected/i.test(error)) {
    return 'The motion template could not be used. Please try again, or switch version.';
  }
  if (/input_value_error|input was rejected/i.test(error)) {
    return 'The photo or template was rejected. Try another photo with a clear subject.';
  }
  return error;
}

export class KairoBadTimesPreflightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KairoBadTimesPreflightError';
  }
}

function getKairoBadTimesWebhookUrl() {
  const appUrl = envConfigs.app_url?.trim();
  if (!appUrl || !appUrl.startsWith('https://')) return null;
  try {
    return new URL('/api/kairo-bad-times/webhook', appUrl).toString();
  } catch {
    return null;
  }
}

async function getFalProvider() {
  const apiKey = (await getConfig('fal_api_key'))?.trim();
  if (!apiKey) {
    throw new KairoBadTimesPreflightError(
      'Fal API key is not configured. Set it in Admin → Settings → AI → Fal.'
    );
  }
  return new FalProvider({ apiKey });
}

function assertHttpUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error();
    }
  } catch {
    throw new KairoBadTimesPreflightError(`${label} is not a valid URL`);
  }
}

export function validateKairoBadTimesInput(input: {
  duration: number;
  imageUrl: string;
  videoUrl: string;
}) {
  assertKairoBadTimesDuration(input.duration);
  assertHttpUrl(input.imageUrl, 'Reference image URL');
  assertHttpUrl(input.videoUrl, 'Template video URL');

  return input;
}

export async function submitKairoBadTimes(input: {
  duration: number;
  imageUrl: string;
  videoUrl: string;
  subject?: KairoBadTimesSubject;
}) {
  validateKairoBadTimesInput(input);
  const provider = await getFalProvider();
  const callbackUrl = getKairoBadTimesWebhookUrl() ?? undefined;
  const subject = input.subject ?? 'human';
  const model = getKairoBadTimesModel(subject);

  const options =
    subject === 'pet'
      ? {
          image_url: input.imageUrl,
          video_url: input.videoUrl,
          trim_first_second: true,
        }
      : {
          image_url: input.imageUrl,
          video_url: input.videoUrl,
          character_orientation: KAIRO_BAD_TIMES_CHARACTER_ORIENTATION,
          keep_original_sound: KAIRO_BAD_TIMES_KEEP_ORIGINAL_SOUND,
        };

  const result = await provider.generate({
    params: {
      mediaType: AIMediaType.VIDEO,
      model,
      prompt: getKairoBadTimesFixedPrompt(subject),
      callbackUrl,
      options,
    },
  });

  return {
    requestId: result.taskId,
    status: result.taskStatus,
  };
}

export async function getKairoBadTimesProviderStatus(
  requestId: string,
  model: string = KAIRO_BAD_TIMES_MODEL
) {
  if (!/^[A-Za-z0-9._:-]{6,200}$/.test(requestId.trim())) {
    throw new KairoBadTimesPreflightError('Invalid request ID');
  }

  const provider = await getFalProvider();
  const result = await provider.query?.({
    taskId: requestId,
    model,
    mediaType: AIMediaType.VIDEO,
  });

  if (!result) throw new Error('Fal status lookup is unavailable');

  if (result.taskStatus === AITaskStatus.SUCCESS) {
    const videoUrl = result.taskInfo?.videos?.[0]?.videoUrl;
    if (!videoUrl) {
      return {
        status: 'failed' as const,
        providerStatus: 'completed',
        videoUrl: null,
        error: 'Fal completed the request without a video URL',
      };
    }
    return {
      status: 'completed' as const,
      providerStatus: 'completed',
      videoUrl,
    };
  }

  if (
    result.taskStatus === AITaskStatus.FAILED ||
    result.taskStatus === AITaskStatus.CANCELED
  ) {
    const payload = result.taskResult as Record<string, unknown> | undefined;
    const error =
      (typeof payload?.error === 'string' && payload.error) ||
      (typeof result.taskInfo?.errorMessage === 'string' &&
        result.taskInfo.errorMessage) ||
      (typeof payload?.message === 'string' && payload.message) ||
      'Video generation failed';

    if (
      isFalPermanentQueryFailure(result.taskInfo) &&
      !isKairoBadTimesRefundableProviderFailure(error)
    ) {
      return {
        status: 'unresolved' as const,
        providerStatus: result.taskInfo?.status || 'QUERY_PERMANENT_ERROR',
        videoUrl: null,
        error,
      };
    }

    return {
      status: 'failed' as const,
      providerStatus: result.taskStatus,
      videoUrl: null,
      error: friendlyKairoBadTimesProviderError(error),
    };
  }

  return {
    status: 'processing' as const,
    providerStatus: result.taskStatus,
    videoUrl: null,
  };
}
