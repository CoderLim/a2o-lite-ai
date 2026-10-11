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
        'group relative block w-full cursor-pointer overflow-hidden rounded-lg border border-white/12 bg-black/45 text-left shadow-[0_6px_16px_rgba(0,0,0,0.28)] transition',
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

/**
 * Build horizontal gallery rows: one portrait on the left, and two
 * landscapes stacked on the right. Unpaired templates get their own
 * complete rows instead of leaving empty slots in the mixed layout.
 */
function groupTemplateRows(templates: MotionTemplate[]) {
  const portraits = templates.filter((template) => template.aspect === 'portrait');
  const landscapes = templates.filter(
    (template) => template.aspect === 'landscape'
  );
  const mixedRowCount = Math.min(
    portraits.length,
    Math.floor(landscapes.length / 2)
  );

  const mixedRows = Array.from({ length: mixedRowCount }, (_, index) => ({
    portrait: portraits[index]!,
    landscapes: landscapes.slice(index * 2, index * 2 + 2),
  }));

  return {
    mixedRows,
    remainingPortraits: portraits.slice(mixedRowCount),
    remainingLandscapes: landscapes.slice(mixedRowCount * 2),
  };
}

export function MotionTemplateGallery({
  className,
  applyingTemplateId = null,
  onSelect,
}: MotionTemplateGalleryProps) {
  const { mixedRows, remainingPortraits, remainingLandscapes } =
    groupTemplateRows(MOTION_TEMPLATES);

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

      <div className="mx-auto w-full max-w-[960px] space-y-3 sm:space-y-4 lg:space-y-5">
        {mixedRows.map(({ portrait, landscapes }) => (
          <div
            key={portrait.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.54fr)] gap-3 sm:gap-4 lg:gap-5"
          >
            <TemplateCard
              template={portrait}
              applying={applyingTemplateId === portrait.id}
              onSelect={onSelect}
              className="aspect-9/16"
            />
            <div className="grid min-w-0 grid-rows-2 gap-3 sm:gap-4 lg:gap-5">
              {landscapes.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  applying={applyingTemplateId === template.id}
                  onSelect={onSelect}
                  className="h-full min-h-0"
                />
              ))}
            </div>
          </div>
        ))}

        {remainingPortraits.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5">
            {remainingPortraits.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applying={applyingTemplateId === template.id}
                onSelect={onSelect}
                className="aspect-9/16"
              />
            ))}
          </div>
        )}

        {remainingLandscapes.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5">
            {remainingLandscapes.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applying={applyingTemplateId === template.id}
                onSelect={onSelect}
                className="aspect-video"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
