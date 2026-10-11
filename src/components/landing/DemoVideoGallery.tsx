import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import { DEMO_WORKS, type DemoWork } from '@/components/landing/demo-works';

function DemoTile({ work }: { work: DemoWork }) {
  const label = tDynamic(work.labelKey);

  return (
    <figure className="min-w-0">
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-[0_8px_24px_rgba(0,0,0,0.28)]',
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
      </div>
    </figure>
  );
}

export function DemoVideoGallery({ className }: { className?: string }) {
  const portraits = DEMO_WORKS.filter((d) => d.result.aspect === 'portrait');
  const landscapes = DEMO_WORKS.filter((d) => d.result.aspect === 'landscape');

  return (
    <section
      className={cn('mt-8 space-y-3 sm:mt-10 sm:space-y-4', className)}
      aria-labelledby="demo-examples-heading"
    >
      <div>
        <h2
          id="demo-examples-heading"
          className="text-[18px] font-semibold tracking-tight text-[rgb(237,234,222)] sm:text-[20px]"
        >
          {m['site.demo.examples_title']()}
        </h2>
        <p className="mt-1 text-[13px] text-white/60">
          {m['site.demo.examples_description']()}
        </p>
      </div>
      <div
        className="space-y-2 sm:space-y-3 md:space-y-4"
        aria-label={m['site.demo.gallery_aria']()}
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {portraits.map((work) => (
            <DemoTile key={work.id} work={work} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4">
          {landscapes.map((work) => (
            <DemoTile key={work.id} work={work} />
          ))}
        </div>
      </div>
    </section>
  );
}
