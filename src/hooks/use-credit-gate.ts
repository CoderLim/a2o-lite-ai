import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  getSmallestSufficientCreditPack,
  type GenjutsuCreditPack,
} from '@/modules/genjutsu/pricing';
import { apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import type { CreditGateState } from '@/components/credits/insufficient-credits-modal';

export type { CreditGateState };

/**
 * Homepage-parity credit gate: open a modal on insufficient credits, recommend
 * the smallest pack that covers the deficit, and open checkout (or /pricing).
 */
export function useCreditGate(options: {
  balance: number | undefined;
  email?: string | null;
}) {
  const [gate, setGate] = useState<CreditGateState | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const email = options.email;

  useEffect(() => {
    const balance = options.balance;
    if (!gate || typeof balance !== 'number') return;

    if (balance >= gate.requiredCredits) {
      setGate(null);
      return;
    }

    if (balance !== gate.balance) {
      setGate((current) => (current ? { ...current, balance } : current));
    }
  }, [gate, options.balance]);

  const recommendedPack = useMemo(
    (): GenjutsuCreditPack | null =>
      gate
        ? getSmallestSufficientCreditPack({
            balance: gate.balance,
            requiredCredits: gate.requiredCredits,
            email,
          })
        : null,
    [gate, email]
  );

  const clear = useCallback(() => setGate(null), []);

  const open = useCallback((next: CreditGateState) => {
    if (
      !Number.isFinite(next.requiredCredits) ||
      !Number.isFinite(next.balance)
    ) {
      return;
    }
    setGate({
      requiredCredits: next.requiredCredits,
      balance: next.balance,
    });
  }, []);

  const buy = useCallback(async () => {
    if (!gate || checkoutLoading) return;

    if (!recommendedPack) {
      const pricingWindow = window.open('/pricing', '_blank');
      if (pricingWindow) {
        pricingWindow.opener = null;
      } else {
        window.location.href = '/pricing';
      }
      return;
    }

    const checkoutWindow = window.open('', '_blank');
    if (checkoutWindow) checkoutWindow.opener = null;

    setCheckoutLoading(true);
    try {
      const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const checkout = await apiPost<{ checkout_url?: string }>(
        '/api/payment/checkout',
        {
          product_id: recommendedPack.id,
          redirect,
        }
      );

      if (!checkout.checkout_url) {
        throw new Error(m['site.generator.checkout_url_missing']());
      }

      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.location.href = checkout.checkout_url;
      } else {
        window.location.href = checkout.checkout_url;
      }
    } catch (cause) {
      if (checkoutWindow && !checkoutWindow.closed) checkoutWindow.close();
      toast.error(
        cause instanceof Error
          ? cause.message
          : m['genjutsu.credits.checkout_failed']()
      );
    } finally {
      setCheckoutLoading(false);
    }
  }, [checkoutLoading, gate, recommendedPack]);

  return {
    gate,
    setGate,
    open,
    clear,
    checkoutLoading,
    recommendedPack,
    buy,
  };
}
