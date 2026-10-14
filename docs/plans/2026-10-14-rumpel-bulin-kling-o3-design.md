# Rumpelstiltskin + Bulin 47 → Kling O3

**Status:** design revised (2026-10-14) after ChatGPT review — implement on a **feature branch**, not `main`.  
**Pattern:** Extend Hotel Lobby / Crazy Frog Kling O3 presets. No new API / billing / storage / reconcile.

## Goals

- Migrate `/ai-rumpelstiltskin` and `/bulin-47-ai` generation to Fal Kling O3 Standard via `/api/hotel-lobby/*`.
- Reuse `HotelLobbyGeneratorPanel`.
- Keep Hotel Lobby, Crazy Frog, homepage Genjutsu, Zombie Hug, Smalltown Boy Dance behavior unchanged.
- **Acceptance:** adding another Kling O3 trend page = register preset + template assets + topic page — not a new panel/API/billing stack.

## Non-goals (anti–over-design)

- Do **not** rename `hotel-lobby` module or `/api/hotel-lobby/*`.
- Do **not** invent a new provider abstraction or multi-file preset framework.
- Do **not** add `isRumpelstiltskin` / `isBulin47` (or grow `isCrazyFrog`) as the long-term pattern.
- Do **not** change credit formula / payment logic for other products.
- Do **not** build R2 content-hash sync; use **versioned template keys** (`…-v1.mp4`). Local size-mismatch reseed stays a Node DX convenience only.
- Do **not** park product marketing copy inside the registry beyond what the panel needs (preview / poster / download prefix). Page SEO stays in route + `messages/*`.

---

## Architecture (unchanged direction)

|                     | Rumpelstiltskin                                                                                                           | Bulin 47                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Route               | `/ai-rumpelstiltskin`                                                                                                     | `/bulin-47-ai`                              |
| `presetId`          | `rumpelstiltskin`                                                                                                         | `bulin-47`                                  |
| Panel               | `<HotelLobbyGeneratorPanel presetId="…" />`                                                                               | same                                        |
| Photos              | exactly **1**                                                                                                             | exactly **1**                               |
| Custom video / trim | **false**                                                                                                                 | **false**                                   |
| Aspect (metadata)   | `16:9`                                                                                                                    | `9:16`                                      |
| Public preview      | `/videos/rumpelstiltskin-tpl.mp4`                                                                                         | `/videos/bulin47-tpl.mp4` (after re-encode) |
| Poster              | `/videos/rumpelstiltskin-tpl-poster.jpg`                                                                                  | `/videos/bulin47-tpl-poster.jpg`            |
| R2 key              | `hotel-lobby/templates/rumpelstiltskin-v1.mp4`                                                                            | `hotel-lobby/templates/bulin-47-v1.mp4`     |
| Local seed          | `public/videos/rumpelstiltskin-tpl.mp4`                                                                                   | same public path as preview                 |
| Model               | `fal-ai/kling-video/o3/standard/video-to-video/edit`                                                                      | same                                        |
| Billing             | existing Kling `$0.126/s` × Genjutsu credit markup; duration from **probed R2** video, `normalizeHotelLobbyDuration` 3–15 | same                                        |
| Approx credits      | ~9s → ~193                                                                                                                | ≤15s → ≤~322                                |

`aiTask.scene` remains `hotel-lobby`; product identity = `options.presetId` + `displayName`.

---

## P0 — Bulin template must be re-encoded **and** trimmed

Verified in code: `normalizeHotelLobbyDuration` rejects raw duration outside `[3, 15] ± 0.001s` **before** `Math.round`. Current `bulin47-tpl.mp4` is **360×640 · 15.10s** → fails both Kling edge bounds and duration gate. Do **not** loosen shared validation.

**Required asset work (blocking):**

1. Upscale to ≥720 on each edge (e.g. **720×1280**).
2. Trim so **ffprobe duration ≤ 15.0s** (prefer a small margin, e.g. ≤14.9s).
3. Replace `public/videos/bulin47-tpl.mp4` (and poster if framing changes). Public preview **must match** the R2 generation template.
4. Record ffprobe width / height / duration in the PR / enablement checklist.
5. Rumpelstiltskin `1280×720 · 9.31s` already OK — no re-encode required unless we choose to touch it.

---

## P1 — Preset registry as single product surface

File: `src/modules/hotel-lobby/presets.ts` (extend, don’t fork).

Each preset already has id / version / displayName / creditDescription / templateVideoKey / imageCount / allowCustomVideo / allowTrim / keepAudio / aspectRatio / enabled / promptFor.

**Add (minimal UI fields):**

