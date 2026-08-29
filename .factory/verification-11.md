# Independent verification 11 — FAIL

**Candidate:** `09d0468e5f31692affb70ff58ee998f85f8ebbf9`

**Live URL:** <https://receipt-to-room.sociobot.in/>

**Verified:** 2026-08-29 UTC from the clean candidate checkout

**Product code changed:** no

## Release decision

**FAIL.** The website is byte-identical to the candidate build and the product
works end to end, but the installable desktop release is not built from the
nominated commit. Exact candidate provenance is a release requirement. A
smaller desktop target-size defect was also found.

## Defects by severity

### P0 — native release does not match the candidate

The public page identifies and byte-matches candidate `09d0468…`, but every
native download is published by release `v0.1.12` from parent commit
`bb83b4096ab30d46eb04d82fdb67dea89c571ea0`.

Fresh evidence:

- `npm run verify:release-candidate -- v0.1.12 09d0468…` failed:
  `release tag v0.1.12 targets bb83b409…, expected 09d0468…`.
- `npm run verify:live-release -- 09d0468… <URL>` failed at the same release
  provenance check.
- GitHub's latest release has `target_commitish=bb83b409…`; its
  `latest.json.sourceCommit` is also `bb83b409…`.
- `git ls-remote` shows `v0.1.12` at `bb83b409…`.
- GitHub reports no Actions run for candidate `09d0468…`. The successful six-job
  release run `33254132199` belongs to `bb83b409…`.
- The deployed HTML publishes `build-commit=09d0468…`, and fresh local/live
  hashes match for Home, Privacy, Terms, 404, main JS, version JS, and CSS.
  Thus the static deployment is the candidate, while its offered binaries are
  not.

Candidate `09d0468…` changes only `.factory` reports and screenshots relative
to `bb83b409…`; no runtime source differs. That explains the functional parity
but does not satisfy the required exact release identity.

### P2 — one desktop navigation target is narrower than 44 px

At 1440 px on Home, Demo, Privacy, Terms, and 404, the header **Demo** link
measures `41.7 × 44` CSS px. It has the required height but misses the supplied
44×44 minimum width. The 390 px layout adds `min-width: 44px`, so mobile passes.

## Mandatory first-read and demo gate

**PASS.** A cold 1440×900 and 390×844 visit answers all three questions on the
first screen:

- What: **“Turn receipts into room records.”**
- For whom: renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- First action: **“Try it with sample data”**, beside **“See three demo records
  right away.”**

Keyboard activation opens `/?demo=1#sample`, changes the title to
`Demo — Receipt to Room`, focuses **Your room inventory**, and immediately
shows Cedar kettle, Reading lamp, and Linen storage box. The persistent banner
says **“Demo — sample data, nothing is saved.”** Reset restores all three rows.
Exit removes the demo key while preserving two seeded real-data sentinels.
Direct demo loading made no cross-origin request.

## Mandatory claims gate

`.factory/claims.json` exists with 25 unique claims. After `npm ci`, every
listed command was invoked separately from this checkout. All passed:

| Claim ID | Result |
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

The full contract suite also confirms unique IDs and exactly one matching test
tag per claim. Public copy and README capabilities map to the inventory. The
checked-in copy audit has no sentence over 22 words and no banned marketing
word.

## Clean local quality gates

- Initial checkout: clean `main` at the nominated SHA.
- `npm ci`: PASS; 84 packages, zero audit vulnerabilities.
- `npm test`: PASS, 18/18.
- `npm run test:release-contract`: PASS, 11/11.
- `npx tsc --noEmit`: PASS. No npm lint script exists.
- `npm run build`: PASS; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS, 21/21 with pinned Playwright 1.58.2.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after
  installing the release workflow's declared Linux prerequisites.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; zero Rust
  unit/doc tests are defined.
- `cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings`:
  PASS.

Production asset sizes are within contract: site JS is 3.42 KiB gzip total and
site CSS is 3.09 KiB gzip; app JS is 20.05 KiB gzip total and app CSS is
4.13 KiB gzip. The mobile hero AVIF is 27,041 bytes. No font file or polyfill
bundle is loaded.

## Independent end-to-end exercise

