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
 * Pack templates into columns so portrait (tall) and landscape (wide)
 * cards keep their real aspect instead of a uniform portrait grid.
 */
function distributeToColumns(
  templates: MotionTemplate[],
  columnCount: number
): MotionTemplate[][] {
  const columns: MotionTemplate[][] = Array.from(
    { length: columnCount },
    () => []
  );
  const heights = Array.from({ length: columnCount }, () => 0);

  for (const template of templates) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i += 1) {
      if (heights[i]! < heights[shortest]!) shortest = i;
    }
    columns[shortest]!.push(template);
    // Relative height units: 16 for portrait (9:16), 9 for landscape (16:9)
    heights[shortest]! += template.aspect === 'portrait' ? 16 : 9;
  }

  return columns;
}

export function MotionTemplateGallery({
  className,
  applyingTemplateId = null,
  onSelect,
}: MotionTemplateGalleryProps) {
  // 3 columns keeps cards small (~1/3 width) and mixes tall/wide naturally.
  const columns = distributeToColumns(MOTION_TEMPLATES, 3);

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

      <div className="grid max-w-[420px] grid-cols-3 gap-1.5 sm:max-w-[480px] sm:gap-2">
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex min-w-0 flex-col gap-1.5 sm:gap-2"
          >
            {column.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                applying={applyingTemplateId === template.id}
                onSelect={onSelect}
                className={
                  template.aspect === 'portrait'
                    ? 'aspect-9/16'
                    : 'aspect-video'
                }
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
