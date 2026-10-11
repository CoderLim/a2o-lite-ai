import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import {
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

  return (
    <button
      type="button"
      disabled={applying || !onSelect}
      onClick={() => onSelect?.(template)}
      aria-label={m['site.templates.use_aria']({ title })}
      className={cn(
        'group relative w-[140px] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/12 bg-black/45 text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition sm:w-[160px]',
        'hover:border-[rgba(204,144,92,0.45)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[rgb(204,144,92)]/70 focus-visible:outline-none',
        applying && 'cursor-wait opacity-80'
      )}
    >
      <div className="aspect-9/16 overflow-hidden">
        <video
          className="size-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={template.poster}
          aria-hidden
        >
          <source src={template.sourceVideo} type="video/mp4" />
        </video>
        <img
          src={template.poster}
          alt=""
          className="hidden size-full object-cover motion-reduce:block"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-2.5 pt-8 pb-2.5">
        <p className="truncate text-[12px] font-semibold text-[rgb(237,234,222)]">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-[rgb(204,144,92)]">
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
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:gap-3">
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
