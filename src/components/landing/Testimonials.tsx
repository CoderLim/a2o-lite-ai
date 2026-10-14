import type { Testimonial } from '@/types/landing';

import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import { TESTIMONIALS } from '@/components/landing/content';

const TESTIMONIAL_COPY = [
  { quote: m['site.testimonials.quote1'], role: m['site.testimonials.role1'] },
  { quote: m['site.testimonials.quote2'], role: m['site.testimonials.role2'] },
  { quote: m['site.testimonials.quote3'], role: m['site.testimonials.role3'] },
  { quote: m['site.testimonials.quote4'], role: m['site.testimonials.role4'] },
  { quote: m['site.testimonials.quote5'], role: m['site.testimonials.role5'] },
  { quote: m['site.testimonials.quote6'], role: m['site.testimonials.role6'] },
  { quote: m['site.testimonials.quote7'], role: m['site.testimonials.role7'] },
  { quote: m['site.testimonials.quote8'], role: m['site.testimonials.role8'] },
  { quote: m['site.testimonials.quote9'], role: m['site.testimonials.role9'] },
];

function QuoteCard({ item, index }: { item: Testimonial; index: number }) {
  const copy = TESTIMONIAL_COPY[index];

  return (
    <article
      className={cn(
        'border-border w-full rounded-3xl border p-10',
        'shadow-primary/10 shadow-lg'
      )}
    >
      <div className="text-foreground/90 text-sm leading-relaxed">
        {copy?.quote() ?? item.quote}
      </div>
      <div className="mt-5 flex items-center gap-2">
        <img
          src={item.avatarSrc}
          alt={item.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <div className="text-foreground leading-5 font-medium tracking-tight">
            {item.name}
          </div>
          <div className="leading-5 tracking-tight opacity-60">
            {copy?.role() ?? item.role}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Testimonials() {
  return (
    <section className="bg-background relative my-20">
      <div className="z-10 container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
          <div className="flex justify-center">
            <div
              className={cn(
                'border-border/60 bg-background/50 rounded-full border px-5 py-1.5',
                'text-foreground/80 text-xs font-semibold backdrop-blur-sm'
              )}
            >
              {m['site.testimonials.tag']()}
            </div>
          </div>
          <h2 className="text-foreground mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            {m['site.testimonials.title']()}
          </h2>
          <p className="text-foreground/80 mt-6 text-lg leading-relaxed">
            {m['site.testimonials.subtitle']()}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <QuoteCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
