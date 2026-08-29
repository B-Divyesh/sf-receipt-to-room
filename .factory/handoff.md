# Receipt to Room polish 1 handoff

## Delivered

- Repaired every F-1-1 through F-1-21 finding in `.factory/review-1.md`.
- Repaired demo URL history and isolated all demo storage, including download metadata.
- Added four original desktop workflow captures and a captioned landing walkthrough.
- Completed claims coverage, metadata, legal/404 navigation, focus handling,
  mobile checks, plain-language copy, and catalog description.
- Released native version `v0.1.6` from product commit
  `1cc3603abadc475899b154b2056cad019450b092`.
- Deployed `dist/site` to Azure Static Web App `sf-receipt-to-room` production.

## Verification

- Fresh clone: `npm ci`, then every command in `.factory/claims.json` ran
  individually and passed. The clone's final Playwright status is passed.
- `npm test`: 14 passed.
- `npm run build`: passed; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: 19 passed.
- `cargo check --locked`, `cargo test --locked`, and `cargo fmt --check`: passed.
- `CI=true npm run tauri build -- --bundles deb`: passed; produced
  `Receipt to Room_0.1.6_amd64.deb` (16,958,814 bytes).
- GitHub Actions release run 33231506112: passed. Release `v0.1.6` targets the
  exact product commit and includes DMG, MSI/EXE, AppImage, DEB/RPM,
  `SHA256SUMS`, and `latest.json`.
- `npm run verify:live-release -- 1cc3603abadc475899b154b2056cad019450b092 https://receipt-to-room.sociobot.in`:
  passed (hosted checkout, 30-request allowance, immutable assets, and real 404).
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: passed.
- Live Playwright Axe: zero serious/critical findings on Home, Demo, Privacy,
  Terms, and 404; Home/Demo/Privacy/Terms had no console errors.
- Live history recheck: Back/Forward restored URL, title, demo banner, and focus.
  Screenshot: `/tmp/receipt-live-demo.png`.

## Known gaps

None. Native packages are intentionally unsigned and this is disclosed before
download; signing needs owner certificates, not a product repair.
