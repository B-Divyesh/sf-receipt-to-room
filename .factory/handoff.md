# Receipt to Room polish 3 handoff

## Outcome

**PASS.** Every finding in reviews 1–3 is resolved. The released candidate is
`bb83b4096ab30d46eb04d82fdb67dea89c571ea0`, tagged `v0.1.12`, and the live
site is <https://receipt-to-room.sociobot.in/>.

## What changed

- Rewrote the first screen, pricing, privacy, Terms, README, 404, and desktop
  labels in short, consistent language.
- Added the missing `release-candidate` claim and its real mismatch/match test.
  All 25 entries in `.factory/claims.json` have one tagged test.
- Kept `?demo=1` isolated under a `demo:` key. It opens the finished sample in
  one click, shows the persistent banner, resets, and discards demo state on
  exit without reading or changing real records.
- Completed route-specific titles, descriptions, canonicals, social metadata,
  shared navigation, focused route headings, legal links, and a true 404.
- Corrected mobile demo spacing and touch behavior. Recaptured all four desktop
  walkthrough frames from the current app after the final wording pass.
- Removed stale jargon and metaphor from the desktop app while preserving its
  paper-ledger visual identity.
- Updated `.factory/catalog-description.txt` to a 66-character verb-first line.

The complete finding-to-change-to-evidence matrix is in
`.factory/polish-3.md`.

## Verification

Clean clone: `/tmp/receipt-to-room-polish3-final.wGIaGf/clone`, checked out at
the candidate SHA above.

- Every command in `.factory/claims.json`: **25/25 passed individually**.
  Per-claim logs are under that clone's sibling `claim-logs/` directory.
- `npm test`: **18/18 passed**.
- `npm run build`: passed; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: **21/21 passed**. This includes Axe, mobile geometry,
  demo isolation, privacy request logs, offline work, routing/focus, legal
  links, storage, exports, license behavior, and error recovery.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed from the clean
  clone.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed from the clean
  clone.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: passed with one
  main, one h1, `lang=en`, no missing alt, no overflow, and no console errors.
- `npm run verify:live-release -- bb83b40…`: passed. Release and deployment
  provenance matched; checkout redirected to a live Dodo page; 30 paid-version
  checks succeeded; request 31 returned 429 with `Retry-After: 4`; immutable
  caching and the true 404 passed.
- Cold live checks: Home 200, Demo 200, Privacy 200, Terms 200, designed 404
  returned 404; all titles, canonicals, social metadata, shared navigation,
  version, and candidate commit stamp matched.
- Cold 390 px Axe scans: zero serious or critical violations on Home, Demo,
  Privacy, Terms, and 404. No route overflowed.
- Live demo: zero cross-origin requests before exit; real-data sentinels stayed
  unchanged; the focused sample heading began at 267.73 px below the banner's
  104.19 px bottom; Reset restored the sample; exit discarded demo state.
- Link crawl: 24 links checked; internal pages returned 200, GitHub returned
  200, checkout returned its expected 303, and current downloads returned 302
  to their release files. The designed 404's self-skip link stayed 404.
- Lighthouse mobile: **Performance 100, Accessibility 100, Best Practices 100,
  SEO 100**; FCP 0.9 s, LCP 1.1 s, TBT 30 ms, CLS 0.
- Static first load: 5.70 kB main JS (2.28 kB gzip), 1.87 kB version JS
  (0.92 kB gzip), 0.23 kB route JS, and 10.98 kB CSS (3.09 kB gzip).

## Release and deployment

- GitHub Actions run:
  <https://github.com/B-Divyesh/sf-receipt-to-room/actions/runs/33254132199>
- Release: <https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.12>
- All six workflow jobs passed: source, macOS arm64, macOS x64, Windows, Linux,
  and manifest.
- The release contains DMG, MSI, EXE, AppImage, DEB, RPM, `SHA256SUMS`, and
  `latest.json`. Both manifest and release target the candidate SHA.
- Downloaded AppImage: 91,392,504 bytes; SHA-256
  `d7804e8a2d0bf004404cded737803f518ed33821ce314fed0590215a2503bb95`,
  matching both `latest.json` and `SHA256SUMS`.
- Azure Static Web Apps deployment:
  `32bf68df-4a01-4319-bae7-2a6d32254ce4`.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- bb83b4096ab30d46eb04d82fdb67dea89c571ea0 https://receipt-to-room.sociobot.in
```

Also run each `test` field in `.factory/claims.json` separately from a fresh
clone.

## Known gaps and operator action

No review finding remains open. Native packages are intentionally unsigned and
say so on the site. To sign future builds, configure `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX` in the release workflow environment.
