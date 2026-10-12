import type { GenjutsuCreditPack } from '@/modules/genjutsu/pricing';
import { m } from '@/paraglide/messages.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type CreditGateState = {
  balance: number;
  requiredCredits: number;
};

function formatCreditPackPrice(pack: GenjutsuCreditPack) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: (pack.currency || 'usd').toUpperCase(),
  }).format(pack.priceCents / 100);
}

export function InsufficientCreditsModal({
  gate,
  pack,
  checkoutLoading,
  onClose,
  onBuy,
}: {
  gate: CreditGateState | null;
  pack: GenjutsuCreditPack | null;
  checkoutLoading: boolean;
  onClose: () => void;
  onBuy: () => void;
}) {
  if (!gate) return null;

  const deficit = Math.max(0, gate.requiredCredits - gate.balance);

  return (
    <Dialog
      open={Boolean(gate)}
      onOpenChange={(open) => {
        if (!open && !checkoutLoading) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!checkoutLoading}
        overlayClassName="z-[490] bg-black/75 backdrop-blur-sm"
        className="z-[500] w-full max-w-[420px] gap-0 rounded-2xl border border-white/10 bg-[rgb(31,24,20)] p-5 text-[rgb(237,234,222)] shadow-2xl sm:max-w-[420px] sm:p-6"
      >
        <DialogHeader className="gap-1.5 pr-8 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {m['genjutsu.credits.insufficient_title']()}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-white/55">
            {m['genjutsu.credits.insufficient_description']({
              count: gate.requiredCredits.toLocaleString(),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 rounded-xl border border-white/8 bg-black/15 px-4 py-3 text-sm">
          <div className="flex items-center justify-between py-1 text-white/58">
            <span>{m['genjutsu.credits.balance']()}</span>
            <span className="tabular-nums">
              {gate.balance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-white/58">
            <span>{m['genjutsu.credits.required']()}</span>
            <span className="tabular-nums">
              {gate.requiredCredits.toLocaleString()}
            </span>
          </div>
          <div className="my-2 h-px bg-white/8" />
          <div className="flex items-center justify-between py-1 font-medium">
            <span>{m['genjutsu.credits.need_label']()}</span>
            <span className="text-[rgb(220,155,99)] tabular-nums">
              {m['genjutsu.credits.need_more']({
                count: deficit.toLocaleString(),
              })}
            </span>
          </div>
        </div>

        {!pack ? (
          <p className="mt-3 text-xs leading-5 text-white/50">
            {m['genjutsu.credits.no_single_pack']({
              count: deficit.toLocaleString(),
            })}
          </p>
        ) : null}

        <button
          type="button"
          disabled={checkoutLoading}
          onClick={onBuy}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[rgb(204,144,92)] px-4 text-sm font-semibold text-[rgb(247,246,243)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {checkoutLoading
            ? m['genjutsu.credits.opening_checkout']()
            : pack
              ? m['genjutsu.credits.buy_pack']({
                  count: pack.credits.toLocaleString(),
                  price: formatCreditPackPrice(pack),
                })
              : m['genjutsu.credits.view_packs']()}
        </button>

        <button
          type="button"
          disabled={checkoutLoading}
          onClick={onClose}
          className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-lg text-sm text-white/45 transition-colors hover:bg-white/5 hover:text-white/70 disabled:pointer-events-none disabled:opacity-40"
        >
          {m['genjutsu.credits.maybe_later']()}
        </button>
      </DialogContent>
    </Dialog>
  );
}
