/**
 * Mirror an HTTP(S) media URL onto fal CDN so model runners can fetch it
 * reliably (R2 account-endpoint signed URLs sometimes fail with
 * "Failed to load video" / input_value_error).
 *
 * Flow: initiate upload → copy source bytes to fal PUT URL → return public
 * `file_url` for model input.
 */

const FAL_UPLOAD_INITIATE_URL =
  'https://rest.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3';

/** Marker for submit-path classification — safe to refund (no fal job yet). */
export const FAL_INPUT_MIRROR_FAILED_PREFIX = 'fal_input_mirror_failed:';

type InitiateUploadResponse = {
  upload_url?: unknown;
  file_url?: unknown;
};

function extensionForContentType(contentType: string) {
  const normalized = contentType.split(';', 1)[0]?.trim().toLowerCase() || '';
  switch (normalized) {
    case 'video/mp4':
      return 'mp4';
    case 'video/quicktime':
      return 'mov';
    case 'video/webm':
      return 'webm';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

function guessContentTypeFromUrl(url: string, fallback: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path.endsWith('.mp4')) return 'video/mp4';
    if (path.endsWith('.mov')) return 'video/quicktime';
    if (path.endsWith('.webm')) return 'video/webm';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.webp')) return 'image/webp';
    if (path.endsWith('.gif')) return 'image/gif';
  } catch {
    // ignore malformed URLs — use fallback
  }
  return fallback;
}

export function falInputMirrorFailureMessage(detail: string) {
  return `${FAL_INPUT_MIRROR_FAILED_PREFIX}${detail}`;
}

async function putBytesToFalUpload(params: {
  uploadUrl: string;
  contentType: string;
  body: ArrayBuffer | ReadableStream<Uint8Array>;
}) {
  const init: RequestInit = {
    method: 'PUT',
    headers: { 'Content-Type': params.contentType },
    body: params.body as BodyInit,
  };
  if (
    typeof ReadableStream !== 'undefined' &&
    params.body instanceof ReadableStream
  ) {
    // Node fetch requires duplex when piping a ReadableStream body.
    (init as RequestInit & { duplex?: string }).duplex = 'half';
  }
  return fetch(params.uploadUrl, init);
}

/**
 * Download `sourceUrl` and upload to fal CDN. Returns the public fal file URL.
 */
export async function mirrorHttpUrlToFalCdn(params: {
  apiKey: string;
  sourceUrl: string;
  fileName: string;
  contentType: string;
}): Promise<string> {
  const contentType =
    params.contentType.split(';', 1)[0]?.trim().toLowerCase() ||
    'application/octet-stream';
  const fileName =
    params.fileName.trim() || `input.${extensionForContentType(contentType)}`;

  const initiate = await fetch(FAL_UPLOAD_INITIATE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Key ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      content_type: contentType,
    }),
  });

  if (!initiate.ok) {
    const detail = await initiate.text().catch(() => '');
    throw new Error(
      falInputMirrorFailureMessage(
        `initiate HTTP ${initiate.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`
      )
    );
  }

  const initiated = (await initiate.json()) as InitiateUploadResponse;
  const uploadUrl =
    typeof initiated.upload_url === 'string' ? initiated.upload_url : '';
  const fileUrl =
    typeof initiated.file_url === 'string' ? initiated.file_url : '';
  if (!uploadUrl || !fileUrl) {
    throw new Error(
      falInputMirrorFailureMessage('initiate missing upload_url or file_url')
    );
  }

  const source = await fetch(params.sourceUrl);
  if (!source.ok) {
    throw new Error(
      falInputMirrorFailureMessage(
        `source fetch HTTP ${source.status} for ${fileName}`
      )
    );
  }

  // Prefer buffering: hotel-lobby inputs are capped and streaming+duplex is
  // inconsistent across Node / Workers. Re-fetch only if body was already spent.
  let put: Response;
  try {
    const bytes = await source.arrayBuffer();
    put = await putBytesToFalUpload({
      uploadUrl,
      contentType,
      body: bytes,
    });
  } catch (firstError) {
    const retry = await fetch(params.sourceUrl);
    if (!retry.ok || !retry.body) {
      throw firstError instanceof Error
        ? firstError
        : new Error(falInputMirrorFailureMessage(`put failed for ${fileName}`));
    }
    put = await putBytesToFalUpload({
      uploadUrl,
      contentType,
      body: retry.body,
    });
  }

  if (!put.ok) {
    const detail = await put.text().catch(() => '');
    throw new Error(
      falInputMirrorFailureMessage(
        `put HTTP ${put.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`
      )
    );
  }

  return fileUrl;
}

export async function mirrorHotelLobbyInputsToFalCdn(params: {
  apiKey: string;
  videoUrl: string;
  imageUrls: string[];
}): Promise<{ videoUrl: string; imageUrls: string[] }> {
  const videoContentType = guessContentTypeFromUrl(
    params.videoUrl,
    'video/mp4'
  );
  const videoUrl = await mirrorHttpUrlToFalCdn({
    apiKey: params.apiKey,
    sourceUrl: params.videoUrl,
    fileName: `reference-video.${extensionForContentType(videoContentType)}`,
    contentType: videoContentType,
  });

  const imageUrls = await Promise.all(
    params.imageUrls.map((sourceUrl, index) => {
      const contentType = guessContentTypeFromUrl(sourceUrl, 'image/jpeg');
      return mirrorHttpUrlToFalCdn({
        apiKey: params.apiKey,
        sourceUrl,
        fileName: `reference-image-${String(index + 1).padStart(2, '0')}.${extensionForContentType(contentType)}`,
        contentType,
      });
    })
  );

  return { videoUrl, imageUrls };
}
