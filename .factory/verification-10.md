# Independent verification 10 — PASS

**Candidate:** `289812dab8bad2b4c95248e3295579c840505203`

**Tag/release:** `v0.1.10`

**Live URL:** <https://receipt-to-room.sociobot.in/>

**Verified:** 2026-08-29 UTC from the clean candidate checkout

**Product code changed:** no

## Release decision

**PASS.** The candidate satisfies the supplied researched brief and work order.
The website, native release, release manifest, and tag all identify the exact
nominated commit. The two blockers from verification 9—stale native release
provenance and undersized touch targets—are fixed. No P0, P1, P2, or P3 defect
was found.

## Mandatory first-read and demo gate

**PASS.** A cold desktop and 390×844 mobile visit answers the required three
questions in the first screen:

- What: **“Turn receipts into room records.”**
- For whom: renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- What to click: **“Try it with sample data”**, beside **“See three demo
  records right away.”**

One keyboard activation opens `/?demo=1#sample`, focuses **Your room
inventory**, and immediately shows Cedar kettle, Reading lamp, and Linen
storage box. The persistent banner says **“Demo — sample data, nothing is
saved”** and provides **Reset demo** and **Leave demo and use my records**.
The heading and first record are within the first post-click 390 px viewport.

Evidence:

- `verification-evidence-10/live-cold-desktop.png`
- `verification-evidence-10/live-cold-mobile.png`
- `verification-evidence-10/live-demo-mobile.png`

## Mandatory claims gate

`.factory/claims.json` exists with 24 unique entries. After the clean
`npm ci`, every listed command was run separately and matched one tagged test.
All passed:

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
| `installer-integrity` | PASS, 1/1 |
| `refund-revocation` | PASS, 1/1 |

The release-contract suite also proves every claim ID is unique, each has
exactly one matching test tag, and documented capabilities are represented in
the claim inventory. The checked-in copy audit reports no landing sentence
over 22 words and no banned marketing term.

## Clean local quality gates

- `npm ci`: PASS; 84 packages installed, zero audit vulnerabilities.
- `npm test`: PASS, 17/17.
- `npm run test:release-contract`: PASS, 10/10.
- `npx tsc --noEmit`: PASS. No separate lint script exists.
- `npm run build`: PASS; generated `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS, 21/21 with pinned Playwright 1.58.2.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after
  installing the Linux prerequisites declared in the release workflow.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the small
  Tauri shell defines zero Rust unit/doc tests.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
  - Local DEB: 16,967,732 bytes; SHA-256
    `5aa7e81247dee2f82b1f3c91c0641bfa5e7c9a8ca9d030a985285edb11461f9e`.
  - Local AppImage: 91,396,600 bytes; SHA-256
    `c93af640cf84074cfbebbcc707c95a3d7dcf040884585fee96b87e8dc8e2c760`.

The production build sizes are within contract:

- Site JavaScript: 2.28 KiB gzip main module plus 0.92 and 0.22 KiB helpers;
  site CSS: 3.09 KiB gzip.
- App JavaScript: 20.11 KiB gzip total; app CSS: 4.13 KiB gzip.
- Mobile hero AVIF: 27,041 bytes; largest hero source: 151,620 bytes.
- No downloaded font files or polyfill bundle.

## Independent end-to-end exercise

In a fresh 390×844 app context, a representative receipt containing `39`,
`1,299.99`, `0.00`, and `08/19/2026` was entered. Its lines were assigned
different rooms, categories, and warranty dates, saved, searched, edited, and
exported. The resulting CSV had one header and three records and retained the
edited room. Printable output retained the item and warranty. Deletion exposed
Undo and Undo restored the record.

Boundary and recovery evidence:

- Quantity `1000` was rejected with **“Value must be less than or equal to
  999.”** and kept the review screen; `999` saved.
- Blank manual input kept the named field visible, focused, `aria-invalid`, and
  described by **“Paste at least one item and price, then try again.”**
- An unsupported text file and a PNG one byte over 10 MiB were rejected with
  specific JPG/PNG/WebP and 10 MB recovery guidance.
- The app wrote only its two documented local record/usage keys and made only
  same-origin requests during intake, edit, print, export, removal, and undo.
- The complete E2E suite additionally exercised bundled OCR, a two-image
  queue, no selected lines, malformed backup recovery, payment redaction,
  demo/real namespace isolation, license caching and revocation, free-limit
  exports, and offline intake/edit/export.

Evidence: `verification-evidence-10/app-mobile-inventory.png`.

## Live identity, release, and installer

- `npm run verify:release-candidate -- v0.1.10 <candidate>`: PASS.
- `npm run verify:live-release -- <candidate> <URL>`: PASS.
- GitHub release `v0.1.10`, `latest.json.sourceCommit`, deployed
  `build-commit`, and the tag all equal the nominated SHA.
- The GitHub release workflow for this SHA completed successfully on
  2026-08-29 and published Linux, Windows, Intel macOS, and Apple silicon macOS
  packages plus `SHA256SUMS` and `latest.json`.
- Fresh SHA-256 comparisons show the built and deployed home, Privacy, Terms,
  404, main JS, version JS, route-focus JS, and CSS files are byte-identical.
- The detected Linux download is a real release asset. The live shell installer
  succeeded in an isolated `XDG_BIN_HOME`, verified SHA-256, and installed a
  91,400,696-byte AppImage. Its hash,
  `b5a39de4c06973f4ce3ba012e992e5deb46677832edfe64a9ac2c6155566dc87`,
  matches both `latest.json` and `SHA256SUMS`.
- The installed AppImage stayed running for the full eight-second Xvfb smoke
  window. Only expected headless EGL/DRI3 warnings appeared.
- Native packages are intentionally unsigned and the download page explains
  this before installation.

## Accessibility, responsive behavior, and routing

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS; correct
  title, `lang=en`, one `main`, one `h1`, complete image alternatives, no 390
  px overflow, and no console/page errors.
- Fresh axe scans on desktop home, 390 px home/demo/Privacy/Terms, and the app
  inventory state found zero serious or critical violations.
- Keyboard order begins with the skip link and reaches all navigation and
  primary controls. The primary action has a solid 3 px `#0B63CE` outline with
  a 4 px offset; Enter activates it and focus moves to the demo heading.