| Field               | Purpose                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `localTemplatePath` | Node seed source (`public/videos/…`) — fold today’s `LOCAL_TEMPLATE_BY_PRESET` into the registry |
| `previewUrl`        | Public MP4 for panel / SEO demos                                                                 |
| `posterUrl`         | Poster path                                                                                      |
| `downloadPrefix`    | Result filename prefix (`rumpelstiltskin`, `bulin-47`, …)                                        |

`isHotelLobbyPresetId` / id union: derive from the registry (`Object.keys` / typed `satisfies`), not a growing `||` chain.

`getHotelLobbyPresetPublicMeta` returns the client-safe subset (including the new fields). Panel and `template-meta` both consume this shape.

**Client / server boundary (keep thin):**

- Full preset (prompt builder, R2 key resolution with env override for hotel-lobby default) stays server-side via existing module.
- Panel must not grow product `if` trees; it reads **public meta** (from `template-meta` when loaded, else static public fields for the known `presetId` prop — same source constants, no second product matrix).
- Server always re-resolves preset from `body.presetId`; never trust client-supplied allow/custom/trim/imageCount.

---

## P1 — Config-driven `HotelLobbyGeneratorPanel`

Today: `isCrazyFrog` drives fixed-template mode, image counts, aspect, preview, poster, download name, meta-failure fallback, and copy branches.

**Change:** drive those from public meta / preset fields (`allowCustomVideo`, `allowTrim`, `imageCount`, `aspectRatio`, `previewUrl`, `posterUrl`, `downloadPrefix`). Delete `isCrazyFrog` as a control flag.

**Fail closed (fixed templates):**

- If `allowCustomVideo === false` and `template-meta` fails or `templateAvailable === false` → keep public preview if possible, **disable Generate**, show a clear error. Do **not** fall back to Hotel Lobby custom-video / trim UX.
- Hotel Lobby (`allowCustomVideo: true`) may keep today’s softer meta-failure behavior.

Product page chrome (hero/FAQ) stays on the route; panel only needs short labels already covered by existing hotel/crazy patterns or meta `displayName` — avoid a large copy registry inside presets.

Extend `HotelLobbyPanelPresetId` via the same registry ids (or accept `string` + server validation only — prefer typed ids from registry).

---

## P1 — Template ensure on seal (no preset-id special cases)

Today `sealHotelLobbyInputs` only calls `ensureHotelLobbyTemplateInR2` when the key equals Crazy Frog’s key.

**Change:**

- When `useDefaultTemplate`, always `ensureHotelLobbyTemplateInR2(presetId)` using the resolved preset’s key / `localTemplatePath`.
- Workers: missing R2 → clear error (upload instruction). Node: seed from `localTemplatePath` when configured.
- Generation must not depend on the user having hit `template-meta` first.
- Content identity: bump R2 key version when the public file changes meaningfully; do not treat equal byte length as proof of same content for production correctness.

---

## P1 — Display names (Creations + Admin + downloads)

- `/api/user/generations` and admin already use `displayNameForHotelLobbyPresetId`.
- `creations.tsx` still hardcodes `mode === 'Crazy Frog'` → Hotel Lobby / Crazy Frog only.
- **Fix:** use `displayName` (or preset-derived name from API) for all hotel-lobby presets; missing `presetId` → **Hotel Lobby** (legacy). No growing ternary of product names in UI.
- Download filenames use `downloadPrefix` from preset.
- Do not rewrite historical Genjutsu rows.

---

## P1 — Duration / credits consistency

- Bill from **probed** sealed / template video duration after seal; keep `normalizeHotelLobbyDuration`.
- Client `durationSeconds` is a hint only.
- **Fixed templates (`useDefaultTemplate`):** if probe fails, **fail** — do not apply `fallbackSeconds` from the client (avoids untrusted duration → wrong charge / Kling reject). Custom Hotel Lobby uploads may keep existing fallback behavior for this migration (full custom-upload hardening = follow-up if needed).
- Frontend estimate should use `template-meta` billed duration when available so UI ≈ server.
- Do not change Kling rate or Genjutsu credit multiplier.

---

## Prompts

Short Kling imperatives; `imageCount === 1` or throw.

### Rumpelstiltskin

```
Use @Video1 only for motion, timing, gestures, camera, barn set, and tiptoe staging.
Change the dancer in @Video1 who tiptoes and shushes to be the person or character from @Element1 — do not keep the original dancer.
Match @Element1 for face, hair, body, clothing, and species throughout the clip.
Keep the barn, shush gesture, camera path, and tiptoe timing from @Video1.
```

### Bulin 47

