import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from 'react';
import { Download, LoaderCircle, Play, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import {
  estimateHotelLobbyCredits,
  HOTEL_LOBBY_MAX_VIDEO_EDGE_PX,
  HOTEL_LOBBY_MIN_VIDEO_EDGE_PX,
} from '@/modules/hotel-lobby/pricing';
import { ApiError, apiGet, apiPost, uploadToSignedUrl } from '@/lib/api-client';
import { trimVideoToFile } from '@/lib/trim-video';
import { m } from '@/paraglide/messages.js';
import { useCreditGate } from '@/hooks/use-credit-gate';
import { useUserCredits } from '@/hooks/use-user-credits';
import { InsufficientCreditsModal } from '@/components/credits/insufficient-credits-modal';
import { CloseIcon, FilmIcon, ImageModeIcon } from '@/components/icons';
import { HotelLobbyTrimBar } from '@/components/landing/hotel-lobby-trim-bar';

type MediaItem = {
  id: string;
  file: File;
  url: string;
};

type VideoSource =
  | {
      kind: 'template';
      url: string;
      durationSeconds?: number;
    }
  | {
      kind: 'upload';
      file: File;
      url: string;
      durationSeconds: number;
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
  refundedCredits?: number;
};

const TEMPLATE_API = '/api/hotel-lobby/template';
const TEMPLATE_FILE_URL = '/api/hotel-lobby/template-file';
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MIN_REFERENCE_VIDEO_SECONDS = 3;
const MAX_REFERENCE_VIDEO_SECONDS = 15;

export type HotelLobbyPanelPresetId = 'hotel-lobby' | 'crazy-frog';

type PresetUiMeta = {
  presetId: HotelLobbyPanelPresetId;
  enabled: boolean;
  templateAvailable: boolean;
  allowCustomVideo: boolean;
  allowTrim: boolean;
  aspectRatio: string;
  imageCount: { min: number; max: number };
  estimatedCredits: number | null;
};

/** Fixed-template presets ship a public preview; R2 is only required to generate. */
const CRAZY_FROG_PUBLIC_TEMPLATE = '/videos/crazy-frog-tpl.mp4';

function templateUrlFor(presetId: HotelLobbyPanelPresetId) {
  if (presetId === 'crazy-frog') return CRAZY_FROG_PUBLIC_TEMPLATE;
  return TEMPLATE_API;
}

function templateMetaUrlFor(presetId: HotelLobbyPanelPresetId) {
  return presetId === 'hotel-lobby'
    ? '/api/hotel-lobby/template-meta'
    : `/api/hotel-lobby/template-meta?presetId=${encodeURIComponent(presetId)}`;
}

function isFullSourceClip(
  startSeconds: number,
  endSeconds: number,
  sourceSeconds: number
) {
  return startSeconds <= 0.05 && Math.abs(endSeconds - sourceSeconds) <= 0.2;
}

function createMediaItem(file: File): MediaItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    file,
    url: URL.createObjectURL(file),
  };
}

function readVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Could not read video duration'));
        return;
      }
      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < 1 ||
        height < 1
      ) {
        reject(new Error('Could not read video resolution'));
        return;
      }
      resolve({ duration, width, height });
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Could not read video metadata'));
    };
    video.src = url;
  });
}

function assertClientVideoDimensions(width: number, height: number) {
  if (
    width < HOTEL_LOBBY_MIN_VIDEO_EDGE_PX ||
    height < HOTEL_LOBBY_MIN_VIDEO_EDGE_PX ||
    width > HOTEL_LOBBY_MAX_VIDEO_EDGE_PX ||
    height > HOTEL_LOBBY_MAX_VIDEO_EDGE_PX
  ) {
    throw new Error(
      `Reference video must be between ${HOTEL_LOBBY_MIN_VIDEO_EDGE_PX}×${HOTEL_LOBBY_MIN_VIDEO_EDGE_PX} and ${HOTEL_LOBBY_MAX_VIDEO_EDGE_PX}×${HOTEL_LOBBY_MAX_VIDEO_EDGE_PX} pixels`
    );
  }
}

