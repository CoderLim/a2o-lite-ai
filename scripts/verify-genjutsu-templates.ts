/**
 * Verify (and optionally seed) fixed Genjutsu product templates using the
 * same R2 signing config as production (`r2_upload_path` + logical key).
 *
 * Do NOT use bare `wrangler r2 object get …/genjutsu/templates/…` as proof —
 * runtime HEADs `{r2_upload_path}/{logicalKey}` (e.g. uploads/genjutsu/…).
 *
 * Usage:
 *   pnpm verify:genjutsu-templates
 *   pnpm verify:genjutsu-templates --seed
 *   pnpm verify:genjutsu-templates --remote   # load r2_* from remote D1
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AwsClient } from 'aws4fetch';

import { getAllConfigs } from '../src/modules/config/service';
import {
  getA2oLiteAiTemplateVideoKey,
  getCrazyFrogTemplateVideoKey,
  getEnzoFernandezAiTemplateVideoKey,
  getSmalltownBoyDanceTemplateVideoKey,
} from '../src/modules/genjutsu/storage';

type TemplateSpec = {
  label: string;
  logicalKey: string;
  localRelative: string;
};

type R2Config = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  uploadPath: string;
};

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

function encodePath(value: string) {
  return value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function loadR2FromRemoteD1(): R2Config {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const raw = execFileSync(
        'npx',
        [
          'wrangler',
          'd1',
          'execute',
          'a2o-lite-ai-db',
          '--remote',
          '--json',
          '--command',
          'SELECT name, value FROM config WHERE name LIKE "r2_%"',
        ],
        {
          encoding: 'utf8',
          maxBuffer: 2 * 1024 * 1024,
          env: process.env,
        }
      );
      // Wrangler may print banners before the JSON payload.
      const start = raw.indexOf('[');
      const end = raw.lastIndexOf(']');
      if (start < 0 || end < start) {
        throw new Error(`Unexpected wrangler D1 output:\n${raw.slice(0, 400)}`);
      }
      const parsed = JSON.parse(raw.slice(start, end + 1)) as Array<{
        results?: Array<{ name: string; value: string }>;
        success?: boolean;
      }>;
      if (parsed[0] && 'error' in (parsed[0] as object)) {
        throw new Error(JSON.stringify(parsed[0]));
      }
      const rows = parsed[0]?.results || [];
      const map = Object.fromEntries(rows.map((r) => [r.name, r.value]));
      const endpoint = map.r2_endpoint?.trim().replace(/\/$/, '');
      const bucket = map.r2_bucket_name?.trim();
      const accessKeyId = map.r2_access_key?.trim();
      const secretAccessKey = map.r2_secret_key?.trim();
      if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
        throw new Error(
          `Remote D1 missing r2_* rows (have: ${Object.keys(map).join(', ') || 'none'})`
        );
      }
      return {
        endpoint,
        bucket,
        accessKeyId,
        secretAccessKey,
        uploadPath: trimSlashes(map.r2_upload_path?.trim() || 'uploads'),
      };
    } catch (error) {
      lastError = error;
      const until = Date.now() + 800 * attempt;
      while (Date.now() < until) {
        /* backoff between flaky wrangler D1 calls */
      }
    }
  }
  throw lastError;
}

async function loadR2Config(preferRemote: boolean): Promise<R2Config> {
  if (preferRemote) {
    return loadR2FromRemoteD1();
  }

  const configs = await getAllConfigs();
  const endpoint = configs.r2_endpoint?.trim().replace(/\/$/, '');
  const bucket = configs.r2_bucket_name?.trim();
  const accessKeyId = configs.r2_access_key?.trim();
  const secretAccessKey = configs.r2_secret_key?.trim();
  if (endpoint && bucket && accessKeyId && secretAccessKey) {
    return {
      endpoint,
      bucket,
      accessKeyId,
      secretAccessKey,
      uploadPath: trimSlashes(configs.r2_upload_path?.trim() || 'uploads'),
    };
  }

  console.warn(
    'Local Admin R2 config incomplete — falling back to remote D1 r2_*.'
  );
  return loadR2FromRemoteD1();
}

