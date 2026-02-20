# ImgConvertCrop (V1 + V2)

<p align="center">
  <b>Free, privacy-first image tools in the browser.</b><br/>
  Convert, crop, compress, upscale, and remove objects with no server-side image storage.
</p>

<p align="center">
  <a href="https://imgconvertcrop.com">Live Demo</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#localization--seo-routing">Localization & SEO Routing</a>
</p>

---

## Features

- **V1 (existing multi-page experience)**:
  - Convert, Crop, Compress, Upscale, AI Remove
  - SEO/localized routes remain unchanged
  - Rich per-tool UI blocks and parameter freedom
- **V2 (new editor shell)**:
  - Route: `/editor` (also `/:locale/editor`)
  - Single-page editing flow: upload once, switch tools without reload
  - Tools in V2: Crop + AI Remove
  - Top bar: Back (reset session) + Save
  - Bottom tabs: Crop / Remove
  - Save overlay exports: PNG, JPG (quality 60-100, default 92), WebP (quality 60-100, default 90)
- **Image Convert**: `jpeg`, `png`, `webp`, `avif`
- **Image Crop**:
  - Drag-and-resize crop box
  - Aspect ratio presets (`Free`, `1:1`, `4:3`, `3:4`, `16:9`, `9:16`, `3:2`, `2:3`)
  - Optional resize after crop
  - Improved touch ergonomics for mobile and small touch screens
- **Image Compress**: Reduce file size while keeping pixel dimensions
- **Image Upscale (AI Enhance, browser-only)**:
  - ESRGAN-based client-side enhancement
  - `2x` / `4x` upscale
  - Restore modes: `Balanced`, `Aggressive`, `Text/Logo`
  - First run may download model/runtime assets (~31 MB) and then cache in browser
- **AI Object Remove**:
  - Brush-based painting workflow with zoom and multi-step undo
  - Shared frontend API contract for backend integration: `POST /api/remove` (`image`, `mask`, `params`)
  - If backend is unavailable, V2 uses a mock removal pipeline fallback
  - Download is enabled after removal finishes
- **Privacy-first**: Processing happens in-browser, images are not uploaded for processing
- **Multilingual UI + SEO pages**: `en`, `es`, `zh`, `hi`, `ar`, `ja`, `ko`
- **Open source friendly**: Includes clear route structure and simple deployment model

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Plain HTML/CSS/JS + Canvas APIs
- **Runtime**: No framework lock-in, lightweight and fast startup

## Project Structure

```text
.
├── public/
│   ├── index.html        # V1 shell + existing tool pages/UI
│   ├── editor.html       # V2 single-page editor shell
│   ├── js/
│   │   ├── v2-editor.js  # V2 shell state + interactions
│   │   ├── core/
│   │   │   ├── image-core.js       # Shared image IO/crop/export/size estimate
│   │   │   ├── transform-core.js   # Shared transform/viewport math helpers
│   │   │   ├── canvas-renderer.js  # Shared editor canvas compositing
│   │   │   └── remove-api.js       # Shared remove API contract + mock fallback
│   │   └── tools/
│   │       ├── tool-crop.js        # Shared crop tool logic API
│   │       └── tool-remove.js      # Shared remove stroke/mask logic API
│   ├── ads.txt           # AdSense ads.txt
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
├── server.js             # Express server + V1 localized routing + /editor entry
├── package.json
└── Dockerfile
```

## Quick Start

### Requirements

- Node.js `>= 12` (Node `18+` recommended)

### Install & Run

```bash
npm install
npm start
```

Open: `http://localhost:3444`

V2 editor: `http://localhost:3444/editor`

If `3444` is busy:

```bash
PORT=3555 npm start
```

## Usage

1. Pick a tool tab: **Convert**, **Crop**, **Compress**, **Upscale**, or **AI Remove**
2. Upload an image
3. Configure options
4. Download result

For object removal:

1. Open **AI Remove**
2. Upload image and paint over unwanted area
3. Lift pointer/finger to auto-apply removal
4. Download result after processing

## API

- `GET /health` → `{"ok":true}`
- `POST /api/remove` (optional backend integration for remove tool):
  - `multipart/form-data`
  - `image`: image blob/file
  - `mask`: PNG mask blob (`white = remove`, `black = keep`)
  - `params`: JSON string (optional)
  - response: either image blob or JSON containing `url`

Current behavior:

- V2 uses `public/js/core/remove-api.js` for this contract.
- If `/api/remove` is not available or fails, V2 automatically falls back to a frontend mock so the flow remains functional.

## Localization & SEO Routing

Supported locales:

- `en` (English)
- `es` (Spanish)
- `zh` (Chinese)
- `hi` (Hindi)
- `ar` (Arabic, RTL)
- `ja` (Japanese)
- `ko` (Korean)

Routing behavior:

- Localized URL format: `/:locale/...` (example: `/zh/convert`)
- Unprefixed pages (like `/`, `/convert`) auto-redirect by:
  1. `lang` cookie
  2. `Accept-Language` header
- Language switcher in header lets users manually switch locales
- Includes locale-aware canonical + `hreflang` alternate links

## Route Map

Core tools:

- `/convert`
- `/crop`
- `/compress`
- `/upscale`
- `/remove`
- `/editor` (V2)

Intent pages:

- Convert: `/convert/png-to-jpg`, `/convert/jpg-to-webp`, `/convert/jpg-to-avif`
- Crop: `/crop/resize-image`, `/crop/crop-to-square`, `/crop/crop-to-16-9`
- Compress: `/compress/jpeg`, `/compress/webp`, `/compress/avif`
- Upscale: `/upscale`
- Remove: `/remove`

All of the above are also available under locale prefixes, e.g. `/es/convert`, `/ar/crop`.

## Preflight Check

```bash
npm install
PORT=3444 npm start
```

In another terminal:

```bash
curl http://127.0.0.1:3444/health
```

Expected:

```json
{"ok":true}
```

## Deployment Notes

This repo is currently deployed on a Node service and can also be containerized with the included `Dockerfile`.

Production runbook and reusable deployment skill:

- `DEPLOYMENT.md`
- `.cursor/skills/imgconvertcrop-deploy/SKILL.md`

### Docker (optional)

```bash
docker build -t imgconvertcrop .
docker run --rm -p 3444:3444 imgconvertcrop
```

## Ads / ads.txt

The project serves ads.txt at:

- `/ads.txt` (source file: `public/ads.txt`)

## Contributing

Issues and pull requests are welcome.  
If you plan large changes, open an issue first to discuss scope and approach.

## License

No `LICENSE` file is currently included in this repository.  
If you want to make reuse terms explicit, add a license (for example MIT) in a future update.
