# A2O LITE AI

Turn two photos into a NEON-style dance video. Live at [a2oliteai.com](https://a2oliteai.com).

## Quick Start

```bash
pnpm install
cp .env.example .env.development   # if needed
pnpm db:setup && pnpm db:push
pnpm dev
```

App name / domain are configured in `site.config.json` and `VITE_APP_*` env vars.

## Stack

ShipAny TanStack (Vite + Nitro + React 19) — payments, credits, auth, and the Genjutsu generation pipeline.
