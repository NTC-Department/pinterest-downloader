<img src="https://i.pinimg.com/736x/f7/c3/ab/f7c3ab7931ba3dbac1b9825db2d64441.jpg" alt="Logo" width="150">

# Pinterest Downloader Extension

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=fff&labelColor=black&colorB=blue)](https://neoteric.eu.org/)
[![WXT](https://img.shields.io/badge/WXT-0.19.13-blue?labelColor=black)](https://wxt.dev)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=fff&labelColor=black&colorB=blue)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=fff&labelColor=black&colorB=blue)](https://tailwindcss.com)
[![Powered by](https://img.shields.io/badge/Powered_by-Pinterest_Scraper_API-blue?labelColor=black)](https://github.com/ifeiera/pinterest-scraper)

Ever been frustrated by Pinterest download quality and wished there was an extension that could just fix it? As a designer, I'm all about the details. So when I got tired of saving pixelated images that looked like modern art gone wrong, I decided to create this extension. It's like a little sidekick that ensures your inspiration stays sharp and crystal clear(maybe).

Nobody wants to right-click every damn pin to save mediocre quality images. Pinterest's own download feature might as well be called "How to Ruin Images". This extension fixes that issue by:

1. Adding a clean ass download button right on every pin
2. Giving you ACTUAL high-quality versions (powered by [Pinterest Image Scraper API](https://github.com/ifeiera/pinterest-scraper))
3. Being faster than explaining to your grandma why "right-click save" doesn't work

## Features

- One-click downloads from any pin page
- Instant quality selection via intuitive popup
- Fetches the best available image (subject to original quality)
- Now works on Chrome **AND** Firefox

> **Current Limitations**:
>
> - **Doesn't work on private pins**.
> - Only supports image pins - no sliders/GIFs/videos yet (next update).
> - The quality of downloaded images depends on the original upload. If the original image is low quality, the downloaded image will reflect that.
> - While built for Chrome/Firefox, might work on other Chromium and Firefox based browsers .

## Installation

### For Normal Humans

**Chrome Web Store** - Coming soon (once Google stops being difficult and I pay their $5 fee)  
**Firefox Add-ons** - Pending approval

**Manual Install**:

1. Download the latest `.zip` from [Releases](https://github.com/NTC-Department/pinterest-downloader/releases)
2. Unzip(if firefox just load)

**Chrome:**

- Visit `chrome://extensions`
- Toggle on "Developer mode" (top-right)
- Click "Load unpacked" and select the unzipped folder

**Firefox:**

- Visit `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select **ANY FILE** from the unzipped folder or just load the .zip file

**Test Drive:**
Try these crispy pins after installing:

- [Business Card Mockups](https://id.pinterest.com/pin/791859547022537413/)
- [Self & Others — Jot Press](https://id.pinterest.com/pin/1074178948624472086/)
- If the modal card and thumbnail do not appear, you may need to refresh it, but this is rare.

### For Developers

Prerequisites:

- [Node.js](https://nodejs.org) v18+

```bash
# Clone the repo
git clone [extension-repository-url]

# Install dependencies
npm install

# Start dev server (hot reload enabled)
npm run dev

# Build production package
npm run build
```

## Cross-Browser Compatibility

While we officially support Chrome and Firefox, the extension might work on:

- Brave
- Edge
- Opera
- Any browser that's not Internet Explorer (RIP)

**Note:** These haven't been thoroughly tested. If it breaks, you get to keep both pieces. Feel free to open issues if you find something!

## How It Works

1. **Detects Pinterest URLs** - Automatically activates on Pinterest Image page
2. **Adds Card Modal** - Integrates a sleek card modal to each pin page for easy access
3. **Quality Selection Popup** - Click to choose from available resolutions
4. **Best Available Quality** - Downloads the best version available via [API](https://github.com/ifeiera/pinterest-scraper), but note that this can't improve the original image quality.

## Need the API?

This extension is powered by [Pinterest Image Scraper API](https://github.com/ifeiera/pinterest-scraper). Self-hosters will need to set up both components.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
