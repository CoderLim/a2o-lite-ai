# Genjutsu AI pricing

> **Active catalog (2026-10-11):** V1 **USD prices** ($4.99 / $9.99 / $19.99 / $39.99) with **reduced credits** aligned to V2 unit economics (~47–53% theoretical model-cost margin). Waffo remote product prices can stay on the existing V1 SKUs; credit grants always come from this catalog. Prior purchases keep their order snapshots.

Status: active (credit amounts revised 2026-10-11)  
Decision date: 2026-09-30 (prices); 2026-10-11 (credit cut)

## Decision

Launch with **prepaid credits and no subscription**.

Public positioning:

> Pay only for what you generate. No subscription. Starts at $4.99.

Credit packs:

| Pack    |  Price | Credits | Notes                                   |
| ------- | -----: | ------: | --------------------------------------- |
| Starter |  $4.99 |     400 | Lowest entry price (was 500)            |
| Creator |  $9.99 |     850 | Default / popular (was 1,100)           |
| Pro     | $19.99 |   1,750 | Larger wallet (was 2,400)               |
| Studio  | $39.99 |   3,600 | Largest pack (was 5,000); best $/credit |

The catalog lives in `src/modules/genjutsu/pricing.ts`. Payment-provider
product IDs must not become the source of truth for credit amounts; checkout
and webhook code should resolve the purchased pack from this catalog.

## Generation pricing

Do not hard-code a fixed "Motion Transfer costs X" or "Object Swap costs Y"
price.

Use provider cost as the base:

```text
credits_to_charge =
  ceil(provider_cost_usd * 100 credits/USD * 1.7)
```

Both Genjutsu modes use the same rule initially.

Example:

```text
provider cost = $3.405
credits = ceil(3.405 * 100 * 1.7)
        = 579 credits
```

This keeps generation pricing decoupled from pack prices and lets us adjust
the margin multiplier without changing checkout products.

## Provider-price fallback

Higgsfield currently publishes Genjutsu list pricing before account discounts:

- 480p: $0.318 per input-video second
- 720p: $0.681 per input-video second
- 1080p: $1.632 per input-video second
- input duration is rounded up to the next whole second

Those rates are captured as a **display/test fallback** in
`src/modules/genjutsu/pricing.ts`. Production charging uses Higgsfield's
`POST /estimate/<model>` endpoint with the exact request body and converts
the returned USD estimate into Genjutsu credits on the server.

Do not trust a client-supplied price, credit amount, or duration-based cost.
The provider estimate is authoritative for reserve pricing.

## Important margin note

The 1.7x formula is the markup at the credit-accounting layer. Bonus credits
in larger packs reduce the effective revenue multiple.

For a hypothetical $1.00 provider cost (170 credits charged), using the
revised credit grants:

| Pack    | Effective revenue | Effective revenue / provider cost | Gross margin before payment fees |
| ------- | ----------------: | --------------------------------: | -------------------------------: |
| Starter |             $2.12 |                             2.12x |                             ~53% |
| Creator |             $2.00 |                             2.00x |                             ~50% |
| Pro     |             $1.94 |                             1.94x |                             ~48% |
| Studio  |             $1.89 |                             1.89x |                             ~47% |

These are **theoretical model-cost margins** at the 170-credits-per-USD
conversion (same assumptions as the V2 plan). They ignore payment fees,
refunds, quote variance, and infra.

After the first real paid generations, review actual provider cost, payment
fees, refund/failure rate, and pack mix before further catalog changes.

## Checkout / Waffo integration

The Waffo integration should consume the pricing catalog instead of defining a
second independent catalog.

Recommended flow:

1. User uploads/configures a generation.
2. UI shows a credit estimate.
3. Server calculates or validates the authoritative charge.
4. If balance is insufficient, show the smallest useful credit pack(s).
5. Waffo checkout metadata includes the internal `packId`.
6. Waffo webhook verifies the event and resolves `packId` against
   `GENJUTSU_CREDIT_PACKS`.
7. Credit grant is idempotent by Waffo order/payment ID.
8. Generation debit and provider submission must be coordinated so retries
   cannot double-charge or create duplicate generations.

Never trust any client-supplied price, credit amount, provider cost, or
`packId -> credits` mapping.

## Balance/debit model

Prefer a ledger over mutating only a single balance field.

Minimum transaction types:

- `purchase`
- `generation_reserve`
- `generation_settle`
- `generation_refund`
- `admin_adjustment`

A generation should have its own idempotency key. Retrying the submit endpoint
must not reserve credits twice.

Whether a provider failure is refunded should follow the actual Higgsfield
billing outcome. Higgsfield states that some rejected/server-error requests are
not billed; do not automatically assume every failed terminal generation is
free.

## Resolution support

Higgsfield's current Genjutsu API reference supports **480p, 720p and 1080p**
for both Motion Transfer and Object Swap. Keep all three options server
validated and priced through the provider estimate endpoint.

## First-launch scope

Included:

- prepaid credit packs
- $4.99 minimum purchase
- dynamic credit consumption from provider cost
- no subscription
- no free generation
- server-authoritative grants/debits
- idempotent Waffo webhook handling

Not required for first launch:

- monthly subscription
- unlimited plan
- automatic recurring refill
- free generation/preview that invokes Genjutsu
- complicated per-mode pricing

## Metrics to collect

At minimum:

- pricing viewed
- pack selected
- checkout started
- checkout paid
- checkout abandoned
- generation quoted credits
- generation started
- generation completed / failed
- provider cost
- credits settled/refunded
- pack ID
- mode
- resolution
- input duration

The first pricing review should be based on real paid generations rather than
traffic alone.
