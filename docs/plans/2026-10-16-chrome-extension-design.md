# Genjutsu AI Chrome Extension (MVP)

**Status:** approved (2026-10-16)  
**Location:** `chrome-extension/` (same repo; split later if in-extension generate ships)  
**Approach:** Manifest V3 popup, plain HTML/CSS/JS, no build step

## Goals

- Popup UI: upload images/videos (local preview only), prompt textarea, Generate button
- Generate opens `https://genjutsuai.net` in a new tab (no API, no file transfer)
- Store-ready package: icons, privacy notes, description draft, publish checklist

## Non-goals (v1)

- In-extension generation / credit billing / auth
- Passing prompt or media to the site via URL or postMessage
- Side panel, content scripts, host permissions
- Separate repository

## Architecture

- `manifest.json` MV3 — `action.default_popup` only; empty permissions
- `popup.html` / `popup.css` / `popup.js` — local FileReader previews; Generate → `window.open`
- Media held in memory only; discarded when popup closes
- Icons from `public/logo.png` (16 / 48 / 128)
- `store/` — Chrome Web Store materials; not required inside the zip

## Privacy posture

- No data collection, no remote uploads from the extension
- Privacy policy URL: `https://genjutsuai.net/privacy-policy`
