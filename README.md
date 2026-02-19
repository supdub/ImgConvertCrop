# ImgConvertCrop

<p align="center">
  <b>Free, privacy-first image tools in the browser.</b><br/>
  Convert, crop, compress, and AI-upscale images with no server-side image storage.
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
│   ├── index.html        # Main UI + client logic
│   ├── ads.txt           # AdSense ads.txt
│   ├── robots.txt
│   ├── sitemap.xml
│   └── llms.txt
├── server.js             # Express server + SEO/localized routing
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

If `3444` is busy:

```bash
PORT=3555 npm start
```

## Usage

1. Pick a tool tab: **Convert**, **Crop**, **Compress**, or **Upscale**
2. Upload an image
3. Configure options
4. Download result

## API

- `GET /health` → `{"ok":true}`

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

Intent pages:

- Convert: `/convert/png-to-jpg`, `/convert/jpg-to-webp`, `/convert/jpg-to-avif`
- Crop: `/crop/resize-image`, `/crop/crop-to-square`, `/crop/crop-to-16-9`
- Compress: `/compress/jpeg`, `/compress/webp`, `/compress/avif`
- Upscale: `/upscale`

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
