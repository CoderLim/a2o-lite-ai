# Chrome Web Store publish checklist

## 1. Load unpacked (local smoke test)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `chrome-extension/` folder (this directory’s parent)
4. Click the extension icon: upload preview, type a prompt, click **Generate on Genjutsu AI**
5. Confirm a new tab opens `https://genjutsuai.net`

## 2. Build the zip (do not include `store/`)

From the repo root:

```bash
cd chrome-extension
zip -r ../genjutsu-ai-extension.zip . \
  -x 'store/*' \
  -x '*.DS_Store' \
  -x '*/.DS_Store'
```

Upload `genjutsu-ai-extension.zip` in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## 3. Store listing fields

| Field                        | Value                                                                  |
| ---------------------------- | ---------------------------------------------------------------------- |
| Name                         | Genjutsu AI                                                            |
| Short / detailed description | See `description.md`                                                   |
| Icon                         | `icons/icon-128.png` (store may also ask for a 128×128 marketing icon) |
| Privacy policy URL           | `https://genjutsuai.net/privacy-policy`                                |
| Support email                | `support@genjutsuai.net`                                               |
| Homepage                     | `https://genjutsuai.net`                                               |

Extension-only privacy summary (optional host or attach): `privacy.html`

## 4. Screenshots (you capture locally)

Required: at least **1** screenshot, recommended **1280×800** or **640×400**.

Suggested capture:

1. Load unpacked as above
2. Open the popup, add 1–2 sample images, fill a short prompt
3. Screenshot the popup (or a browser window showing the popup)
4. Optional second shot: after clicking Generate, the open genjutsuai.net tab

## 5. Privacy questionnaire

Answer consistently with MVP behavior:

- **Does not** collect user data
- **Does not** sell / transfer data
- Single purpose: companion UI that opens the Genjutsu AI website
- No remote code, no host permissions, no content scripts

## 6. Submit

Pay the one-time Chrome Web Store developer registration fee if you have not already, then submit for review. Review often takes a few business days.
