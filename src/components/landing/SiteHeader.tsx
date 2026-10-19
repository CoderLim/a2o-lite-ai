import { useEffect, useState } from 'react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/cn';
import { m } from '@/paraglide/messages.js';
import { MenuIcon, RaphaelLogo } from '@/components/icons';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/** Matches `py-3` + `h-10` nav row — used as layout spacer when not floating. */
const HEADER_SPACER_CLASS = 'h-16 shrink-0';

const NAV_LINKS = [
  { label: m['site.header.how'], href: '/#how-to' },
  { label: m['site.header.pricing'], href: '/pricing' },
] as const;

const navLinkClass =
  'hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors';

function BrandLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <RaphaelLogo size={32} className="rounded-full" />
      <span className="text-[20px] font-bold tracking-tight text-[#f9a639]">
        {envConfigs.app_name}
      </span>
    </Link>
  );
}

function UpgradePill({ className }: { className?: string }) {
  return (
    <Link
      href="/pricing"
      className={cn(
        'relative inline-flex h-7 items-center rounded-full px-3.5 text-[11px] font-semibold text-[rgb(36,23,15)] shadow-[0_6px_16px_rgba(221,126,66,0.16)] transition-opacity hover:opacity-90',
        'bg-[linear-gradient(135deg,rgb(240,176,107),rgb(215,123,66))]',
        className
      )}
    >
      {m['site.header.upgrade']()}
      <span className="absolute -top-2 -right-1 rounded bg-[#e05256] px-1 py-px text-[9px] leading-none font-bold text-white">
        -50%
      </span>
    </Link>
  );
}

function SignInButton({ className }: { className?: string }) {
  return (
    <Link
      href="/sign-in"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-[10px] bg-[rgb(204,144,92)] px-4 text-sm font-medium text-[rgb(247,246,243)] transition-colors hover:bg-[rgb(190,130,80)]',
        className
      )}
    >
      {m['site.header.signin']()}
    </Link>
  );
}

function AuthSlot({ className }: { className?: string }) {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div
        className={cn(
          'bg-muted/40 size-9 animate-pulse rounded-full',
          className
        )}
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <SiteUserMenu
        name={user.name || 'User'}
        email={user.email}
        image={user.image}
      />
    );
  }

  return <SignInButton className={className} />;
}

export function SiteHeader({
  /** Overlay the page (no spacer). Use on full-bleed hero pages. */
  floating = false,
}: {
  floating?: boolean;
} = {}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'text-foreground fixed inset-x-0 top-0 z-[260] w-full py-3 transition-[background-color,backdrop-filter] duration-200',
          scrolled
            ? 'bg-background/80 backdrop-blur-sm'
            : 'bg-transparent backdrop-blur-none'
        )}
      >
        <div className="mx-auto px-4 md:max-w-7xl">
          {/* Desktop */}
          <nav className="hidden items-center justify-between gap-4 lg:flex">
            <div className="flex min-w-0 items-center gap-2 xl:gap-4">
              <BrandLink />
              <div className="flex items-center">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass}
                  >
                    {item.label()}
                  </Link>
                ))}
                <Link href="/creations" className={navLinkClass}>
                  {m['creations.nav']()}
                </Link>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <UpgradePill />
              <LocaleSelector className="text-muted-foreground hover:bg-accent hover:text-foreground size-9" />
              <AuthSlot />
            </div>
          </nav>

          {/* Mobile */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <BrandLink />
            <div className="flex items-center gap-2">
              <UpgradePill className="hidden sm:inline-flex" />
              <AuthSlot />
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger
                  aria-label={m['site.header.menu']()}
                  className="text-foreground hover:bg-accent inline-flex size-10 items-center justify-center rounded-md transition-colors"
                >
                  <MenuIcon className="size-5" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="border-border bg-background w-[min(100vw,360px)] p-0"
                >
                  <SheetHeader className="border-border border-b px-4 py-4 text-left">
                    <SheetTitle className="text-primary flex items-center gap-2">
                      <RaphaelLogo size={28} className="rounded-full" />
                      {envConfigs.app_name}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex h-full flex-col overflow-y-auto px-4 pt-2 pb-8">
                    {NAV_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="border-border/60 border-b py-3 text-sm font-medium"
                        onClick={() => setSheetOpen(false)}
                      >
                        {item.label()}
                      </Link>
                    ))}
                    <Link
                      href="/creations"
                      className="border-border/60 border-b py-3 text-sm font-medium"
                      onClick={() => setSheetOpen(false)}
                    >
                      {m['creations.nav']()}
                    </Link>
                    <div className="mt-6 flex flex-col gap-3">
                      <UpgradePill className="w-fit" />
                      <LocaleSelector variant="pill" className="w-fit" />
                      <AuthSlot className="w-full" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      {floating ? null : <div className={HEADER_SPACER_CLASS} aria-hidden />}
    </>
  );
}
