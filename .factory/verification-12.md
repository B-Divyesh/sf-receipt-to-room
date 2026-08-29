# Independent verification 12 — PASS

**Candidate:** `7683c0dc9f3b3fc17c42cfbf7067097c35af1f3b`

**Live URL:** <https://receipt-to-room.sociobot.in/>

**Verified:** 2026-08-29 UTC from the clean candidate checkout

**Product code changed:** no

## Release decision

**PASS.** The researched receipt-to-room job works end to end, every declared
claim passes, and the live website plus native release are bound to the exact
nominated commit. The deployment-only provenance failure reported in
verification 11 is fixed. No open product defect was found.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

The first Rust attempt stopped before compiling product code because the clean
container lacked `glib-2.0`. After installing the exact Ubuntu dependencies
declared in `.github/workflows/release.yml`, all Rust gates passed. Directly
mounting the AppImage was likewise unavailable because this container has no
FUSE device; extraction and execution of the packaged app under Xvfb passed.
Neither is a product defect.

## Mandatory first-read and demo gate

**PASS** at 1440×900 and 390×844 in fresh browser contexts.

- What it does: **“Turn receipts into room records.”**
- For whom: **“For renters and homeowners who need purchase details after a
  move, repair, or insurance question.”**
- What to click: **“Try it with sample data,”** beside **“See three demo
  records right away.”**
- Three first-screen facts cover demo separation, local receipt reading, and
  the one-time $29 price.

One click opened `/?demo=1#sample`, changed the title to
`Demo — Receipt to Room`, focused **Your room inventory**, and showed the
shipped Cedar kettle, Reading lamp, and Linen storage box records. The banner
remained visible with **Reset demo** and **Leave demo and use my records**.
Direct demo loading requested only the product origin and set no cookie.

Evidence:

- `verification-12-artifacts/first-read-desktop.png`
- `verification-12-artifacts/first-read-mobile390.png`
- `verification-12-artifacts/app-demo-mobile.png`
- `verification-12-artifacts/focus-skip-mobile.png`

## Mandatory claims gate

`.factory/claims.json` exists with 25 unique entries. After `npm ci`, every
listed command was invoked separately, using its exact claim ID and the demo
entry point. All passed:

| Claim | Result |
| --- | --- |
| `sample-demo` | PASS, 1/1 |
| `local-ocr` | PASS, 1/1 |
| `csv-export` | PASS, 1/1 |
| `price` | PASS, 1/1 |
| `release-api` | PASS, 1/1 |
| `receipt-workflow` | PASS, 1/1 |
| `editable-records` | PASS, 1/1 |
| `bulk-queue` | PASS, 1/1 |
| `image-input` | PASS, 1/1 |
| `print-undo` | PASS, 1/1 |
| `local-storage` | PASS, 1/1 |
| `backup-restore` | PASS, 1/1 |
| `redacted-exports` | PASS, 1/1 |
| `privacy-boundaries` | PASS, 1/1 |
| `license-cache` | PASS, 1/1 |
| `license-rate-policy` | PASS, 1/1 |
| `offline-work` | PASS, 1/1 |
| `checkout-operator` | PASS, 1/1 |
| `free-exports` | PASS, 1/1 |
| `scope-boundaries` | PASS, 1/1 |
| `release-trigger` | PASS, 1/1 |
| `release-artifacts` | PASS, 1/1 |
| `release-candidate` | PASS, 1/1 |
| `installer-integrity` | PASS, 1/1 |
| `refund-revocation` | PASS, 1/1 |

The complete release-contract suite independently verifies unique claim IDs,
exactly one matching test tag per claim, and coverage of documented public
capabilities. A manual review of the live copy and README found no unlisted
reliance claim. The checked-in copy audit has no sentence over 22 words and no
banned marketing term.

## Clean local quality gates

- Initial tree: clean `main` at the nominated SHA.
- `npm ci`: PASS; 84 packages installed, zero audit vulnerabilities.
- `npm test`: PASS, 19/19.
- `npm run test:release-contract`: PASS, 12/12.
- `npx tsc --noEmit`: PASS. No npm lint script exists.
- `npm run build`: PASS; exact production output created `dist/app` and
  `dist/site`.
- `npm run test:e2e`: PASS, 22/22 with pinned Playwright 1.58.2.
- Every `.factory/claims.json` command: PASS, 25/25 separately.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the crate
  defines zero Rust unit/doc tests.
- `cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings`:
  PASS.

Production sizes remain inside the supplied budgets:

- Site JavaScript: 7.81 kB raw, 3.42 kB gzip total.
- Site CSS: 11.00 kB raw, 3.09 kB gzip.
- App initial JavaScript: 52.61 kB raw, 20.05 kB gzip total.
- App CSS: 14.87 kB raw, 4.13 kB gzip.
- Mobile hero AVIF: 27,041 bytes.
- OCR data/core files are bundled and loaded only when receipt-image reading
  is requested; they are absent from the first-load request set.

## Independent end-to-end exercise

A separate 390×844 reduced-motion run started from fresh demo storage while a
real-storage sentinel was present. It used keyboard activation for intake and
entered a representative receipt with prices `249.99`, `0.00`, and `1,234.56`
plus US date `08/29/2026`.

- Blank input produced the named alert **“Paste at least one item and price,
  then try again.”**, set `aria-invalid=true`, and returned focus to the field.
- Quantity `1000` was rejected with **“Value must be less than or equal to
  999.”**; quantity `999` then saved.
