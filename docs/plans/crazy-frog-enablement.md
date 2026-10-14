# Crazy Frog — enablement checklist

Route: `/crazy-frog-ai`  
Preset: `crazy-frog` in [`src/modules/hotel-lobby/presets.ts`](../../src/modules/hotel-lobby/presets.ts)  
Default: `enabled: true`. Missing R2 template is seeded from `public/videos/crazy-frog-tpl.mp4` on local Node.

## Template / demo asset

| Item                      | Value                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Public demo + VideoObject | `/videos/crazy-frog-tpl.mp4`, `/videos/crazy-frog-tpl-poster.jpg`                     |
| Full chase backup         | `/videos/crazy-frog-tpl-full.mp4` (+ `-full-poster.jpg`) — same as live clip          |
| Why re-encode             | Source was 956×718 (height &lt; 720). Kling O3 requires each edge 720–3840 → 960×720. |
| Duration                  | ~11.4s (bills as 11s → about **236 credits**)                                         |
| Aspect (metadata)         | `4:3`                                                                                 |
| R2 key (generation)       | `hotel-lobby/templates/crazy-frog-v1.mp4`                                             |

Page demo and SEO `VideoObject` use the public files above — no env vars.

## Upload + smoke

1. Local: open `/crazy-frog-ai` — first template-meta/seal seeds R2 from public if missing.
2. Workers/prod: upload `public/videos/crazy-frog-tpl.mp4` to `hotel-lobby/templates/crazy-frog-v1.mp4` (no local seed).
3. Confirm template-meta: `enabled`, `templateAvailable`, duration matches current public clip, two image slots.
4. Generate with two authorized photos (foreground lead + chaser).
5. Confirm Fal payload: `keep_audio: true`, `@Element1` + `@Element2`, sealed video key = crazy-frog template.
6. Confirm Creations / admin show **Crazy Frog**.
7. Production: ship with `enabled: true`. Disable by flipping back to `false`.

## Product rules

- Exactly **2** photos; no custom video / trim.
- Element1 = foreground rider facing camera; Element2 = chaser on red vehicle.
- Independent inspired page — not an official Crazy Frog partnership.
