# Receipt to Room — repair handoff

## Repair completed

- Replaced the landing-page browser request to GitHub's non-CORS release download redirect with `https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest`. Successful API metadata is stored in `receipt-to-room:release-metadata:v1` for one hour.
- The landing page now selects the matching GitHub Release asset from API asset names. Download links still navigate to GitHub release assets; the browser never fetches `releases/latest/download/latest.json`.
- A missing release, rate limit, malformed API response, or offline request now renders **“Downloads are being published. Check the release page again soon.”** with the direct release-page link. Fetch and JSON failures are handled without a page exception.
- Added an isolated `?demo=1` sample workspace. It uses only `demo:receipt-to-room:sample:v1`, has Reset demo and Start for real controls, and never reads the real app inventory key.
- Reworked the landing copy and information order, added per-route metadata, social preview and icons derived from the repository's original generated hero artwork, a styled 404 page, security headers, sitemap, and static-web app routing configuration.
- Kept the Tauri 2 application, GitHub Actions release matrix, GitHub Releases assets, checksum manifest, and static deployment class unchanged.

## Verification

The exact clean build sequence was run successfully:

```sh
npm ci && npm test && npm run build && npm run test:e2e
```

- `npm test`: 5 unit tests passed.
- `npm run build`: produced `dist/app` and `dist/site`. Landing JS is 2.13 KB gzip and CSS is 2.96 KB gzip; the 768px AVIF hero is 27 KB.
- `npm run test:e2e`: 6/6 Chromium tests passed. This covers mobile layout, keyboard reset, landing/demo/app Axe serious-or-critical findings (none), local OCR with no external runtime requests, CSV export, API metadata cache, and the no-release calm state.
- Every entry in `.factory/claims.json` was run with its tagged Playwright command: release API, isolated demo, local OCR, and CSV export all passed.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/` passed: HTTP 200, title, `lang`, one `h1`, `main`, image alt text, and zero page/console errors. Evidence is in ignored `.factory/evidence/repair-local/`.
- `cargo fmt --check`, `cargo metadata --no-deps`, and `npm audit --omit=dev` passed (zero production dependency vulnerabilities).
- `cargo check --manifest-path src-tauri/Cargo.toml` was attempted. It cannot complete in this container because `glib-2.0.pc` is absent. The unchanged Ubuntu GitHub Actions release job installs `libwebkit2gtk-4.1-dev` and the needed Linux build dependencies.
- The standalone `@axe-core/cli` could not launch a system Chrome in this image. Playwright's bundled Chromium and the repository's Axe integration were used instead. Lighthouse also could not keep Chromium alive in this container; no Lighthouse score is claimed for this repair.

## Deploy and release

Build the static deploy root with:

```sh
npm run build:site
```

Deployed `dist/site` with `/opt/fleet/lib/deploy-static.sh receipt-to-room dist/site` after pushing commits `59da58a` and `9c60c20`. Azure deployment `64db7a4b-4b81-4b63-b6b3-278bbde67780` succeeded and `https://receipt-to-room.sociobot.in/` returned HTTP 200. A live `verify-url.sh` check recorded zero browser errors and the expected title, language, one `h1`, main landmark, and image alt text. The existing GitHub release workflow remains the mechanism for native DMG, MSI/EXE, AppImage/DEB/RPM assets, `SHA256SUMS`, and `latest.json`.

## Known limitations / operator action

- Native desktop bundles remain unsigned. The existing Apple and Windows certificate secret requirements are unchanged.
- OCR v1 bundles English trained data. Users can edit every line or use the typed receipt fallback.
- There is no auto-updater, so no updater manifest is shipped.
