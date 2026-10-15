# Kairo Bad Times Implementation Plan

> **For agentic workers:** Implement task-by-task. Checkboxes track progress.

**Goal:** Ship `/kairo-bad-times` — one image + fixed 30s template → Fal Kling V3 Standard Motion Control.

**Architecture:** Independent `kairo-bad-times` module + `/api/kairo-bad-times/*`. Product rules local; FalProvider + credits reused. Not Genjutsu, not Hotel Lobby submit path.

**Tech Stack:** TanStack Start, Fal queue, R2, aiTask credits (scene `kairo-bad-times`).

---

### Task 1: Constants + pricing + service

- Create: `src/modules/kairo-bad-times/constants.ts`
- Create: `src/modules/kairo-bad-times/pricing.ts` + `.test.ts`
- Create: `src/modules/kairo-bad-times/service.ts` (submit/query Motion Control)

### Task 2: Storage + billing

- Create: `src/modules/kairo-bad-times/storage.ts` (image upload, template ensure under `kairo-bad-times/`)
- Create: `src/modules/kairo-bad-times/billing.ts` (credit state machine, scene `kairo-bad-times`)
- Create: `src/modules/kairo-bad-times/video-metadata.ts` (reuse probe pattern; duration 3–30)

### Task 3: API routes

- Create: `upload-url`, `template-meta`, `generate`, `status`, `result/$generationId`

### Task 4: UI + page + i18n

- Create: `KairoBadTimesGeneratorPanel.tsx`
- Create: `src/routes/kairo-bad-times.tsx`
- Messages en/zh (no Kling brand in user copy)
- Env: `KAIRO_BAD_TIMES_TEMPLATE_VIDEO_KEY`

### Task 5: Wire admin/creations scene if needed + verify build/tests

---
