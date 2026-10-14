# Crazy Frog — enablement checklist

Route: `/crazy-frog-ai`  
Product: `crazy-frog` on homepage Genjutsu chain (`/api/genjutsu/*`)  
Provider: Higgsfield Seedance 2.5 **video-edit** (`seedance-higgsfield`)

Hotel Lobby Kling preset `crazy-frog` is **disabled** (legacy rows only). Do not re-enable for new submits.

## Template / demo asset

| Item                      | Value                                                             |
| ------------------------- | ----------------------------------------------------------------- |
| Public demo + VideoObject | `/videos/crazy-frog-tpl.mp4`, `/videos/crazy-frog-tpl-poster.jpg` |
| Duration                  | ~11.4s                                                            |
| Aspect (billing estimate) | `4:3` (960×720 template; video-edit derives framing from source)  |
| R2 key (generation)       | `genjutsu/templates/crazy-frog-v1.mp4`                            |
| Env override              | `CRAZY_FROG_TEMPLATE_VIDEO_KEY`                                   |

Page demo and SEO `VideoObject` use the public files above — no env vars.

## Upload + smoke

1. Local: open `/crazy-frog-ai` — first upload-url seeds R2 from public if missing.
2. Workers/prod: upload via wrangler to the **storage upload-path prefix** (admin default `uploads/`):
   `wrangler r2 object put genjutsu-ai/uploads/genjutsu/templates/crazy-frog-v1.mp4 --file=public/videos/crazy-frog-tpl.mp4 --content-type=video/mp4 --remote`
   App logical key stays `genjutsu/templates/crazy-frog-v1.mp4` (S3 client prepends `r2_upload_path`).
3. Confirm client flow: `attempt` → `upload-url` → upload 2 photos → `seal-inputs` → `generate` → poll `status`.
4. Confirm attempt row: `provider=seedance-higgsfield`, `model=bytedance/seedance-2.5/video-edit`, `product=crazy-frog`.
5. Confirm Creations / admin show Genjutsu scene with Crazy Frog product options.
6. Hotel Lobby `/api/hotel-lobby/*` with preset `crazy-frog` must reject as unavailable.

## Product rules

- Exactly **2** photos; full run uses fixed server template (no custom video / trim).
- **Preview** (homepage semantics): client trims template to first 4s @ 480p, uploads clip + 2 photos (`preview: true` on `/api/genjutsu/upload-url`).
- Image1 = foreground rider facing camera; Image2 = chaser on red vehicle.
- Resolutions: 480p / 720p only (1080p hidden for credit pack size). Default: **480p**.
- Independent inspired page — not an official Crazy Frog partnership.
