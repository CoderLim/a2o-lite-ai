# Crazy Frog — enablement checklist

Route: `/crazy-frog-ai`  
Preset: `crazy-frog` in [`src/modules/hotel-lobby/presets.ts`](../../src/modules/hotel-lobby/presets.ts)  
Default: `enabled: false` until the template is on R2.

## Template asset

| Item                 | Value                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| Source (user)        | `/Users/coderlim/Downloads/genjutsu-ai/crazy-frog-tpl.mp4`                       |
| Kling-safe re-encode | [`docs/assets/crazy-frog-tpl-960x720.mp4`](../assets/crazy-frog-tpl-960x720.mp4) |
| Why re-encode        | Original was 956×718 (height &lt; 720). Kling O3 requires each edge 720–3840.    |
| Duration             | ~11.4s (bills as 11s → about **236 credits**)                                    |
| Aspect (metadata)    | `4:3`                                                                            |
| R2 key               | `hotel-lobby/templates/crazy-frog-v1.mp4`                                        |

## Upload + smoke

1. Upload `docs/assets/crazy-frog-tpl-960x720.mp4` to R2 at the key above.
2. Staging: set `enabled: true`, open `/crazy-frog-ai`.
3. Confirm template-meta: `templateAvailable`, duration ~11.4, two image slots.
4. Generate with two authorized photos (foreground lead + chaser).
5. Confirm Fal payload: `keep_audio: true`, `@Element1` + `@Element2`, sealed video key = crazy-frog template.
6. Confirm Creations / admin show **Crazy Frog**.
7. Production: ship with `enabled: true`. Disable by flipping back to `false`.

## Product rules

- Exactly **2** photos; no custom video / trim.
- Element1 = foreground rider facing camera; Element2 = chaser on red vehicle.
- Independent inspired page — not an official Crazy Frog partnership.
