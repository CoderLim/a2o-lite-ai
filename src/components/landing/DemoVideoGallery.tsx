import { Copy } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import {
  DEMO_WORKS,
  isRecreatableDemoWork,
  type DemoWork,
} from '@/components/landing/demo-works';

type DemoVideoGalleryProps = {
  className?: string;
  recreatingWorkId?: string | null;
  onRecreate?: (work: DemoWork) => void;
};

function DemoTile({
  work,
  recreating,
  onRecreate,
}: {
  work: DemoWork;
  recreating: boolean;
  onRecreate?: (work: DemoWork) => void;
}) {
  const label = tDynamic(work.labelKey);
  const canRecreate = isRecreatableDemoWork(work) && Boolean(onRecreate);

  return (
    <figure className="min-w-0">
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_8px_24px_rgba(0,0,0,0.28)]',
          work.result.aspect === 'portrait' ? 'aspect-9/16' : 'aspect-video'
        )}
      >
        <video
          className="size-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={work.result.poster}
          aria-label={label}
        >
          <source src={work.result.src} type="video/mp4" />
        </video>
        <img
          src={work.result.poster}
          alt={label}
          className="hidden size-full object-cover motion-reduce:block"
        />

        {canRecreate ? (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100"
              aria-hidden
            />
            <button
              type="button"
              disabled={recreating}
              onClick={() => onRecreate?.(work)}
              aria-label={m['site.demo.recreate']()}
              className={cn(
                'absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(204,144,92)] px-2.5 py-1.5 text-[12px] font-semibold text-[rgb(32,24,18)] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)] transition',
                'opacity-100 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100',
                'hover:brightness-105 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[rgb(204,144,92)]/70 focus-visible:outline-none',
                recreating && 'cursor-wait opacity-80'
              )}
            >
              <Copy className="size-3.5 shrink-0" aria-hidden />
              {recreating
                ? m['site.demo.recreate_loading']()
                : m['site.demo.recreate']()}
            </button>
          </>
        ) : null}
      </div>
    </figure>
  );
}

export function DemoVideoGallery({
  className,
  recreatingWorkId = null,
  onRecreate,
}: DemoVideoGalleryProps) {
  const portraits = DEMO_WORKS.filter((d) => d.result.aspect === 'portrait');
  const landscapes = DEMO_WORKS.filter((d) => d.result.aspect === 'landscape');

  return (
    <div
      className={cn(
        'mt-5 space-y-2 sm:mt-6 sm:space-y-3 md:space-y-4',
        className
      )}
      aria-label={m['site.demo.gallery_aria']()}
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {portraits.map((work) => (
          <DemoTile
            key={work.id}
            work={work}
            recreating={recreatingWorkId === work.id}
            onRecreate={onRecreate}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4">
        {landscapes.map((work) => (
          <DemoTile
            key={work.id}
            work={work}
            recreating={recreatingWorkId === work.id}
            onRecreate={onRecreate}
          />
        ))}
      </div>
    </div>
  );
}
