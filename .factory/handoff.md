# Receipt to Room polish 2 handoff

## Delivered

- Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`.
  The finding-by-finding evidence is in `.factory/polish-2.md`.
- Shipped a one-click, isolated `/?demo=1` path with three useful records, the
  exact persistent demo banner, Reset, and a clear exit to real records.
- Corrected first-screen, pricing, walkthrough, README, privacy, terms, and
  refund wording without changing the botanical field-guide visual identity.
- Added complete claim coverage, Dodo checkout/refund fixtures, demo network
  isolation, 390 px banner geometry, route metadata/focus, shared build version,
  and real 404 tests.
- Updated `.factory/catalog-description.txt` to an 80-character verb-first line.
- Released desktop version `v0.1.8` and deployed the static site.

## Release and deployment

- Product commit: `3f448f94d31c3b8ac7f29125dbc1703503cff6d8`.
- Release: <https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.8>.
- Workflow: <https://github.com/B-Divyesh/sf-receipt-to-room/actions/runs/33235079144> — success.
- Assets: macOS arm64/x86_64 DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM,
  app archives, `latest.json`, and `SHA256SUMS`.
- Download proof: a fresh `Receipt.to.Room_0.1.8_amd64.deb` matched the
  published `SHA256SUMS`.
- Production: <https://receipt-to-room.sociobot.in/> via Azure Static Web Apps
  resource `sf-receipt-to-room`.

## Verification

- `npm ci`: 84 packages, zero vulnerabilities.
- `npm test`: 14/14 passed.
- `npm run build`: passed; `dist/app` and `dist/site` produced. Site JS is
  3.19 KB gzip across initial modules and CSS is 3.06 KB gzip.
- `npm run test:e2e`: 21/21 passed, covering keyboard, mobile, accessibility,
  privacy, offline work, routing, demo isolation, payment, and exports.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed.
- Fresh clone `/tmp/receipt-to-room-final-claims.ox7q51`: every one of the 24
  `.factory/claims.json` commands passed individually.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: correct title,
  language, main/h1 count, alt text, width, and zero console/page errors.
- `npm run verify:live-release -- 3f448f94d31c3b8ac7f29125dbc1703503cff6d8 https://receipt-to-room.sociobot.in`:
  release provenance, Dodo checkout, rate limit, immutable cache, and 404 passed.
- Cold 390 px production pass: zero demo cross-origin requests; exact banner;
  Reset/exit; direct/click/Back/Forward focus and banner clearance; v0.1.8
  download; Dodo legal text; designed 404; zero serious/critical Axe findings;
  zero console errors.
- Live link crawl: all internal pages, checkout, source/release pages, and the
  four platform download links returned 200 after redirects.
- Lighthouse mobile production: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 100 ms, CLS 0.
- Screenshots: `.factory/screenshots/polish-2-local-demo-mobile.png` and
  `.factory/screenshots/polish-2-live-demo-mobile.png`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

Run each `.factory/claims.json` `test` command separately for the claims gate.

## Known gaps

None in the reviewed product scope.

## Needs operator action

The published desktop packages are unsigned, as disclosed on the download
page. The current workflow expects no signing secrets. Signed future releases
need Apple and Windows certificates; use secrets named `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
`APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD` when signing is added to the workflow.