function clampReferenceDuration(seconds: number) {
  return Math.min(
    MAX_REFERENCE_VIDEO_SECONDS,
    Math.max(MIN_REFERENCE_VIDEO_SECONDS, Math.round(seconds))
  );
}

function redirectToSignIn() {
  const callbackUrl = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`
  );
  window.location.href = `/sign-in?callbackUrl=${callbackUrl}`;
}

function PersonSlot({
  title,
  note,
  item,
  onPick,
  onRemove,
  inputRef,
  disabled,
}: {
  title: string;
  note: string;
  item: MediaItem | null;
  onPick: (file: File | null) => void;
  onRemove: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  disabled: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2">
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-white/40">{note}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onPick(event.target.files?.[0] || null);
          event.target.value = '';
        }}
      />

      {item ? (
        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <img src={item.url} alt={title} className="size-full object-cover" />
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            aria-label={m['site.common.remove_item']({ name: title })}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white/80 backdrop-blur transition hover:bg-black/90 disabled:opacity-40"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/14 bg-white/[0.025] text-center text-white/42 transition hover:border-[rgba(204,144,92,0.55)] hover:bg-[rgba(204,144,92,0.05)] hover:text-[rgb(220,155,99)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageModeIcon className="size-6" />
          <span className="text-xs font-medium">
            {m['site.common.add_photo']()}
          </span>
        </button>
      )}
    </div>
  );
}

export function HotelLobbyGeneratorPanel({
  presetId = 'hotel-lobby',
}: {
  presetId?: HotelLobbyPanelPresetId;
} = {}) {
  const isCrazyFrog = presetId === 'crazy-frog';
  const isFixedTemplate = isCrazyFrog;
  const templateUrl = templateUrlFor(presetId);
  const { data: session, isPending: sessionPending } = useSession();
  const creditsQuery = useUserCredits(Boolean(session?.user));
  const creditGate = useCreditGate({
    balance: creditsQuery.data?.balance,
    email: session?.user?.email,
  });
  const videoInputRef = useRef<HTMLInputElement>(null);
  const firstImageInputRef = useRef<HTMLInputElement>(null);
  const secondImageInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const localUrlsRef = useRef<Set<string>>(new Set());

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<VideoSource | null>({
    kind: 'template',
    url: templateUrl,
  });
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const [presetMeta, setPresetMeta] = useState<PresetUiMeta | null>(null);
  const [firstImage, setFirstImage] = useState<MediaItem | null>(null);
  const [secondImage, setSecondImage] = useState<MediaItem | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [trimming, setTrimming] = useState(false);
  const [phase, setPhase] = useState<
    'idle' | 'uploading' | 'starting' | 'generating' | 'saving' | 'done'
  >('idle');
  const [providerStatus, setProviderStatus] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const busy = !['idle', 'done'].includes(phase) || trimming;
  const allowCustomVideo = presetMeta?.allowCustomVideo ?? !isFixedTemplate;
  const allowTrim = presetMeta?.allowTrim ?? !isFixedTemplate;
  const minImages = presetMeta?.imageCount.min ?? (isCrazyFrog ? 2 : 1);
  const maxImages = presetMeta?.imageCount.max ?? 2;
  const presetEnabled = presetMeta?.enabled ?? !isFixedTemplate;
  const aspectRatio = presetMeta?.aspectRatio ?? (isCrazyFrog ? '4:3' : '16:9');
  const previewAspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : aspectRatio === '4:3'
        ? 'aspect-[4/3]'
        : 'aspect-video';
  const imageItems = (
    maxImages > 1 ? [firstImage, secondImage] : [firstImage]
  ).filter((item): item is MediaItem => Boolean(item));
  const sourceDuration =
    typeof video?.durationSeconds === 'number' &&
    Number.isFinite(video.durationSeconds) &&
    video.durationSeconds > 0
      ? video.durationSeconds
      : null;
  const hasKnownDuration = sourceDuration != null;
  const clipDurationSeconds = Math.max(0, trimEnd - trimStart);
  const billedDuration = hasKnownDuration
    ? clampReferenceDuration(clipDurationSeconds)
    : null;

  const estimatedCredits = useMemo(() => {
    if (!billedDuration) return null;
    const imageCount = Math.max(
      1,
      (firstImage ? 1 : 0) + (secondImage && maxImages > 1 ? 1 : 0)
    );
    try {
      return estimateHotelLobbyCredits({
        duration: billedDuration,
        imageCount,
        maxImages,
      });
    } catch {
      return null;
    }
  }, [billedDuration, firstImage, secondImage, maxImages]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      localUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void apiGet<{
      durationSeconds: number | null;
      estimatedCredits: number | null;
      templateAvailable: boolean;
      presetId: HotelLobbyPanelPresetId;
      enabled: boolean;
      allowCustomVideo: boolean;
      allowTrim: boolean;
      aspectRatio: string;
      imageCount: { min: number; max: number };
    }>(templateMetaUrlFor(presetId))
      .then((data) => {
        if (cancelled) return;
        // R2 availability gates generation only; Crazy Frog preview is public.
        const r2Ready = data.templateAvailable !== false;
        setPresetMeta({
          presetId: data.presetId || presetId,
          enabled: data.enabled !== false,
          templateAvailable: r2Ready,
          allowCustomVideo: data.allowCustomVideo !== false,
          allowTrim: data.allowTrim !== false,
          aspectRatio: data.aspectRatio || (isCrazyFrog ? '4:3' : '16:9'),
          imageCount: data.imageCount || {
            min: isCrazyFrog ? 2 : 1,
            max: 2,
          },
          estimatedCredits: data.estimatedCredits,
        });
        setTemplateAvailable(r2Ready);
        setVideo((current) =>
          current?.kind === 'template'
            ? {
                ...current,
                url: templateUrl,
                // Crazy Frog previews the public file; prefer its browser
                // duration so a stale R2 smoke clip cannot show ~65 credits.
                durationSeconds: isCrazyFrog
                  ? current.durationSeconds
                  : typeof data.durationSeconds === 'number' &&
                      Number.isFinite(data.durationSeconds) &&
                      data.durationSeconds > 0
                    ? data.durationSeconds
                    : current.durationSeconds,
              }
            : current
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPresetMeta({
          presetId,
          enabled: !isCrazyFrog,
          templateAvailable: false,
          allowCustomVideo: !isCrazyFrog,
          allowTrim: !isCrazyFrog,
          aspectRatio: isCrazyFrog ? '4:3' : '16:9',
          imageCount: { min: isCrazyFrog ? 2 : 1, max: 2 },
          estimatedCredits: null,
        });
        setTemplateAvailable(false);
        // Keep the public preview mounted even when R2 meta fails.
        if (isCrazyFrog) {
          setVideo({ kind: 'template', url: templateUrl });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [presetId, templateUrl, isCrazyFrog]);

  useEffect(() => {
    if (video?.kind !== 'template') return;
    if (hasKnownDuration) return;
    // Public Crazy Frog preview duration comes from the <video> element.
    if (isCrazyFrog) return;

    let cancelled = false;
    void apiGet<{ durationSeconds: number | null }>(
      templateMetaUrlFor(presetId)
    )
      .then((data) => {
        if (cancelled) return;
        const seconds = data.durationSeconds;
        if (
          typeof seconds !== 'number' ||
          !Number.isFinite(seconds) ||
          seconds <= 0
        )
          return;
        setVideo((current) =>
          current?.kind === 'template'
            ? { ...current, durationSeconds: seconds }
            : current
        );
      })
      .catch(() => {
        // Browser metadata / retry may still fill durationSeconds.
      });

    return () => {
      cancelled = true;
    };
  }, [video?.kind, video?.url, hasKnownDuration, presetId, isCrazyFrog]);

  useEffect(() => {
    if (sourceDuration == null) {
      setTrimStart(0);
      setTrimEnd(0);
      return;
    }
    setTrimStart(0);
    setTrimEnd(sourceDuration);
  }, [video?.url, sourceDuration]);

  const applyTrim = async () => {
    if (!video || sourceDuration == null || trimming) return;

    if (
      clipDurationSeconds < MIN_REFERENCE_VIDEO_SECONDS ||
      clipDurationSeconds > MAX_REFERENCE_VIDEO_SECONDS
    ) {
      toast.error(m['site.hotel.trim_error']());
      return;
    }

    if (isFullSourceClip(trimStart, trimEnd, sourceDuration)) {
      toast.message('Selection already covers the full reference video');
      return;
    }

    setTrimming(true);
    try {
      const sourceUrl =
        video.kind === 'template' ? TEMPLATE_FILE_URL : video.url;
      const trimmed = await trimVideoToFile({
        sourceUrl,
        startSeconds: trimStart,
        endSeconds: trimEnd,
      });

      if (trimmed.size <= 0 || trimmed.size > MAX_VIDEO_BYTES) {
        throw new Error('Trimmed clip must be 80 MB or smaller');
      }

      const url = URL.createObjectURL(trimmed);
      localUrlsRef.current.add(url);

      if (video.kind === 'upload') {
        URL.revokeObjectURL(video.url);
        localUrlsRef.current.delete(video.url);
      }

      setTemplateAvailable(true);
      setVideo({
        kind: 'upload',
        file: trimmed,
        url,
        durationSeconds: clipDurationSeconds,
      });
      setResultUrl(null);
      setPhase('idle');
      toast.success(`Clipped to ${clipDurationSeconds.toFixed(1)}s`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not trim this video'
      );
    } finally {
      setTrimming(false);
    }
  };

  const setImageAt = (slot: 'first' | 'second', file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(m['site.hotel.image_required']());
      return;
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      toast.error(m['site.hotel.image_size']());
      return;
    }

    const next = createMediaItem(file);
    localUrlsRef.current.add(next.url);

    const setter = slot === 'first' ? setFirstImage : setSecondImage;
    const current = slot === 'first' ? firstImage : secondImage;
    if (current) {
      URL.revokeObjectURL(current.url);
      localUrlsRef.current.delete(current.url);
    }
    setter(next);
    setResultUrl(null);
    setPhase('idle');
  };

  const clearImageAt = (slot: 'first' | 'second') => {
    const setter = slot === 'first' ? setFirstImage : setSecondImage;
    const current = slot === 'first' ? firstImage : secondImage;
    if (current) {
      URL.revokeObjectURL(current.url);
      localUrlsRef.current.delete(current.url);
    }
    setter(null);
  };

  const replaceVideo = async (file: File | null) => {
    if (!file) return;
    if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
      toast.error(m['site.hotel.video_type']());
      return;
    }
    if (file.size <= 0 || file.size > MAX_VIDEO_BYTES) {
      toast.error(m['site.hotel.video_size']());
      return;
    }

    try {
      const meta = await readVideoMetadata(file);
      const durationSeconds = meta.duration;
      if (
        durationSeconds < MIN_REFERENCE_VIDEO_SECONDS ||
        durationSeconds > MAX_REFERENCE_VIDEO_SECONDS
      ) {
        toast.error(m['site.hotel.video_duration']());
        return;
      }
      try {
        assertClientVideoDimensions(meta.width, meta.height);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unsupported video resolution'
        );
        return;
      }

      const url = URL.createObjectURL(file);
      localUrlsRef.current.add(url);
      if (video?.kind === 'upload') {
        URL.revokeObjectURL(video.url);
        localUrlsRef.current.delete(video.url);
      }

      setVideo({
        kind: 'upload',
        file,
        url,
        durationSeconds,
      });
      setResultUrl(null);
      setPhase('idle');
    } catch {
      toast.error(m['site.hotel.video_unreadable']());
    }
  };

  const clearVideo = () => {
    if (!allowCustomVideo) return;
    if (video?.kind === 'upload') {
      URL.revokeObjectURL(video.url);
      localUrlsRef.current.delete(video.url);
    }
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const restoreTemplate = () => {
    if (video?.kind === 'upload') {
      URL.revokeObjectURL(video.url);
      localUrlsRef.current.delete(video.url);
    }
    setTemplateAvailable(true);
    setVideo({ kind: 'template', url: templateUrl });
    setResultUrl(null);
    setPhase('idle');
  };

  const pollUntilComplete = async (id: string) => {
    let consecutivePollErrors = 0;

    for (let attempt = 0; attempt < 240; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      if (!mountedRef.current) return;

      let poll: GenerationPoll;
      try {
        poll = await apiGet<GenerationPoll>(
          `/api/hotel-lobby/status?generationId=${encodeURIComponent(id)}`
        );
        consecutivePollErrors = 0;
      } catch (error) {
        consecutivePollErrors += 1;
        if (consecutivePollErrors < 5) continue;
        throw error;
      }

      setProviderStatus(poll.providerStatus || '');
      if (poll.providerStatus === 'persisting') setPhase('saving');

      if (poll.status === 'completed' && poll.videoUrl) {
        setResultUrl(poll.videoUrl);
        setPhase('done');
        await creditsQuery.refetch();
        return;
      }

      if (poll.status === 'failed') {
        setPhase('idle');
        await creditsQuery.refetch();
        throw new Error(poll.error || 'Generation failed');
      }
    }

    setPhase('idle');
    throw new Error(m['site.hotel.running']());
  };

  const generate = async () => {
    creditGate.clear();

    if (!session?.user) {
      redirectToSignIn();
      return;
    }
    if (!presetEnabled || (!allowCustomVideo && !templateAvailable)) {
      toast.error(m['site.crazy.unavailable']());
      return;
    }
    if (!video || sourceDuration == null) {
      toast.error(
        isCrazyFrog
          ? m['site.crazy.need_template']()
          : m['site.hotel.need_video']()
      );
      return;
    }
    if (!firstImage) {
      toast.error(
        isCrazyFrog
          ? m['site.crazy.need_first']()
          : m['site.hotel.need_first']()
      );
      return;
    }
    if (minImages >= 2 && !secondImage) {
      toast.error(
        isCrazyFrog
          ? m['site.crazy.need_second']()
          : m['site.hotel.need_first']()
      );
      return;
    }
    if (
      clipDurationSeconds < MIN_REFERENCE_VIDEO_SECONDS ||
      clipDurationSeconds > MAX_REFERENCE_VIDEO_SECONDS
    ) {
      toast.error(m['site.hotel.trim_error']());
      return;
    }
    if (!estimatedCredits) {
      toast.error(m['site.hotel.reading_duration']());
      return;
    }

    const requiredCredits = estimatedCredits;
    const balance = creditsQuery.data?.balance ?? 0;

    if (!creditsQuery.isPending && balance < requiredCredits) {
      creditGate.open({ requiredCredits, balance });
      return;
    }

    setResultUrl(null);
    setProviderStatus('');
    setPhase('uploading');

    const id = crypto.randomUUID();
    setGenerationId(id);

    // Fixed-template presets always seal the server template; never upload/trim video.
    const useFullTemplate =
      !allowCustomVideo ||
      (video.kind === 'template' &&
        isFullSourceClip(trimStart, trimEnd, sourceDuration));

    try {
      let referenceVideoFile: File | null = null;
      if (!useFullTemplate) {
        if (
          video.kind === 'upload' &&
          isFullSourceClip(trimStart, trimEnd, sourceDuration)
        ) {
          referenceVideoFile = video.file;
        } else {
          const sourceUrl =
            video.kind === 'template' ? TEMPLATE_FILE_URL : video.url;
          referenceVideoFile = await trimVideoToFile({
            sourceUrl,
            startSeconds: trimStart,
            endSeconds: trimEnd,
          });
        }
      }

      const useDefaultTemplate = useFullTemplate;
      const filesForUpload = useDefaultTemplate
        ? imageItems.slice(0, maxImages).map((item) => item.file)
        : [
            referenceVideoFile as File,
            ...imageItems.slice(0, maxImages).map((item) => item.file),
          ];
      const contentTypes = filesForUpload.map(
        (file) => file.type || 'application/octet-stream'
      );
      const contentLengths = filesForUpload.map((file) => file.size);

      const setup = await apiPost<UploadSetup>('/api/hotel-lobby/upload-url', {
        generationId: id,
        presetId,
        useDefaultTemplate,
        contentTypes,
        contentLengths,
      });

      if (setup.uploads.length !== filesForUpload.length) {
        throw new Error('Upload setup returned an incomplete file list');
      }

      for (let index = 0; index < filesForUpload.length; index += 1) {
        const upload = setup.uploads[index];
        await uploadToSignedUrl({
          url: upload.uploadUrl,
          file: filesForUpload[index],
          headers: upload.uploadHeaders,
        });
      }

      const sortedUploads = [...setup.uploads].sort(
        (a, b) => a.index - b.index
      );
      const videoUpload = sortedUploads.find((item) => item.index === 0);
      const imageUploads = sortedUploads.filter((item) => item.index > 0);

      setPhase('starting');
      const start = await apiPost<GenerationStart>(
        '/api/hotel-lobby/generate',
        {
          generationId: id,
          presetId,
          useDefaultTemplate,
          videoKey: videoUpload?.storageKey,
          imageKeys: imageUploads.map((item) => item.storageKey),
          contentTypes,
          contentLengths,
          durationSeconds: billedDuration,
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

      setPhase('generating');
      await pollUntilComplete(id);
    } catch (error) {
      if (error instanceof ApiError) {
        const data =
          error.data && typeof error.data === 'object'
            ? (error.data as Record<string, unknown>)
            : null;
        if (data?.code === 'INSUFFICIENT_CREDITS') {
          creditGate.open({
            requiredCredits: Number(data.requiredCredits) || requiredCredits,
            balance: Number(data.balance) || 0,
          });
          setPhase('idle');
          return;
        }
      }

      setPhase('idle');
      toast.error(
        error instanceof Error ? error.message : 'Generation failed to start'
      );
    }
  };

  const phaseLabel = isCrazyFrog
    ? m['site.common.generating']()
    : phase === 'uploading'
      ? 'Preparing clip…'
      : phase === 'starting'
        ? 'Starting…'
        : phase === 'generating'
          ? providerStatus
            ? `Generating · ${providerStatus}`
            : m['site.common.generating']()
          : phase === 'saving'
            ? m['site.common.saving']()
            : m['site.generator.generate']();

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(30,23,19,0.92)] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/8 p-4 sm:p-5 lg:border-r lg:border-b-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white/90">
                  {isCrazyFrog
                    ? m['site.crazy.reference']()
                    : m['site.hotel.reference']()}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-white/40">
                  {isCrazyFrog
                    ? m['site.crazy.reference_note']()
                    : m['site.hotel.reference_note']()}
                </p>
              </div>
              {video?.kind === 'template' ? (
                <span className="shrink-0 rounded-full border border-[rgba(204,144,92,0.18)] bg-[rgba(204,144,92,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[rgb(220,155,99)]">
                  {m['site.hotel.preset']()}
                </span>
              ) : null}
            </div>

            {allowCustomVideo ? (
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  void replaceVideo(event.target.files?.[0] || null);
                  event.target.value = '';
                }}
              />
            ) : null}

            {video ? (
              <div>
                <div
                  className={`relative overflow-hidden rounded-2xl border border-[rgba(204,144,92,0.24)] bg-black ${previewAspectClass} ${''}`}
                >
                  <video
                    ref={previewVideoRef}
                    key={video.url}
                    src={video.url}
                    poster={
                      isCrazyFrog
                        ? '/videos/crazy-frog-tpl-poster.jpg'
                        : undefined
                    }
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="size-full object-contain"
                    onLoadedMetadata={(event) => {
                      const seconds = event.currentTarget.duration;
                      if (!Number.isFinite(seconds) || seconds <= 0) return;
                      if (video.kind === 'template') {
                        setVideo((current) =>
                          current?.kind === 'template'
                            ? { ...current, durationSeconds: seconds }
                            : current
                        );
                      }
                    }}
                    onError={() => {
                      if (video.kind !== 'template') return;
                      // Public Crazy Frog preview failure is not an R2 gate signal.
                      if (isCrazyFrog) return;
                      setTemplateAvailable(false);
                      if (allowCustomVideo) setVideo(null);
                    }}
                  />
                  {allowCustomVideo ? (
                    <button
                      type="button"
                      onClick={clearVideo}
                      disabled={busy}
                      aria-label={m['site.generator.video_remove']()}
                      className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white/80 backdrop-blur transition hover:bg-black/90 disabled:opacity-40"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  ) : null}
                </div>
                {allowTrim && sourceDuration != null ? (
                  <HotelLobbyTrimBar
                    durationSeconds={sourceDuration}
                    startSeconds={trimStart}
                    endSeconds={trimEnd}
                    minClipSeconds={MIN_REFERENCE_VIDEO_SECONDS}
                    maxClipSeconds={MAX_REFERENCE_VIDEO_SECONDS}
                    disabled={busy && !trimming}
                    applying={trimming}
                    canApply={
                      !isFullSourceClip(trimStart, trimEnd, sourceDuration) &&
                      clipDurationSeconds >= MIN_REFERENCE_VIDEO_SECONDS &&
                      clipDurationSeconds <= MAX_REFERENCE_VIDEO_SECONDS
                    }
                    onChange={({ startSeconds, endSeconds }) => {
                      setTrimStart(startSeconds);
                      setTrimEnd(endSeconds);
                      const preview = previewVideoRef.current;
                      if (preview) {
                        try {
                          preview.currentTime = startSeconds;
                        } catch {
                          // Ignore seek errors while metadata is still loading.
                        }
                      }
                    }}
                    onApply={() => {
                      void applyTrim();
                    }}
                  />
                ) : null}
              </div>
            ) : allowCustomVideo ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => videoInputRef.current?.click()}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[rgba(204,144,92,0.35)] bg-[rgba(204,144,92,0.04)] text-center transition hover:border-[rgba(204,144,92,0.62)] hover:bg-[rgba(204,144,92,0.07)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-[rgba(204,144,92,0.12)] text-[rgb(220,155,99)]">
                    <FilmIcon className="size-6" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white/82">
                      {m['site.hotel.upload_video']()}
                    </span>
                    <span className="mt-1 block text-xs text-white/38">
                      MP4 or MOV · 3–15s · 720–3840px · up to 80 MB
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={restoreTemplate}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(220,155,99)] transition hover:text-[rgb(235,174,119)] disabled:opacity-50"
                >
                  <RotateCcw className="size-3.5" />
                  {templateAvailable
                    ? m['site.hotel.restore']()
                    : m['site.hotel.retry']()}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.025] px-4 py-10 text-center text-sm text-white/45">
                {m['site.crazy.template_missing']()}
                <button
                  type="button"
                  disabled={busy}
                  onClick={restoreTemplate}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(220,155,99)] transition hover:text-[rgb(235,174,119)] disabled:opacity-50"
                >
                  <RotateCcw className="size-3.5" />
                  {m['site.hotel.retry']()}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5">
            <div
              className={`grid gap-3 ${maxImages > 1 ? 'grid-cols-2' : 'max-w-sm grid-cols-1'}`}
            >
              <PersonSlot
                title={
                  isCrazyFrog
                    ? m['site.crazy.first']()
                    : m['site.hotel.first']()
                }
                note={
                  isCrazyFrog
                    ? m['site.crazy.first_note']()
                    : m['site.hotel.first_note']()
                }
                item={firstImage}
                inputRef={firstImageInputRef}
                disabled={busy}
                onPick={(file) => setImageAt('first', file)}
                onRemove={() => clearImageAt('first')}
              />
              {maxImages > 1 ? (
                <PersonSlot
                  title={
                    isCrazyFrog
                      ? m['site.crazy.second']()
                      : m['site.hotel.second']()
                  }
                  note={
                    isCrazyFrog
                      ? m['site.crazy.second_note']()
                      : m['site.hotel.second_note']()
                  }
                  item={secondImage}
                  inputRef={secondImageInputRef}
                  disabled={busy}
                  onPick={(file) => setImageAt('second', file)}
                  onRemove={() => clearImageAt('second')}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 p-4 sm:p-5">
          {!presetEnabled || (!allowCustomVideo && !templateAvailable) ? (
            <p className="mb-3 text-center text-xs text-white/40 sm:text-left">
              {m['site.crazy.unavailable']()}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              disabled={
                busy ||
                sessionPending ||
                !presetEnabled ||
                (!allowCustomVideo && !templateAvailable)
              }
              onClick={() => void generate()}
              className="inline-flex h-11 w-full min-w-[240px] items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,rgb(222,151,92),rgb(189,111,64))] px-5 text-sm font-semibold text-white shadow-[0_12px_32px_-12px_rgba(218,134,75,0.7)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : session?.user ? (
                <Play className="size-4 fill-current" />
              ) : (
                <Upload className="size-4" />
              )}
              <span>
                {!session?.user
                  ? m['site.common.signin_generate']()
                  : busy
                    ? phaseLabel
                    : estimatedCredits
                      ? m['site.common.generate_estimate']({
                          count: String(estimatedCredits),
                        })
                      : m['site.generator.generate']()}
              </span>
            </button>
          </div>
        </div>
      </div>

      {resultUrl ? (
        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(25,20,17,0.94)] p-3 shadow-2xl sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-semibold text-white/90">
                {m['site.common.your_video']()}
              </p>
              {isCrazyFrog ? null : (
                <p className="mt-0.5 text-xs text-white/38">Hotel Lobby</p>
              )}
            </div>
            <a
              href={
                generationId
                  ? `/api/hotel-lobby/result/${encodeURIComponent(generationId)}?download=1`
                  : resultUrl
              }
              download={
                generationId
                  ? `${isCrazyFrog ? 'crazy-frog' : 'hotel-lobby'}-${generationId.slice(0, 8)}.mp4`
                  : undefined
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Download className="size-3.5" />
              {m['site.common.download']()}
            </a>
          </div>
          <video
            src={resultUrl}
            controls
            autoPlay
            playsInline
            className={`mx-auto max-h-[720px] w-full max-w-full rounded-2xl bg-black object-contain ${previewAspectClass}`}
          />
          {generationId ? (
            <p className="mt-2 px-1 text-[10px] text-white/25">
              {m['site.common.generation_id']({ id: generationId.slice(0, 8) })}
            </p>
          ) : null}
        </div>
      ) : null}

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
