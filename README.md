# Receipt to Room

Receipt to Room is a local-first desktop utility for renters and homeowners who
want to turn purchase receipts into a searchable room inventory. It reads JPG,
PNG, and WebP receipts on-device, highlights OCR confidence, keeps every line
editable, and exports reviewed records as CSV or a printable PDF.

It does not scrape retailers, estimate current value, file insurance claims, or
promise that an insurer will accept a record. Keep original receipts where a
retailer, warranty provider, or insurer requires them.

## What ships

- Tauri 2 desktop app for Windows, macOS, and Linux
- Bundled English OCR model; receipt images never leave the device
- Bulk image queue, manual fallback, room/category/warranty review, and search
- Redacted CSV and printable PDF export; deletion includes undo
- Useful free tier (three receipts) and a $29 one-time Sociobot license unlock
- Static, OS-aware download site in `dist/site`

## Develop

Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from
the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev          # desktop UI in a browser
npm run tauri dev    # native desktop shell
```

OCR assets are copied from pinned npm packages into the local Vite public folder
before app builds. No CDN is used at runtime.

## Test and build

```sh
npm test
npm run build        # app -> dist/app, landing site -> dist/site
npm run build:site   # deployment command; index.html -> dist/site/index.html
npm run test:e2e     # Chromium accessibility + end-to-end checks
cargo check --manifest-path src-tauri/Cargo.toml
```

The static deploy root is `dist/site`. GitHub Actions builds native bundles only
after a `v*` tag or manual dispatch. It publishes DMG, MSI/EXE, AppImage, and DEB
assets together with `SHA256SUMS` and `latest.json`.

## Install

The landing page detects the visitor's operating system and selects the matching
asset from the latest release manifest. Builds are unsigned.

```sh
curl -fsSL https://receipt-to-room.sociobot.in/install.sh | sh
```

```powershell
irm https://receipt-to-room.sociobot.in/install.ps1 | iex
```

The scripts verify SHA256 before installing or opening an installer. macOS users
may need to right-click the app and choose **Open**. Windows may show a
SmartScreen publisher warning.

## Privacy and licensing

Inventory lives in local app storage. The only product API call verifies an
optional license at `api.sociobot.in`, cached for one day. Accessibility and
CSV/PDF exports are never paywalled. See `/privacy/` and `/terms/` on the site.

## Deploy

Deploy the contents of `dist/site` as a static site. Do not deploy `dist/app`.
Native releases are produced by `.github/workflows/release.yml`.

## License

MIT — see [LICENSE](LICENSE).
