# Receipt to Room repair 6 handoff — v0.1.5

- Work order: `receipt-to-room-repair-6`
- Repaired candidate: `924655711c2fd45c1859bc4932b6fbd3755de7cd`
- Verifier report: `.factory/verification-6.md`
- Live URL: <https://receipt-to-room.sociobot.in/>
- Artifact class: Tauri 2 desktop app with static download site

## What changed

Every release-blocking finding in verification 6 is repaired at its root:

1. **A real isolated demo.** The landing action now focuses and scrolls the
   first sample row into the next viewport. The desktop app exposes **Load
   sample project** and `?demo=1`, seeds three editable records, and stores all
   demo work under `demo:receipt-to-room:*`. Reset restores the seed; Start for
   real discards demo storage without reading or changing real records.
2. **Correct mixed-room receipts.** Room, category, and warranty now belong to
   each reviewed line. Saved rows have an Edit action for item, quantity,
   price, currency, room, category, dates, and retailer.
3. **Truthful claim coverage.** `.factory/claims.json` now lists 17 observable
   claims. It adds saved editing, accepted image boundaries, validated backup
   restore, export redaction, privacy boundaries, and license-cache behavior.
   The unprovable “all future v1 updates” promise was removed.
4. **Safe backup restore.** Version and every inventory field are validated
   before storage changes. A malformed `{"version":1,"items":[{}]}` keeps the
   existing inventory, reports recovery guidance, and does not throw. Invalid
   stored records are also removed safely at startup.
5. **Route, focus, and scroll restoration.** Initial hashes and reloads open
   the requested app screen. Hash navigation updates titles, scrolls the new
   heading into view, and moves keyboard/screen-reader focus there.
6. **Receipt parsing.** Numeric dates now handle `08/19/2026` as
   `2026-08-19`; grouped decimals such as `1,299.99` and integer prices such as
   `39` are retained.
7. **Mobile target sizes.** The first-screen wordmark and Demo link now meet
   the 44 by 44 CSS pixel baseline at 390 px.
8. **Recovery around image intake.** Unsupported and over-10-MB files remain
   on the intake screen with clear guidance and the manual fallback available.

The original local OCR, search, CSV, print, undo, free receipt allowance,
paid license, and release-download behaviors remain covered and passing.

## Exact regression coverage

`tests/lib.test.ts` directly covers the US date, grouped price, integer price,
and backup-schema cases. `tests/e2e/product.spec.ts` covers the visible
one-click demo at 390 px, app demo storage isolation/reset/exit, first-run demo
entry, mixed-room line fields, saved-row editing, malformed restore recovery,
deep-link reload, focus/scroll changes, 44 px targets, rejected images,
redacted output, runtime request boundaries, and one-day license caching.

Each of the 17 claim IDs has exactly one `@claim:<id>` browser test. Every
manifest command was also run individually and passed.

## Verification evidence

Run from a clean dependency installation on 2026-08-29 UTC:

- `npm ci`: PASS — 84 packages, 0 audit vulnerabilities.
- `npm test`: PASS — 12/12.
- `npm run test:release-contract`: PASS — 5/5.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS — `dist/app` and `dist/site` produced.
- `npm run test:e2e`: PASS — 18/18 in Chromium 145 / Playwright 1.58.2.
- All 17 `.factory/claims.json` commands: PASS individually.
- Axe on landing, visible demo, app review, and inventory: 0 serious or
  critical findings.
- Desktop 1440×900 and mobile 390×844 visual passes: no clipping or overflow;
  the clicked mobile demo shows its first record immediately.
- Keyboard: visible skip-link focus; screen changes focus their heading; no
  trap in intake, review, edit, inventory, license, or demo controls.
- Offline: demo manual intake and CSV export pass after `context.setOffline`.
- Privacy: app work makes no external request; no image data is retained; the
  website has no analytics scripts or cookies; only the disclosed GitHub API
  is used for release metadata.
- Local `verify-url.sh`: PASS. Live `verify-url.sh`: PASS with one main, one h1,
  language/title/alt checks, no overflow, and zero console/page errors.
- Mobile Lighthouse 13.4.1: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.2 s, TBT 0 ms, CLS 0, Speed Index 0.9 s.
- Production site JS: 5.42 kB raw / 2.25 kB gzip. CSS: 10.33 kB raw /
  2.99 kB gzip. App JS chunks: 52.61 kB raw / 20.17 kB gzip total.
- `cargo fmt --check`, `cargo check --locked`, and `cargo test --locked`:
  PASS. The Rust crate has zero unit/doc tests.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
  - DEB: 16,967,374 bytes; SHA-256
    `ca3f58abfce8662355b8b832bccc8357f2a9170461b7e0b5ccc51e088eea161b`.
  - AppImage: 91,404,792 bytes; SHA-256
    `ce5aacc40c7a38bcc15940fe04c8b052e89de7389c78ebf229ba853430f7d90d`.
  - The release binary and AppImage each stayed alive for an eight-second
    Xvfb smoke test; only expected headless EGL warnings appeared.
- Azure Static Web Apps deployment
  `d4b926d0-959e-4593-bf3b-2fb28fc014b9`: succeeded. Live and local
  `index.html` SHA-256 both equal
  `4f59f39de746eda7fa2a11b39183b4c51c0d68df148d1d0bc91fe08ae57cb0d0`.

The v0.1.5 tag is created from this handoff-bearing source commit. The release
workflow builds macOS Intel/Apple silicon, Windows, and Linux artifacts, then
publishes `SHA256SUMS` and a source-bound `latest.json`. After publishing, run:

```sh
npm run verify:live-release -- "$(git rev-list -n 1 v0.1.5)" https://receipt-to-room.sociobot.in
```

That gate verifies source identity, every manifest checksum, all required
platform formats, hosted checkout, the 30-request license policy, immutable
asset caching, and true 404 behavior.

## How to reproduce locally

```sh
npm ci
npm test
npm run test:release-contract
npx tsc --noEmit
npm run build
npm run test:e2e
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
CI=true npm run tauri build -- --bundles deb,appimage
npm run verify:url -- https://receipt-to-room.sociobot.in
```

## Known gaps and operator action

- Native packages are intentionally unsigned. Add owner-managed
  `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets when signing is available.
- No runtime updater is shipped, so there is intentionally no updater
  manifest. Downloads resolve through the CORS-safe GitHub Releases API.
- `.factory/brief.json` was absent from the supplied report commit; the
  repository's existing researched behavior and design thesis were preserved.
