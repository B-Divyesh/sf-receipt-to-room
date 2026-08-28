# Receipt to Room

Turn receipts into room records. Receipt to Room is for renters and homeowners
who need purchase details after a move, repair, or insurance question. The
desktop app reads JPG, PNG, and WebP receipts on-device, lets people check each
line, and stores reviewed records by room.

It does not scrape retailers, estimate current value, file insurance claims, or
promise that an insurer will accept a record. Keep original receipts where a
retailer, warranty provider, or insurer requires them.

## What ships

- Tauri 2 desktop app for Windows, macOS, and Linux
- Local English receipt OCR, including a multi-image queue
- Manual fallback with room, category, warranty, and search review
- Redacted CSV and printable inventory output; deletion includes five-second undo
- Useful free tier (three receipts) and a $29 one-time Sociobot license unlock
- Static, OS-aware download site in `dist/site`

## Try the sample

Open `https://receipt-to-room.sociobot.in/?demo=1` or choose **Try it with
sample data** on the landing page. The sandbox shows three reviewed room
records. It uses only the `demo:receipt-to-room:sample:v1` localStorage key and
never reads the desktop app inventory. See [.factory/demo.md](.factory/demo.md)
for the sample and reset details.

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
npm run verify:url -- https://receipt-to-room.sociobot.in
cargo check --manifest-path src-tauri/Cargo.toml
```

The static deploy root is `dist/site`. GitHub Actions builds native bundles only
after a `v*` tag or manual dispatch. It publishes DMG, MSI/EXE, AppImage, and DEB
assets together with `SHA256SUMS` and `latest.json`.

## Install

The landing page reads CORS-enabled metadata from the GitHub Releases API,
caches a successful response for one hour, and selects the matching release
asset for the visitor's operating system. If no release metadata is available,
it links to the release page and says that downloads are being published.
Builds are unsigned.

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

The license service allows 30 verification requests per client in a service
window. Further requests return `429` with `Retry-After`. The app always shows
a wait of at least one second before the next attempt. The live release gate
checks this response policy.

Every visitor-facing capability above maps to an executable entry in
[`.factory/claims.json`](.factory/claims.json).

## Deploy

Deploy the contents of `dist/site` as a static site. Do not deploy `dist/app`.
Native releases are produced by `.github/workflows/release.yml`.

## License

MIT — see [LICENSE](LICENSE).
