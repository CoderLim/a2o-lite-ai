import type { CSSProperties } from 'react';

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
 * Six portrait-width units per desktop row. A landscape stack occupies
 * two units, and each portrait occupies one. Keep complete landscape pairs
 * together so the 1:2 and 2:1 cards have the same total height.
 */
function groupTemplateBlocks(templates: MotionTemplate[]) {
  const portraits = templates.filter((template) => template.aspect === 'portrait');
  const landscapes = templates.filter(
    (template) => template.aspect === 'landscape'
  );
  type Block =
    | { kind: 'portrait'; template: MotionTemplate }
    | { kind: 'landscape-stack'; templates: [MotionTemplate, MotionTemplate] }
    | { kind: 'landscape-single'; template: MotionTemplate };

  const blocks: Block[] = [];
  let portraitIndex = 0;
  let landscapeIndex = 0;

  // Desktop: portrait(1) + stacked landscapes(2) +
  // portrait(1) + stacked landscapes(2) = six width units.
  while (
    portraitIndex + 1 < portraits.length &&
    landscapeIndex + 3 < landscapes.length
  ) {
    blocks.push({ kind: 'portrait', template: portraits[portraitIndex++]! });
    blocks.push({
      kind: 'landscape-stack',
      templates: [landscapes[landscapeIndex++]!, landscapes[landscapeIndex++]!],
    });
    blocks.push({ kind: 'portrait', template: portraits[portraitIndex++]! });
    blocks.push({
      kind: 'landscape-stack',
      templates: [landscapes[landscapeIndex++]!, landscapes[landscapeIndex++]!],
    });
  }

  while (portraitIndex < portraits.length) {
    blocks.push({ kind: 'portrait', template: portraits[portraitIndex++]! });
  }
  while (landscapeIndex + 1 < landscapes.length) {
    blocks.push({
      kind: 'landscape-stack',
      templates: [landscapes[landscapeIndex++]!, landscapes[landscapeIndex++]!],
    });
  }
  if (landscapeIndex < landscapes.length) {
    blocks.push({
      kind: 'landscape-single',
      template: landscapes[landscapeIndex]!,
    });
  }
  return blocks;
}

export function MotionTemplateGallery({
  className,
  applyingTemplateId = null,
  onSelect,
}: MotionTemplateGalleryProps) {
  const blocks = groupTemplateBlocks(MOTION_TEMPLATES);

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
        className="mx-auto flex w-full max-w-[960px] flex-wrap gap-[var(--template-gap)] [--template-columns:4] [--template-gap:8px] sm:[--template-gap:12px] md:[--template-columns:6] lg:[--template-gap:16px]"
        style={{
          // p = (W - gap) / columns. A landscape stack is 2p - gap wide:
          // two 2:1 cards + their gap have the height of one 1:2 portrait.
          // Full desktop row: p + (2p-gap) + p + (2p-gap) + 3 gaps = W.
          '--template-unit':
            'calc((100% - var(--template-gap)) / var(--template-columns))',
        } as CSSProperties}
      >
        {blocks.map((block) => {
          if (block.kind === 'portrait') {
            return (
              <div
                key={block.template.id}
                className="min-w-0 shrink-0"
                style={{ width: 'var(--template-unit)' }}
              >
                <TemplateCard
                  template={block.template}
                  applying={applyingTemplateId === block.template.id}
                  onSelect={onSelect}
                  className="aspect-[1/2]"
                />
              </div>
            );
          }

          const wideWidth = 'calc(2 * var(--template-unit) - var(--template-gap))';
          if (block.kind === 'landscape-single') {
            return (
              <div
                key={block.template.id}
                className="min-w-0 shrink-0"
                style={{ width: wideWidth }}
              >
                <TemplateCard
                  template={block.template}
                  applying={applyingTemplateId === block.template.id}
                  onSelect={onSelect}
                  className="aspect-[2/1]"
                />
              </div>
            );
          }

          return (
            <div
              key={block.templates[0].id}
              className="flex min-w-0 shrink-0 flex-col gap-[var(--template-gap)]"
              style={{ width: wideWidth }}
            >
              {block.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  applying={applyingTemplateId === template.id}
                  onSelect={onSelect}
                  className="aspect-[2/1]"
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
