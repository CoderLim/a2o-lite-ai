import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import {
  KAIRO_BAD_TIMES_POSTER_PATH,
  KAIRO_BAD_TIMES_PREVIEW_PATH,
} from '@/modules/kairo-bad-times/constants';
import { ApiError, apiGet, apiPost, uploadToSignedUrl } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useCreditGate } from '@/hooks/use-credit-gate';
import { useUserCredits } from '@/hooks/use-user-credits';
import { InsufficientCreditsModal } from '@/components/credits/insufficient-credits-modal';
import { CloseIcon, ImageModeIcon } from '@/components/icons';

type MediaItem = {
  id: string;
  file: File;
  url: string;
};

type SignedUpload = {
  uploadUrl: string;
  uploadHeaders: Record<string, string>;
  storageKey: string;
  index: number;
};

type UploadSetup = {
  uploads: SignedUpload[];
};

type GenerationStart = {
  generationId: string;
  requestId: string | null;
  status: string;
  reservedCredits: number;
};

type GenerationPoll = {
  status: 'processing' | 'completed' | 'failed';
  providerStatus: string;
  videoUrl: string | null;
  error?: string;
  reservedCredits?: number;
  requiredCredits?: number;
  balance?: number;
};

type TemplateMeta = {
  durationSeconds: number | null;
  billedDurationSeconds: number | null;
  estimatedCredits: number | null;
  templateAvailable: boolean;
  previewUrl: string;
  posterUrl: string;
};

type PersistedGeneration = {
  userId: string;
  generationId: string;
  reservedCredits: number;
};

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const STORAGE_KEY_PREFIX = 'kairo-bad-times:active-generation:';

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createMediaItem(file: File): MediaItem {
  return {
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
  };
}

function activeGenerationKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function KairoBadTimesGeneratorPanel({
  className,
}: {
  className?: string;
}) {
  const { data: session, isPending: sessionPending } = useSession();
  const userId = session?.user?.id ?? null;
  const creditsQuery = useUserCredits();
  const creditGate = useCreditGate({
    balance: creditsQuery.data?.balance,
    email: session?.user?.email,
  });

  const [photo, setPhoto] = useState<MediaItem | null>(null);
  const [templateMeta, setTemplateMeta] = useState<TemplateMeta | null>(null);
  const [templateMetaError, setTemplateMetaError] = useState('');
  const [phase, setPhase] = useState<
    'idle' | 'uploading' | 'starting' | 'generating' | 'locked'
  >('idle');
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [jobError, setJobError] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const generationRunRef = useRef(0);
  const resultPanelRef = useRef<HTMLDivElement>(null);

  const busy = phase !== 'idle' && phase !== 'locked';
  const templateAvailable = templateMeta?.templateAvailable === true;
  const estimatedCredits = templateMeta?.estimatedCredits ?? null;
  const billedDuration = templateMeta?.billedDurationSeconds ?? null;

  useEffect(() => {
    apiGet<TemplateMeta>('/api/kairo-bad-times/template-meta')
      .then((data) => {
        setTemplateMeta(data);
        setTemplateMetaError(
          data.templateAvailable ? '' : m['site.kairo.template_unavailable']()
        );
      })
      .catch(() => {
        setTemplateMeta({
          durationSeconds: null,
          billedDurationSeconds: null,
          estimatedCredits: null,
          templateAvailable: false,
          previewUrl: KAIRO_BAD_TIMES_PREVIEW_PATH,
          posterUrl: KAIRO_BAD_TIMES_POSTER_PATH,
        });
        setTemplateMetaError(m['site.kairo.template_unavailable']());
      });
  }, []);

  useEffect(() => {
    photoUrlRef.current = photo?.url ?? null;
  }, [photo]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  const pollUntilComplete = useCallback(
    async (activeGenerationId: string, reservedCredits: number) => {
      const runId = ++generationRunRef.current;
      let delayMs = 2_000;

      for (let attempt = 0; attempt < 240; attempt += 1) {
        await sleep(delayMs);
        if (generationRunRef.current !== runId) return;

        let polled: GenerationPoll;
        try {
          polled = await apiGet<GenerationPoll>(
            `/api/kairo-bad-times/status?generationId=${encodeURIComponent(activeGenerationId)}`
          );
        } catch {
          delayMs = Math.min(8_000, Math.ceil(delayMs * 1.25));
          continue;
        }

        if (polled.providerStatus === 'submission_unknown') {
          setPhase('locked');
          setJobError(polled.error || m['site.generator.pending']());
          return;
        }

        if (polled.status === 'completed' && polled.videoUrl) {
          if (userId) {
            localStorage.removeItem(activeGenerationKey(userId));
          }
          setResultUrl(polled.videoUrl);
          setJobError('');
          setPhase('idle');
          void creditsQuery.refetch();
          return;
        }

        if (polled.status === 'failed') {
          if (userId) {
            localStorage.removeItem(activeGenerationKey(userId));
          }
          setPhase('idle');
          const requiredCredits = Number(polled.requiredCredits);
          const balance = Number(polled.balance);
          if (
            polled.providerStatus === 'insufficient_credits' &&
            Number.isFinite(requiredCredits) &&
            Number.isFinite(balance)
          ) {
            creditGate.open({ requiredCredits, balance });
            setJobError('');
            return;
          }
          setJobError(polled.error || m['site.generator.failed']());
          void creditsQuery.refetch();
          return;
        }

        delayMs = Math.min(8_000, Math.ceil(delayMs * 1.15));
        void reservedCredits;
      }

      setPhase('idle');
      setJobError(m['site.generator.failed']());
    },
    [creditGate, creditsQuery, userId]
  );

  useEffect(() => {
    if (!userId || busy || resultUrl) return;
    const raw = localStorage.getItem(activeGenerationKey(userId));
    if (!raw) return;
    try {
      const persisted = JSON.parse(raw) as PersistedGeneration;
      if (
        persisted.userId !== userId ||
        typeof persisted.generationId !== 'string'
      ) {
        return;
      }
      setGenerationId(persisted.generationId);
      setPhase('generating');
      void pollUntilComplete(
        persisted.generationId,
        persisted.reservedCredits || 0
      );
    } catch {
      localStorage.removeItem(activeGenerationKey(userId));
    }
  }, [busy, pollUntilComplete, resultUrl, userId]);

  useEffect(() => {
    if (!busy || resultUrl) {
      if (resultUrl) setProgressPercent(100);
      else setProgressPercent(0);
      return;
    }
    const started = Date.now();
    const tick = () => {
      const elapsedSec = (Date.now() - started) / 1000;
      setProgressPercent(
        Math.min(92, Math.round(10 + 82 * (1 - Math.exp(-elapsedSec / 70))))
      );
    };
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [busy, resultUrl]);

  useEffect(() => {
    if (!busy && !resultUrl) return;
    resultPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [busy, resultUrl, generationId]);

  const canGenerate = Boolean(
    photo && templateAvailable && !busy && !sessionPending
  );

  const creditHint = useMemo(() => {
    if (estimatedCredits == null || billedDuration == null) return null;
    return m['site.kairo.credit_hint']({
      credits: estimatedCredits,
      seconds: billedDuration,
    });
  }, [billedDuration, estimatedCredits]);

  const setPhotoFile = (file: File | null) => {
    if (!file) return;
    const mime = file.type.split(';', 1)[0]?.trim().toLowerCase() || '';
    if (!mime.startsWith('image/')) {
      toast.error(m['site.kairo.image_type']());
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(m['site.kairo.image_size']());
      return;
    }
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return createMediaItem(file);
    });
    creditGate.clear();
    setJobError('');
  };

  const onPickPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    setPhotoFile(file);
  };

  const clearPhoto = () => {
    setPhoto((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const startGeneration = async () => {
    if (!photo) {
      toast.error(m['site.kairo.need_photo']());
      return;
    }
    if (!templateAvailable) {
      toast.error(m['site.kairo.template_unavailable']());
      return;
    }
    if (!userId) {
      const callbackUrl = encodeURIComponent(
        `${window.location.pathname}${window.location.search}`
      );
      window.location.href = `/sign-in?callbackUrl=${callbackUrl}`;
      return;
    }

    setJobError('');
    setResultUrl(null);
    setPhase('uploading');
    const id = crypto.randomUUID();
    setGenerationId(id);

    try {
      const contentTypes = [photo.file.type || 'image/jpeg'];
      const contentLengths = [photo.file.size];

      const setup = await apiPost<UploadSetup>(
        '/api/kairo-bad-times/upload-url',
        {
          generationId: id,
          contentTypes,
          contentLengths,
        }
      );

      if (setup.uploads.length !== 1) {
        throw new Error('Upload setup returned an incomplete file list');
      }

      const upload = setup.uploads[0];
      await uploadToSignedUrl({
        url: upload.uploadUrl,
        file: photo.file,
        headers: upload.uploadHeaders,
      });

      setPhase('starting');
      const start = await apiPost<GenerationStart>(
        '/api/kairo-bad-times/generate',
        {
          generationId: id,
          imageKey: upload.storageKey,
          contentTypes,
          contentLengths,
        }
      );

      await creditsQuery.refetch();

      if (
        start.status === 'refunded' ||
        start.status === 'submission_unknown'
      ) {
        throw new Error(
          start.status === 'submission_unknown'
            ? 'Submission result is uncertain. Please contact support before retrying.'
            : 'Generation could not be started'
        );
      }

      localStorage.setItem(
        activeGenerationKey(userId),
        JSON.stringify({
          userId,
          generationId: id,
          reservedCredits: start.reservedCredits || 0,
        } satisfies PersistedGeneration)
      );

      setPhase('generating');
      await pollUntilComplete(id, start.reservedCredits || 0);
    } catch (error) {
      setPhase('idle');
      if (error instanceof ApiError) {
        const data =
          error.data && typeof error.data === 'object'
            ? (error.data as Record<string, unknown>)
            : null;
        if (
          data?.code === 'INSUFFICIENT_CREDITS' &&
          typeof data.requiredCredits === 'number' &&
          typeof data.balance === 'number'
        ) {
          creditGate.open({
            requiredCredits: data.requiredCredits,
            balance: data.balance,
          });
          return;
        }
        setJobError(error.message);
        toast.error(error.message);
        return;
      }
      const message =
        error instanceof Error ? error.message : 'Generation failed';
      setJobError(message);
      toast.error(message);
    }
  };

  const previewUrl = templateMeta?.previewUrl || KAIRO_BAD_TIMES_PREVIEW_PATH;
  const posterUrl = templateMeta?.posterUrl || KAIRO_BAD_TIMES_POSTER_PATH;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-3">
          <p className="text-foreground/80 text-sm font-medium">
            {m['site.kairo.template_label']()}
          </p>
          <div className="border-border/60 overflow-hidden rounded-2xl border bg-black/40">
            <video
              key={previewUrl}
              className="aspect-[9/16] w-full object-cover"
              src={previewUrl}
              poster={posterUrl}
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {m['site.kairo.template_note']()}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-foreground/80 text-sm font-medium">
              {m['site.kairo.photo_label']()}
            </p>
            <p className="text-muted-foreground text-xs">
              {m['site.kairo.photo_note']()}
            </p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
            {photo ? (
              <div className="border-border/60 relative overflow-hidden rounded-2xl border">
                <img
                  src={photo.url}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-black/55 text-white"
                  onClick={clearPhoto}
                  disabled={busy}
                  aria-label={m['site.generator.image_remove']()}
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={busy}
                className="border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/35 flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm transition"
              >
                <ImageModeIcon className="size-6 opacity-70" />
                {m['site.kairo.upload_photo']()}
              </button>
            )}
          </div>

          {creditHint ? (
            <p className="text-muted-foreground text-xs">{creditHint}</p>
          ) : null}
          {templateMetaError ? (
            <p className="text-destructive text-sm">{templateMetaError}</p>
          ) : null}
          {jobError ? (
            <p className="text-destructive text-sm">{jobError}</p>
          ) : null}

          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => void startGeneration()}
            className={cn(
              'bg-foreground text-background inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition',
              !canGenerate && 'opacity-50'
            )}
          >
            {busy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {phase === 'uploading' || phase === 'starting'
                  ? m['site.generator.starting']()
                  : m['site.generator.generating']()}
              </>
            ) : (
              m['site.kairo.generate']()
            )}
          </button>
        </div>
      </div>

      <div ref={resultPanelRef} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-foreground/80 text-sm font-medium">
            {m['site.generator.preview_result']()}
          </p>
          {resultUrl ? (
            <a
              href={resultUrl}
              download="kairo-bad-times.mp4"
              className="text-foreground/80 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              <Download className="size-4" />
              {m['site.common.download']()}
            </a>
          ) : null}
        </div>
        <div className="border-border/60 overflow-hidden rounded-2xl border bg-black/30">
          {resultUrl ? (
            <video
              className="aspect-[9/16] w-full object-contain"
              src={resultUrl}
              controls
              playsInline
            />
          ) : busy ? (
            <div className="flex aspect-[9/16] flex-col items-center justify-center gap-3 px-6 text-center">
              <LoaderCircle className="text-foreground/70 size-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                {m['site.kairo.generating_hint']()}
              </p>
              <div className="bg-muted h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                <div
                  className="bg-foreground/80 h-full rounded-full transition-[width]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex aspect-[9/16] items-center justify-center px-6 text-center text-sm">
              {m['site.kairo.result_empty']()}
            </div>
          )}
        </div>
      </div>

      <InsufficientCreditsModal
        gate={creditGate.gate}
        pack={creditGate.recommendedPack}
        checkoutLoading={creditGate.checkoutLoading}
        onClose={creditGate.clear}
        onBuy={() => void creditGate.buy()}
      />
    </div>
  );
}
