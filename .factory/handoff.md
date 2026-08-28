# Receipt to Room — build handoff

## What was built

- Tauri 2 desktop application with a Vite/TypeScript interface.
- Fully local English receipt OCR using bundled Tesseract worker, WASM core, and
  trained-data files. Browser verification confirmed zero external OCR requests.
- Multi-image intake queue with JPG/PNG/WebP validation, progress, actionable
  failure state, and a paste-text fallback.
- Confidence-labelled, editable line review plus retailer, purchase date,
  currency, room, category, and warranty metadata.
- Persistent local inventory with room/category/retailer search, responsive card
  treatment at 390px, reversible deletion, mixed-currency totals, payment-data
  redaction, CSV download, and printable PDF output.
- Useful free edition for three receipts. The $29 one-time Sociobot unlock adds
  unlimited intake and JSON backup/restore; cached verification never blocks the
  free experience. Checkout and verification use the product slug, not an ID.
- OS-aware static landing page, privacy and terms pages, checksum-verifying shell
  and PowerShell installers, and original botanical field-guide imagery.
- GitHub Actions release matrix for macOS arm64/x86_64, Windows x86_64, and Linux
  x86_64. Tauri uploads native bundles; the final job publishes `SHA256SUMS` and
  `latest.json` for the site and installers.

## Build and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

The factory deploy command is exactly `npm run build:site`; publish `dist/site`
(its root contains `index.html`). Use `npm run tauri dev` for a native development
window. Tagging `v*` or manually dispatching `.github/workflows/release.yml`
creates desktop releases on GitHub-hosted platform runners.

## Verification completed

- `npm test`: 5/5 unit tests pass (parser, dates, confidence, redaction, CSV).
- `npm run build`: passes; outputs `dist/app` and `dist/site`.
- `npx playwright test`: 3/3 pass, including 390px landing accessibility,
  receipt-to-inventory-to-CSV flow, and real bundled OCR with no external calls.
- Axe: zero serious or critical findings on landing and populated app views.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title/lang/main/alt checks pass, zero
  console errors.
- Lighthouse mobile, production build: Performance 100, Accessibility 100,
  Best Practices 96, SEO 100; LCP 1.2s, CLS 0, total blocking time 0ms.
- Landing payload: 2.2 KB JS, 7.9 KB CSS; mobile hero AVIF 29 KB (all well below
  factory budgets). Full hero AVIF is 129 KB.
- `npm audit --omit=dev`: zero vulnerabilities. Full audit also reports zero
  after updating build tooling.
- `cargo fmt --check` and `cargo metadata --no-deps`: pass. A full local
  `cargo check` could not link because this disposable image lacks GLib/WebKit;
  the Ubuntu release job installs the documented Tauri system packages.

Evidence from the local Lighthouse and URL checks is kept under the ignored
`.factory/evidence/` directory.

## Known gaps / operator action

- Register the production `receipt-to-room` product and $29 price in Sociobot so
  the existing slug-based checkout link begins issuing licenses.
- Native bundles are intentionally unsigned. To add signing, provision Apple
  secrets `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, and `APPLE_TEAM_ID`;
  for Windows provision `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD`, then wire
  certificate import/signing steps into the release workflow. Until then, retain
  the landing-page warning and macOS right-click → Open guidance.
- OCR v1 ships with English trained data. Users can always correct lines or use
  the paste-text fallback; additional language packs are a future enhancement.
- No updater is shipped, so there is intentionally no updater manifest.

## Release

Release `v0.1.0` completed successfully in GitHub Actions run `33156759579`:
<https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.0>.
The published assets include DMGs for both Mac architectures, MSI and EXE for
Windows, and AppImage, DEB, and RPM for Linux, plus both Mac app archives.
`latest.json` contains all four required platform entries. As an external smoke
test, the published 15.0 MB Windows MSI was downloaded and its SHA256
`8d0a14211a981bd5783e27c20c4f65edc61725d5fe908b28d381099ae7f93a38`
matched both `latest.json` and `SHA256SUMS` exactly.
