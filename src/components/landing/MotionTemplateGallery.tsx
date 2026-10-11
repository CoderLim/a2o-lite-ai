import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import {
  getMotionTemplatePreviewSrc,
  MOTION_TEMPLATES,
  type MotionTemplate,
} from '@/components/landing/motion-templates';

type MotionTemplateGalleryProps = {
  className?: string;
  applyingTemplateId?: string | null;
  onSelect?: (template: MotionTemplate) => void;
};

function TemplateCard({
  template,
  applying,
  onSelect,
}: {
  template: MotionTemplate;
  applying: boolean;
  onSelect?: (template: MotionTemplate) => void;
}) {
  const title = tDynamic(template.titleKey);
  const landscape = template.aspect === 'landscape';

  return (
    <button
      type="button"
      disabled={applying || !onSelect}
      onClick={() => onSelect?.(template)}
      aria-label={m['site.templates.use_aria']({ title })}
      className={cn(
        'group relative mb-1.5 w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border border-white/12 bg-black/45 text-left shadow-[0_6px_16px_rgba(0,0,0,0.28)] transition sm:mb-2',
        landscape ? 'aspect-video' : 'aspect-9/16',
        'hover:border-[rgba(204,144,92,0.45)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[rgb(204,144,92)]/70 focus-visible:outline-none',
        applying && 'cursor-wait opacity-80'
      )}
    >
      <video
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={template.poster}
        aria-hidden
      >
        <source src={getMotionTemplatePreviewSrc(template)} type="video/mp4" />
      </video>
      <img
        src={template.poster}
        alt=""
        className="absolute inset-0 hidden size-full object-cover motion-reduce:block"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-1.5 pt-5 pb-1.5">
        <p className="truncate text-[10px] font-semibold text-[rgb(237,234,222)]">
          {title}
        </p>
        <p className="mt-0.5 text-[9px] font-medium text-[rgb(204,144,92)]">
          {applying
            ? m['site.templates.applying']()
            : m['site.templates.use']()}
        </p>
      </div>
    </button>
  );
}

export function MotionTemplateGallery({
  className,
  applyingTemplateId = null,
  onSelect,
}: MotionTemplateGalleryProps) {
  return (
    <section
      className={cn('mt-6 text-left', className)}
      aria-labelledby="motion-templates-heading"
    >
      <div className="mb-3">
        <h2
          id="motion-templates-heading"
          className="text-[18px] font-semibold tracking-tight text-[rgb(237,234,222)] sm:text-[20px]"
        >
          {m['site.templates.title']()}
        </h2>
        <p className="mt-1 text-[13px] text-white/60">
          {m['site.templates.description']()}
        </p>
      </div>

      {/* ~1/3 of hero content width (~1180px → ~390px) */}
      <div className="max-w-[390px] columns-2 gap-1.5 sm:gap-2">
        {MOTION_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            applying={applyingTemplateId === template.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