```
Use @Video1 only for motion, timing, gestures, camera, crowd, and freestyle staging.
Change the freestyle performer in @Video1 to be the person or character from @Element1 — do not keep the original performer.
Match @Element1 for face, hair, body, clothing, and species throughout the clip.
Keep the freestyle moves, camera path, crowd, and timing from @Video1.
```

### `keepAudio`

Server preset field remains source of truth. **Launch check:** confirm both templates’ audio is licensed for redistribution via Fal `keep_audio`. If not verified, set `keepAudio: false` for that preset — do not silently inherit tracks.

---

## Pages / SEO / cleanup

1. Swap both topic pages to `HotelLobbyGeneratorPanel` with `presetId`.
2. Delete `RumpelstiltskinGeneratorPanel` / `Bulin47GeneratorPanel`.
3. Remove or slim `src/modules/rumpelstiltskin/*` and `src/modules/bulin-47/*` once unused (paths live on hotel-lobby presets).
4. Remove both from homepage `MOTION_TEMPLATES` (wrong provider if Recreate stays Genjutsu). Keep Trending / header links to topic URLs.
5. Update `messages/{en,zh,ja,ko}.json`, visible FAQ, and JSON-LD together: drop Higgsfield / Objects Swap / resolution picker / “write your own prompt” / wrong pricing where inaccurate; say Kling O3.
6. Align `llms.txt` / `llms-full.txt` blurbs.

Preserve URLs, canonical, SEO body, demos, internal links where still true.

---

## Tests (focused, not a rewrite)

**Preset unit**

- Resolve all four presets; new two require exactly one image; no custom video/trim.
- Prompts contain `@Video1` / `@Element1`; reject wrong image counts.
- Unknown / disabled presets rejected; missing `presetId` → hotel-lobby legacy.

**API / provider (extend existing hotel-lobby tests where cheap)**

- 0 or 2 images rejected for new presets; custom video when `allowCustomVideo: false` rejected.
- Fal model path + `elements` / prompt / `keep_audio` / sealed template key.
- Fixed-template probe failure does not bill via client fallback.
- Existing Hotel Lobby custom + Crazy Frog two-image paths still pass.

**Manual / checklist**

- Creations + admin names; estimate ≈ charge; ffprobe on both public templates; Node seed + Workers missing-R2 error; Genjutsu / Zombie / Smalltown untouched smoke.

---

## Implementation order

1. Re-encode/trim Bulin asset + ffprobe proof (P0).
2. Extend `presets.ts` + public meta + tests; fold local template paths into registry.
3. Generic `ensure…` on seal; fixed-template duration fail-closed on generate.
4. Refactor panel off `isCrazyFrog`; wire two `presetId`s.
5. Swap topic pages; delete old panels/modules; MOTION_TEMPLATES + i18n/SEO.
6. Fix `creations.tsx` display names.
7. Smoke + regression checklist; open PR from feature branch.

---

## Deploy checklist (Node / Workers / R2)

| Step                                       | Node local      | Workers / prod |
| ------------------------------------------ | --------------- | -------------- |
| Public MP4 + poster in repo                | yes             | yes            |
| R2 keys uploaded                           | optional (seed) | **required**   |
| `template-meta` shows available + duration | yes             | yes            |
| Generate without prior meta warm-up        | yes             | yes            |
| `keepAudio` decision recorded              | yes             | yes            |

---

## Regression risk

| Surface                         | Risk                                                  | Mitigation                                                    |
| ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| Hotel Lobby custom video / trim | Medium if panel refactor regresses `allowCustomVideo` | Keep hotel-lobby preset flags; regression test / manual smoke |
| Crazy Frog                      | Medium — removing `isCrazyFrog`                       | Same fixed-template path via meta; two-image smoke            |
| Homepage Genjutsu               | Low if MOTION_TEMPLATES only removes two cards        | Don’t change GeneratorPanel Genjutsu path                     |
| Zombie / Smalltown              | None if untouched                                     | Don’t edit those modules                                      |

---

## Open / blocking

| Item                                                             | Status                                       |
| ---------------------------------------------------------------- | -------------------------------------------- |
| Bulin re-encode + trim ≤15s                                      | **Blocking** — not done                      |
| Prod R2 upload of both templates                                 | **Blocking** for prod — don’t assume present |
| Audio license for `keepAudio`                                    | **Confirm before enable**                    |
| Custom-upload `fallbackSeconds` hardening beyond fixed templates | Follow-up, not required for this ship        |

---

## Reference

- Crazy Frog: [`crazy-frog-enablement.md`](./crazy-frog-enablement.md)
- Registry: `src/modules/hotel-lobby/presets.ts`
- Kling identity notes: `docs/model-test-results.md`