async function main() {
  const seed = process.argv.includes('--seed');
  const preferRemote = process.argv.includes('--remote');
  const r2 = await loadR2Config(preferRemote);

  const client = new AwsClient({
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
    region: 'auto',
    service: 's3',
  });

  const templates: TemplateSpec[] = [
    {
      label: 'A2O Lite AI',
      logicalKey: getA2oLiteAiTemplateVideoKey(),
      localRelative: 'public/videos/a2o-lite-ai-tpl.mp4',
    },
    {
      label: 'Crazy Frog',
      logicalKey: getCrazyFrogTemplateVideoKey(),
      localRelative: 'public/videos/crazy-frog-tpl.mp4',
    },
    {
      label: 'Enzo Fernandez AI',
      logicalKey: getEnzoFernandezAiTemplateVideoKey(),
      localRelative: 'public/videos/enzo-fernandez-ai-tpl.mp4',
    },
    {
      label: 'Smalltown Boy Dance',
      logicalKey: getSmalltownBoyDanceTemplateVideoKey(),
      localRelative: 'public/videos/smalltown-boy-dance-tpl.mp4',
    },
  ];

  console.log(`Bucket:      ${r2.bucket}`);
  console.log(`Endpoint:    ${r2.endpoint}`);
  console.log(`Upload path: ${r2.uploadPath}`);
  console.log(`Mode:        ${seed ? 'verify + seed missing' : 'verify only'}`);
  console.log('');

  async function signedFetch(
    request: Request,
    attempts = 3
  ): Promise<Response> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i += 1) {
      try {
        return await client.fetch(request.clone());
      } catch (error) {
        lastError = error;
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
    throw lastError;
  }

  let failed = 0;

  for (const tpl of templates) {
    const physicalKey = [r2.uploadPath, tpl.logicalKey]
      .filter(Boolean)
      .join('/');
    const url = `${r2.endpoint}/${encodePath([r2.bucket, physicalKey].join('/'))}`;

    const head = await signedFetch(new Request(url, { method: 'HEAD' }));
    if (head.ok) {
      const len = head.headers.get('content-length') || '?';
      console.log(`OK  ${tpl.label}`);
      console.log(`    logical:  ${tpl.logicalKey}`);
      console.log(`    physical: ${physicalKey} (${len} bytes)`);
      continue;
    }

    if (head.status !== 404) {
      failed += 1;
      console.error(`ERR ${tpl.label}: HEAD HTTP ${head.status}`);
      console.error(`    physical: ${physicalKey}`);
      continue;
    }

    console.warn(`MISS ${tpl.label}`);
    console.warn(`    logical:  ${tpl.logicalKey}`);
    console.warn(`    physical: ${physicalKey}`);

    if (!seed) {
      failed += 1;
      console.warn(`    fix: pnpm verify:genjutsu-templates --seed --remote`);
      continue;
    }

    const localPath = path.join(process.cwd(), tpl.localRelative);
    if (!existsSync(localPath)) {
      failed += 1;
      console.error(`    seed failed: local file missing: ${localPath}`);
      continue;
    }

    const bytes = await readFile(localPath);
    const put = await signedFetch(
      new Request(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': String(bytes.byteLength),
          'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        },
        body: bytes,
      })
    );

    if (!put.ok) {
      failed += 1;
      console.error(`    seed failed: PUT HTTP ${put.status}`);
      continue;
    }

    console.log(
      `SEED ${tpl.label} → ${physicalKey} (${bytes.byteLength} bytes)`
    );
  }

  console.log('');
  if (failed > 0) {
    console.error(`${failed} template(s) missing or unreachable.`);
    process.exit(1);
  }
  console.log('All Genjutsu fixed templates present at runtime paths.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
