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
 * Each full mixed row occupies four portrait-width units:
 * portrait (1) | two stacked landscape cards (2) | portrait (1).
 * The tall and wide cards use 1:2 and 2:1 aspect ratios respectively.
 */
function groupTemplateRows(templates: MotionTemplate[]) {
  const portraits = templates.filter(
    (template) => template.aspect === 'portrait'
  );
  const landscapes = templates.filter(
    (template) => template.aspect === 'landscape'
  );
  const mixedRowCount = Math.min(
    Math.floor(portraits.length / 2),
    Math.floor(landscapes.length / 2)
  );

  const mixedRows = Array.from({ length: mixedRowCount }, (_, index) => ({
    leftPortrait: portraits[index * 2]!,
    rightPortrait: portraits[index * 2 + 1]!,
    landscapes: landscapes.slice(index * 2, index * 2 + 2),
  }));

  return {
    mixedRows,
    remainingPortraits: portraits.slice(mixedRowCount * 2),
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

      <div className="mx-auto w-full max-w-[960px] space-y-2 [--template-gap:8px] sm:space-y-3 sm:[--template-gap:12px] lg:space-y-4 lg:[--template-gap:16px]">
        {mixedRows.map(({ leftPortrait, landscapes, rightPortrait }) => (
          <div
            key={leftPortrait.id}
            className="grid gap-[var(--template-gap)]"
            // Card dimensions match exactly, including gaps:
            // portrait width = (W - gap) / 4 and height = 2 * width;
            // landscape width = 2 * portrait width - gap and height = width / 2.
            style={{
              gridTemplateColumns:
                'minmax(0, calc((100% - var(--template-gap)) / 4)) minmax(0, calc((100% - 3 * var(--template-gap)) / 2)) minmax(0, calc((100% - var(--template-gap)) / 4))',
            }}
          >
            <TemplateCard
              template={leftPortrait}
              applying={applyingTemplateId === leftPortrait.id}
              onSelect={onSelect}
              className="aspect-[1/2]"
            />
            <div className="flex min-w-0 flex-col gap-[var(--template-gap)]">
              {landscapes.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  applying={applyingTemplateId === template.id}
                  onSelect={onSelect}
                  className="aspect-[2/1]"
                />
              ))}
            </div>
            <TemplateCard
              template={rightPortrait}
              applying={applyingTemplateId === rightPortrait.id}
              onSelect={onSelect}
              className="aspect-[1/2]"
            />
          </div>
        ))}

        {remainingPortraits.length > 0 && (
          <div className="grid grid-cols-4 gap-[var(--template-gap)]">
            {remainingPortraits.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applying={applyingTemplateId === template.id}
                onSelect={onSelect}
                className="aspect-[1/2]"
              />
            ))}
          </div>
        )}

        {remainingLandscapes.length > 0 && (
          <div className="grid grid-cols-2 gap-[var(--template-gap)]">
            {remainingLandscapes.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applying={applyingTemplateId === template.id}
                onSelect={onSelect}
                className="aspect-[2/1]"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