- Every visible operable hit area on home, demo, Privacy, and Terms at 390 px
  is at least 44×44 CSS pixels. The app's visually hidden 24 px file input is
  operated by its visible 211.4×46.8 px **Choose receipt photos** label; all
  other visible app targets meet the minimum.
- Reduced-motion mode matched, had zero running animations, and reduced
  transitions to effectively instant `0.00001s` changes.
- At 200% page scale the headline, main landmark, and enabled sample-data
  action remained present and visible.
- Home/demo history, deep links, back/forward focus, and mobile layout are
  covered by the passing E2E suite. Every discovered link returned 200 or an
  intentional checkout/release/download redirect. Unknown paths return the
  designed page with HTTP 404.

## Privacy, headers, billing, and performance

- Live home traffic is same-origin plus the documented GitHub Releases API
  lookup. Direct demo, Privacy, and Terms traffic is same-origin only. The app
  workflow is same-origin only. No cookies, analytics, telemetry, advertising,
  crash reporter, remote font, Azure endpoint, embedded key, console error, or
  failed request was observed.
- HTML responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, `X-Frame-Options: DENY`, and a CSP with
  `frame-ancestors 'none'`. HTML revalidates after 30 seconds; hashed assets use
  `public, max-age=31536000, immutable`.
- Checkout returns 303 to `checkout.dodopayments.com`; the hosted page returns
  200 and identifies Dodo Payments as merchant of record.
- Observed license allowance: requests 1–30 returned 200; request 31 returned
  429 with `Retry-After: 4`.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1 s, LCP 1.2 s, TBT 100 ms, CLS 0, transfer 247 KiB.
- Privacy and Terms pages, robots, sitemap, install scripts, social preview,
  icons, and the designed 404 are live. README, MIT license, demo instructions,
  visual thesis, asset provenance, and operator notes are present.

This is a Tauri desktop app, not a PWA, library, CLI, or product backend, so
service-worker update/offline-reload, consumer-package, backend concurrency,
and backend persistence checks do not apply. The app has no sign-in, so the
Entra External ID requirement does not apply. Manual app work remains usable
offline as proven by the claim suite.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

`.factory/brief.json` is absent. The researched brief supplied in the work
order, plus the checked-in design, demo, claims, README, and legal pages, were
used as the acceptance contract.
