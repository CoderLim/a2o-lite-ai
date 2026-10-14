# Rumpelstiltskin + Bulin 47 → Kling O3

**Status:** design approved (2026-10-14)  
**Pattern:** Crazy Frog — extend Hotel Lobby / Kling O3 presets; do **not** invent Genjutsu or product-scoped API chains.

## Decisions

| Topic             | Choice                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| UI                | Reuse `HotelLobbyGeneratorPanel` (option A)                                                            |
| Old panels        | Delete `RumpelstiltskinGeneratorPanel` / `Bulin47GeneratorPanel` (option A)                            |
| Prompts           | Rewrite to Kling O3 short imperatives + `@Element1` (option A)                                         |
| Homepage Recreate | Remove both from Genjutsu `MOTION_TEMPLATES` (align with Crazy Frog); Trending nav keeps product links |
| New API routes    | None — use `/api/hotel-lobby/*` only                                                                   |

## Architecture

|                     | Rumpelstiltskin                                                                                                          | Bulin 47                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Route               | `/ai-rumpelstiltskin`                                                                                                    | `/bulin-47-ai`                                         |
| `presetId`          | `rumpelstiltskin`                                                                                                        | `bulin-47`                                             |
| Panel               | `<HotelLobbyGeneratorPanel presetId="rumpelstiltskin" />`                                                                | `<HotelLobbyGeneratorPanel presetId="bulin-47" />`     |
| Photos              | exactly **1**                                                                                                            | exactly **1**                                          |
| Custom video / trim | no                                                                                                                       | no                                                     |
| `keepAudio`         | true                                                                                                                     | true                                                   |
| Aspect (metadata)   | `16:9`                                                                                                                   | `9:16`                                                 |
| Public demo         | `/videos/rumpelstiltskin-tpl.mp4` (+ poster)                                                                             | `/videos/bulin47-tpl.mp4` (+ poster) — after re-encode |
| R2 generation key   | `hotel-lobby/templates/rumpelstiltskin-v1.mp4`                                                                           | `hotel-lobby/templates/bulin-47-v1.mp4`                |
| Model               | `fal-ai/kling-video/o3/standard/video-to-video/edit`                                                                     | same                                                   |
| Billing             | Kling O3 list rate `$0.126/s` × Genjutsu credit markup (`ceil(usd × 100 × 1.7)`); duration `round(probed)` clamped 3–15s | same                                                   |
| Approx credits      | ~9s → **~193**                                                                                                           | ~15s → **~322**                                        |

`aiTask.scene` stays `hotel-lobby`; distinguish products via `options.presetId` (same as Crazy Frog).

## Why not Genjutsu / new routes

- Genjutsu routes Higgsfield / Seedance — Kling O3 payload (`elements`, no resolution tiers, different prompt tokens) does not fit `submitGenjutsu()`.
- Higgsfield pipeline rule applies only to Higgsfield Genjutsu; Kling presets are intentionally the Hotel Lobby family.
- Product-scoped `/api/rumpel/*` or `/api/bulin/*` would duplicate seal / billing / Fal reconcile already in hotel-lobby.

## Prompts (draft)

Same lesson as Hotel Lobby / Crazy Frog: short imperatives; `@Video1` for motion only; explicit “do not keep the original …”.

### Rumpelstiltskin (`buildRumpelstiltskinPrompt`)

```
Use @Video1 only for motion, timing, gestures, camera, barn set, and tiptoe staging.
Change the dancer in @Video1 who tiptoes and shushes to be the person or character from @Element1 — do not keep the original dancer.
Match @Element1 for face, hair, body, clothing, and species throughout the clip.
Keep the barn, shush gesture, camera path, and tiptoe timing from @Video1.
```

### Bulin 47 (`buildBulin47Prompt`)

```
Use @Video1 only for motion, timing, gestures, camera, crowd, and freestyle staging.
Change the freestyle performer in @Video1 to be the person or character from @Element1 — do not keep the original performer.
Match @Element1 for face, hair, body, clothing, and species throughout the clip.
Keep the freestyle moves, camera path, crowd, and timing from @Video1.
```

Require `imageCount === 1` or throw `HotelLobbyPreflightError`.

## Template assets

### Current ffprobe (pre-migration)

| File                                    | Size        | Duration | Kling edge rule (720–3840)                      |
| --------------------------------------- | ----------- | -------- | ----------------------------------------------- |
| `public/videos/rumpelstiltskin-tpl.mp4` | 1280×720    | 9.31s    | OK                                              |
| `public/videos/bulin47-tpl.mp4`         | **360×640** | 15.10s   | **FAIL** — upscale to ≥720×1280 (e.g. 720×1280) |

### Required before enablement

1. Re-encode Bulin to satisfy Kling pixel bounds; replace `public/videos/bulin47-tpl.mp4` (or add a dedicated Kling file and point `LOCAL_TEMPLATE_BY_PRESET` at it). Refresh poster if needed.
2. Local Node: first template-meta / seal seeds R2 from `LOCAL_TEMPLATE_BY_PRESET`.
3. Workers / prod: upload public MP4s to the R2 keys above (no local seed).

## Implementation checklist

### Module / API (hotel-lobby)

1. `presets.ts` — add `RUMPELSTILTSKIN_PRESET_ID` / `BULIN_47_PRESET_ID`, prompt builders, preset rows (`imageCount: {min:1,max:1}`, `allowCustomVideo/allowTrim: false`, aspect as above).
2. Extend `HotelLobbyPresetId` / `isHotelLobbyPresetId` / tests in `presets.test.ts`.
3. `storage.ts` — `LOCAL_TEMPLATE_BY_PRESET` entries for both.
4. `HotelLobbyGeneratorPanel.tsx` — extend `HotelLobbyPanelPresetId` + public template fallback paths + download filename prefix (mirror crazy-frog branches).

### Pages

5. `ai-rumpelstiltskin.tsx` / `bulin-47-ai.tsx` — swap panel to `HotelLobbyGeneratorPanel` with `presetId`.
6. Delete `RumpelstiltskinGeneratorPanel.tsx` / `Bulin47GeneratorPanel.tsx`.
7. Slim or remove `src/modules/rumpelstiltskin/*` and `src/modules/bulin-47/*` once nothing imports them (keep public video paths only if still referenced for SEO/demo).

### Homepage / nav / i18n

8. Remove `bulin-47` and `rumpelstiltskin` from `MOTION_TEMPLATES` (avoid Recreate into Genjutsu with wrong provider). Keep Trending / header links to product pages.
9. Update `messages/{en,zh,ja,ko}.json`: `site.rumpel.provider_label`, `site.bulin.provider_label`, FAQs / badges that still say Higgsfield Genjutsu Objects Swap → Kling O3.
10. `llms.txt` / `llms-full.txt` blurbs if they claim Higgsfield for these pages.

### Verify

11. template-meta: `enabled`, `templateAvailable`, duration, one image slot.
12. Generate smoke: 1 photo each; Fal payload has `keep_audio: true`, `@Element1`, sealed video = preset template key.
13. Creations / admin display names: **Rumpelstiltskin** / **Bulin 47**.
14. Bulin billed seconds ≤ 15 after probe.

## Out of scope

- Migrating Zombie Hug, Smalltown Boy Dance, or homepage Genjutsu default.
- Kling O3 Pro.
- Keeping a Genjutsu fallback flag for these two pages.

## Reference

- Crazy Frog playbook: [`crazy-frog-enablement.md`](./crazy-frog-enablement.md)
- Preset registry: `src/modules/hotel-lobby/presets.ts`
- Kling identity notes: `docs/model-test-results.md` (one frontal ref per Element)
