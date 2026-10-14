import { AwsClient } from 'aws4fetch';

import { getAllConfigs } from '@/modules/config/service';

type R2SigningConfig = {
  endpoint: string;
  bucket: string;
  uploadPath: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

function assertSafeObjectKey(key: string) {
  if (
    !key ||
    key.includes('..') ||
    key.includes('\\') ||
    key.includes('?') ||
    key.includes('#') ||
    key.includes('%') ||
    key.includes('//') ||
    !/^[A-Za-z0-9._/-]+$/.test(key)
  ) {
    throw new Error('Invalid Hotel Lobby storage key');
  }
}

function encodePath(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

async function getR2SigningConfig(): Promise<R2SigningConfig> {
  const configs = await getAllConfigs();
  const endpoint = configs.r2_endpoint?.trim().replace(/\/$/, '');
  const bucket = configs.r2_bucket_name?.trim();
  const accessKeyId = configs.r2_access_key?.trim();
  const secretAccessKey = configs.r2_secret_key?.trim();
  const uploadPath = trimSlashes(configs.r2_upload_path?.trim() || 'uploads');

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 storage is not fully configured. Set endpoint, bucket, access key, and secret key in Admin → Storage.'
    );
  }

  return {
    endpoint,
    bucket,
    uploadPath,
    accessKeyId,
    secretAccessKey,
  };
}

function createR2Client(config: R2SigningConfig) {
  return new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: 'auto',
    service: 's3',
  });
}

function buildR2ObjectUrl(config: R2SigningConfig, key: string) {
  assertSafeObjectKey(key);
  const objectPath = encodePath(
    [config.bucket, config.uploadPath, key].filter(Boolean).join('/')
  );
  return `${config.endpoint}/${objectPath}`;
}

/**
 * Authenticated byte-range GET for probe/metadata.
 * Kept in a leaf module so video-metadata can import it without a cycle
 * through storage.ts (storage → video-metadata → storage).
 */
export async function readHotelLobbyObjectRange(params: {
  key: string;
  /** Inclusive start byte. */
  start: number;
  /** Inclusive end byte; omit to read through EOF. */
  end?: number;
}): Promise<{ bytes: Uint8Array; totalBytes: number | null; status: number }> {
  assertSafeObjectKey(params.key);
  if (!params.key.startsWith('hotel-lobby/')) {
    throw new Error('Invalid Hotel Lobby storage key');
  }
  if (!Number.isSafeInteger(params.start) || params.start < 0) {
    throw new Error('Invalid Hotel Lobby range start');
  }
  if (
    params.end != null &&
    (!Number.isSafeInteger(params.end) || params.end < params.start)
  ) {
    throw new Error('Invalid Hotel Lobby range end');
  }

  const config = await getR2SigningConfig();
  const range =
    params.end == null
      ? `bytes=${params.start}-`
      : `bytes=${params.start}-${params.end}`;
  const response = await createR2Client(config).fetch(
    new Request(buildR2ObjectUrl(config, params.key), {
      method: 'GET',
      headers: { Range: range },
    })
  );

  if (response.status !== 206 && response.status !== 200) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Failed to read Hotel Lobby object range: HTTP ${response.status}${
        detail ? ` - ${detail.slice(0, 200)}` : ''
      }`
    );
  }

  const contentRange = response.headers.get('content-range');
  let totalBytes: number | null = null;
  if (contentRange) {
    const match = /\/(\d+)$/.exec(contentRange);
    if (match) {
      const total = Number(match[1]);
      if (Number.isSafeInteger(total) && total > 0) totalBytes = total;
    }
  }
  if (totalBytes == null && response.status === 200) {
    const contentLength = Number(response.headers.get('content-length') || '');
    if (Number.isSafeInteger(contentLength) && contentLength > 0) {
      totalBytes = contentLength;
    }
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    totalBytes,
    status: response.status,
  };
}
