import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import {
  getMotionTemplatePreviewSrc,
  getMotionTemplatesByAspect,
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
  className,
}: {
  template: MotionTemplate;
  applying: boolean;
  onSelect?: (template: MotionTemplate) => void;
  className?: string;
}) {
  const title = tDynamic(template.titleKey);

  return (
    <button
      type="button"
      disabled={applying || !onSelect}
      onClick={() => onSelect?.(template)}
      aria-label={m['site.templates.use_aria']({ title })}
      className={cn(
        'group relative min-h-0 w-full cursor-pointer overflow-hidden rounded-xl border border-white/12 bg-black/45 text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition',
        'hover:border-[rgba(204,144,92,0.45)] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[rgb(204,144,92)]/70 focus-visible:outline-none',
        applying && 'cursor-wait opacity-80',
        className
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

function TemplateColumn({
  templates,
  applyingTemplateId,
  onSelect,
  className,
}: {
  templates: MotionTemplate[];
  applyingTemplateId?: string | null;
  onSelect?: (template: MotionTemplate) => void;
  className?: string;
}) {
  if (templates.length === 0) return null;

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-col gap-2.5 sm:gap-3',
        className
      )}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          applying={applyingTemplateId === template.id}
          onSelect={onSelect}
          className="h-full min-h-0 flex-1"
        />
      ))}
    </div>
  );
}

export function MotionTemplateGallery({
  className,
  applyingTemplateId = null,
  onSelect,
}: MotionTemplateGalleryProps) {
  const { portraits, landscapes } = getMotionTemplatesByAspect();
  if (portraits.length === 0 && landscapes.length === 0) return null;

  // Prefer portrait column width when both exist (matches the 左竖右横 sketch).
  const onlyLandscapes = portraits.length === 0;
  const onlyPortraits = landscapes.length === 0;

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

      <div
        className={cn(
          'mx-auto flex max-w-xl items-stretch gap-2.5 sm:max-w-2xl sm:gap-3',
          // Give the block a stable height so flex-1 cards share space evenly.
          'min-h-[320px] sm:min-h-[400px]'
        )}
      >
        {onlyLandscapes ? (
          <TemplateColumn
            templates={landscapes}
            applyingTemplateId={applyingTemplateId}
            onSelect={onSelect}
            className="w-full"
          />
        ) : onlyPortraits ? (
          <TemplateColumn
            templates={portraits}
            applyingTemplateId={applyingTemplateId}
            onSelect={onSelect}
            className="w-full"
          />
        ) : (
          <>
            <TemplateColumn
              templates={portraits}
              applyingTemplateId={applyingTemplateId}
              onSelect={onSelect}
              className="w-[46%] shrink-0"
            />
            <TemplateColumn
              templates={landscapes}
              applyingTemplateId={applyingTemplateId}
              onSelect={onSelect}
              className="flex-1"
            />
          </>
        )}
      </div>
    </section>
  );
}