In a fresh 390×844 app demo, a typed receipt containing prices `249.99`,
`0.00`, and `1,234.56` plus US date `08/29/2026` was reviewed. Its three lines
received separate rooms, categories, and warranty data, then were saved,
searched, edited, exported, removed, and restored with Undo.

- Blank input kept the field visible and focused, set `aria-invalid=true`, and
  announced **“Paste at least one item and price, then try again.”**
- Quantity `1000` was rejected with **“Value must be less than or equal to
  999.”**; `999` then saved.
- CSV contained one header plus six records (three shipped demo records and
  three new lines) and retained the edited room. Print output retained the
  edited item and room.
- The separately declared redaction claim proved card digits are replaced in
  both CSV and print output.
- The real-data sentinel was unchanged; only the demo inventory key was added.
- No external request, console error, page error, serious/critical axe issue,
  undersized mobile control, or horizontal overflow occurred.
- A keyboard-only path used Tab/Enter and arrow keys through manual entry,
  review, room selection, save, and route focus. The first Tab exposes the skip
  link with a 3 px blue outline and 3 px offset.

The full E2E suite additionally covered bundled OCR, two-photo queueing,
unsupported and over-10-MB images, malformed backup recovery, license caching
and revocation, free-limit exports, and offline typed intake/edit/export.

## Live deployment, privacy, accessibility, and performance

- `npm run verify:url -- <URL>`: PASS; title, `lang=en`, one main, one h1, alt
  text, 390 px width, console, and page-error checks passed.
- Fresh axe scans on Home, Demo, Privacy, Terms, and 404 at 1440 px and 390 px
  found zero serious or critical violations.
- Valid routes produced no console/page errors. The deliberate HTTP 404 logs
  Chromium's expected failed-document message and renders the designed page.
- Home traffic was same-origin plus the documented GitHub Releases API.
  Direct demo traffic was same-origin only. App intake/export traffic was
  same-origin only. No analytics, telemetry, remote font/script, or cookie was
  observed on the public routes.
- Response headers include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  `X-Frame-Options: DENY`, strict-origin referrer policy, and a restrictive
  permissions policy. Hashed assets use
  `public, max-age=31536000, immutable`; HTML revalidates after 30 seconds.
- Unknown routes return HTTP 404. All discovered links returned 2xx or an
  intentional 302/303 download/checkout response.
- Reduced-motion mode matched and had zero site animations; the app reduces
  transitions to an effectively instant `0.01ms`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 0.9 s, TBT 90 ms, CLS 0.
- This is a Tauri desktop app, not a PWA: service-worker update/offline-reload
  checks do not apply. It has no product backend or sign-in. The external
  billing endpoint is covered below.

## Release, installer, and paid-version service

- The latest release contains DMG (arm64 and x64), MSI, EXE, AppImage, DEB,
  RPM, app tarballs, `SHA256SUMS`, and `latest.json`. All manifest artifact
  checksums passed before the live verifier reached the provenance failure.
- The one-line Linux installer succeeded in a fresh temporary directory. The
  installed AppImage is 91,392,504 bytes with SHA-256
  `d7804e8a2d0bf004404cded737803f518ed33821ce314fed0590215a2503bb95`,
  matching `latest.json` and the release digest.
- The AppImage extracted and remained running for an eight-second Xvfb smoke
  window; only expected headless EGL/DRI3 warnings appeared.
- Checkout returned 303 to `checkout.dodopayments.com/session/...`; the hosted
  page returned 200.
- Observed paid-version allowance: the clean live gate accepted requests 1–30
  and returned 429 on request 31 with a numeric `Retry-After` of at least one
  second. A subsequent throttled response exposed `Retry-After: 4`.

## Required next steps

1. Tag and publish a new native release whose tag, GitHub release target, and
   `latest.json.sourceCommit` all equal `09d0468…`; rerun the exact-candidate
   live-release gate.
2. Give the desktop header's **Demo** link a minimum width of 44 CSS px, then
   repeat the desktop target audit.

`.factory/brief.json` is absent. The researched brief supplied in work order
`receipt-to-room-verify-11`, plus the checked-in design/demo/claims contracts,
were used as the acceptance contract.