- Three lines received separate rooms and categories, and one received a
  warranty date. The resulting six-record inventory included the three shipped
  demo records plus the three new lines.
- Search found Warranty washer; editing moved it to Kitchen; the 733-byte CSV
  retained the edited record; removal followed by Undo restored it.
- Only the two documented `demo:` app keys were added. The real-storage
  sentinel remained byte-for-byte unchanged.
- Requests stayed on `127.0.0.1:1420`; there were no cookies, console errors,
  page errors, horizontal overflow, undersized visible controls, or axe
  serious/critical findings.
- Keyboard focus used the designed 3 px blue outline.

The mandatory and full suites additionally exercised local OCR of the shipped
image, a two-image receipt queue, unsupported and over-10-MB image recovery,
per-line review, printable output, five-second undo, payment-detail redaction,
malformed backup recovery without data loss, offline typed intake/edit/export,
license caching, refunded-license locking, and free exports at the receipt
limit.

## Live deployment identity and behavior

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS.
- `npm run verify:release-candidate -- v0.1.13 7683c0d…`: PASS.
- `npm run verify:live-release -- 7683c0d… <URL>`: PASS.
- Tag `v0.1.13`, GitHub release `target_commitish`, deployed `build-commit`,
  and `latest.json.sourceCommit` all equal the full nominated SHA. The required
  verification-report commit will advance `main` afterward without changing
  the tested product or release.
- All 27 served files in the fresh local site build, including source maps,
  were SHA-256/byte-identical to the live URL. The deployment-only
  `staticwebapp.config.json` was correctly excluded because it is not a public
  route.
- Unknown routes return a designed HTTP 404. Valid routes produced no console
  or page errors. Chromium logs its expected failed-document message only for
  the deliberate 404 request.
- All actionable links returned 2xx or an intentional 302/303 for a release
  download or hosted checkout. Mail links were inspected but not sent.

## Privacy, headers, accessibility, and performance

Fresh Playwright request logs showed:

- Home: product origin plus the documented GitHub Releases API.
- Direct demo, Privacy, and Terms: product origin only.
- App intake, editing, and export: app origin only.
- No analytics, telemetry, remote font/script, cookie, receipt upload, or raw
  Azure endpoint was observed.

Browser document responses include a restrictive CSP with
`frame-ancestors 'none'`, HSTS, `nosniff`, `X-Frame-Options: DENY`,
`strict-origin-when-cross-origin`, and disabled camera/microphone/geolocation.
HTML uses `public, must-revalidate, max-age=30`; hashed assets use
`public, max-age=31536000, immutable`.

Fresh axe scans on Home, Demo, Privacy, Terms, and 404 at both 1440 px and
390 px found zero serious or critical violations. Every route has `lang=en`, a
route-specific title, one main and one h1, complete image alternatives, no
horizontal overflow, and no undersized visible interactive control. The first
Tab exposes a 172.97×44.80 px skip link with a 3 px blue focus ring. Reduced
motion matched on site and app; the site had no animation and app transition
durations were capped at 0.01 ms.

Fresh mobile Lighthouse evidence is in
`verification-12-artifacts/lighthouse-mobile.json`:

- Performance 91, Accessibility 100, Best Practices 100, SEO 100.
- FCP 1.5 s, LCP 1.6 s, TBT 360 ms, CLS 0, Speed Index 1.8 s.
- Initial script transfer 3,273 bytes; stylesheet transfer 3,220 bytes.

## Native release and paid service

GitHub Actions run `33258627451` is attached to the exact candidate and all six
jobs succeeded: source binding, Linux, Windows, both macOS architectures, and
manifest publication. Release `v0.1.13` contains DMG, MSI, EXE, AppImage, DEB,
RPM, app archives, `SHA256SUMS`, and `latest.json`.

The live release verifier downloaded and SHA-256 checked every manifest-listed
platform artifact against both the manifest and release checksums. Separately,
the public Linux install command installed a 91,396,600-byte AppImage into a
fresh temporary directory after verifying
`d83c84cd25d20777bc8678cb2c56d9cc97ab29a4e909ba3aae4cf21a319da04a`.
Its extracted `AppRun` remained alive for the full eight-second Xvfb smoke
window; only expected headless portal/EGL warnings appeared.

Checkout returned 303 to `checkout.dodopayments.com/session/...`, whose page
returned 200. The observed paid-version allowance was exactly 30 requests for
one client. Request 31 returned 429 with `Retry-After: 4`.

This is a Tauri desktop app, not a PWA, library, CLI, or product backend.
Service-worker update, consumer-package, backend concurrency/health, and
sign-in-provider checks do not apply. No service worker or sign-in flow exists;
the only server endpoint used by the app is the separately rate-limited
Sociobot paid-version service verified above.

## Documentation and known gaps

README covers purpose, audience, demo, development, test/build, install,
privacy, paid behavior, deployment, and license. MIT `LICENSE`, `/privacy/`,
`/terms/`, `.factory/demo.md`, `.factory/design.md`, and the required handoff
are present. The product-specific botanical field-guide design documents its
single light mode, tokens, type, spacing, motion, original generated art, and
provenance.

No release-blocking or non-blocking product defect remains. Native packages are
intentionally unsigned and the website discloses that limitation.
`.factory/brief.json` is absent, so the researched brief supplied in work order
`receipt-to-room-verify-12` was used as the acceptance contract.
