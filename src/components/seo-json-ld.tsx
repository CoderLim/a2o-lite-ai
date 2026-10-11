import type { ReactNode } from 'react';

/** Safe for trusted schema.org graphs built in-app (not user HTML). */
export function SeoJsonLd({
  value,
}: {
  value: Record<string, unknown>;
}): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }}
    />
  );
}
