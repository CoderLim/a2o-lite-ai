# Kairo Bad Times — Kling Motion Control

**Status:** approved (2026-10-15)  
**Route:** `/kairo-bad-times`  
**Approach:** Independent module + thin API (SOLID: product rules in module; Fal/credits infra reused)

## Goals

- User uploads **exactly one** image (person or animal).
- Fixed motion template video drives action.
- Generate via Fal **Kling V3 Standard Motion Control**.
- Keep template audio (`keep_original_sound: true`).
- `character_orientation: "video"` (complex motion; max 30s).

## Non-goals (v1)

- No Genjutsu / SeeAPI path.
- No Hotel Lobby O3 V2V edit reuse for submit payload.
- No custom video / trim / multi-image / element face-binding UI.
- No customer-facing “Kling” naming (AGENTS.md); phrase as product/trend.

## Upstream

| Field                   | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| Model                   | `fal-ai/kling-video/v3/standard/motion-control`            |
| `image_url`             | User upload (sealed HTTPS URL)                             |
| `video_url`             | Fixed R2 template                                          |
| `character_orientation` | `video`                                                    |
| `keep_original_sound`   | `true`                                                     |
| `prompt`                | Fixed short server prompt (FalProvider requires non-empty) |
| Rate                    | `$0.126 / s` × Genjutsu credit multiplier `1.7`            |

## Template asset

|                   |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| Source            | User-provided `bad-times-tpl-v2.mp4` (720×1280, **~28.9s**, has audio) |
| **Constraint**    | Motion Control + `orientation=video` max **30s**                       |
| Generation master | `public/videos/kairo-bad-times-tpl.mp4` (~29s billed)                  |
| Poster            | `public/videos/kairo-bad-times-tpl-poster.jpg`                         |
| R2 key            | `kairo-bad-times/templates/v2.mp4`                                     |
| Preview URL       | `/videos/kairo-bad-times-tpl.mp4`                                      |

Bump the R2 key version whenever the master clip changes.

## Architecture

```
UI panel → /api/kairo-bad-times/* → modules/kairo-bad-times
                                      ├─ constants / pricing / service (Motion Control submit)
                                      ├─ billing (scene: kairo-bad-times; same credit state machine as hotel-lobby)
                                      └─ storage (image upload + template resolve; R2 helpers patterned on hotel-lobby)
```

**SOLID boundary**

- Product policy (orientation, keep audio, 1 image, template key) lives only in `kairo-bad-times`.
- Depends on `FalProvider`, `credits/*`, shared R2 signing patterns — not on `hotel-lobby` internals.
- Do **not** fork Hotel Lobby GeneratorPanel; ship a thin single-image panel.

## API

| Method | Path                                 | Purpose                                    |
| ------ | ------------------------------------ | ------------------------------------------ |
| GET    | `/api/kairo-bad-times/template-meta` | duration, credits estimate, preview/poster |
| POST   | `/api/kairo-bad-times/upload-url`    | 1 image signed upload                      |
| POST   | `/api/kairo-bad-times/generate`      | reserve → submit Motion Control            |
| GET    | `/api/kairo-bad-times/status`        | poll + settle/refund                       |
| GET    | `/api/kairo-bad-times/result/$id`    | durable result                             |

`aiTask.scene = 'kairo-bad-times'`, `provider = 'fal'`.

## UI / SEO

- Page chrome similar to fixed-template trend pages (hero + generator + short how-to).
- Generator: template preview, 1 image slot, credit estimate, Generate.
- i18n en (+ zh keys as needed); no provider brand in user copy.

## Acceptance

1. Upload one photo → generate succeeds against the ~29s v2 template.
2. Output keeps template audio; motion follows template.
3. Credits reserved/settled/refunded correctly.
4. Hotel Lobby / Genjutsu / Crazy Frog unchanged.
5. Admin/creations can filter by scene `kairo-bad-times`.
