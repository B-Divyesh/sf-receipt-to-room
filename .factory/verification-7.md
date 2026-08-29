# Independent verification 7 — PASS

**Candidate:** `1cab44ef8befe26a157548195bcc0bb8b87ec150`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-29 UTC from a clean checkout. Product code was not
changed.

## Release decision

**PASS.** The live static site, GitHub release, native installer, and release
manifest all identify the exact candidate. The prior deployment-only mismatch
is not present.

## Cold first read and demo

An unauthenticated cold visit at both 1440x900 and 390x844 plainly says:

- **What it does:** “Turn receipts into room records.”
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to do first:** **Try it with sample data**, with the adjacent result
  “See three room records right away.”

The action is one click. It changes the URL to `?demo=1#sample`, focuses the
`Your room inventory` heading, and visibly shows the `Cedar kettle` sample
row. The row was at y=368/900 on desktop and y=411/844 on mobile. The persistent
banner says “Demo — sample data, nothing is saved to your real records” and
offers Reset demo and Start for real. The app demo uses the documented
`demo:receipt-to-room:*` storage namespace.

## Mandatory claims gate

`.factory/claims.json` exists with 17 unique claims. After `npm ci`, every
listed command was invoked individually, exactly as declared, against the
product's local demo entry points. All passed. The final full Playwright run
also passed all 18 tests (`test-results/.last-run.json`: `passed`).

| Claim ID | Result |
| --- | --- |
| `sample-demo` | PASS |
| `local-ocr` | PASS |
| `csv-export` | PASS |
| `price` | PASS |
| `release-api` | PASS |
| `receipt-workflow` | PASS |
| `editable-records` | PASS |
| `bulk-queue` | PASS |
| `image-input` | PASS |
| `print-undo` | PASS |
| `local-storage` | PASS |
| `backup-restore` | PASS |
| `redacted-exports` | PASS |
| `privacy-boundaries` | PASS |
| `license-cache` | PASS |
| `license-rate-policy` | PASS |
| `offline-work` | PASS |

These cover the useful receipt workflow: local OCR/manual recovery, line-level
room/category/warranty review, saved-item editing, bulk intake, validation,
search, redacted CSV/print output, backup recovery, deletion undo, offline
manual work, and demo isolation.

## Local checks

- `npm ci`: PASS — 84 packages installed; npm reported 0 vulnerabilities.
- `npm test`: PASS — 12/12.
- `npm run test:release-contract`: PASS — 5/5.
- `npx tsc --noEmit`: PASS. There is no separate lint script.
- `npm run build`: PASS — produced `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS — 18/18 Chromium tests, including normal,
  boundary, invalid-input, recovery, keyboard, offline, and axe coverage.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- Native Rust check/test: PASS after installing the standard Linux Tauri
  development prerequisites in this disposable verifier container.

The app's initial JavaScript totals 52.61 kB raw / 20.17 kB gzip; the local OCR
models are separate on-demand assets. Production-site JS is 5.42 kB raw / 2.25
kB gzip, CSS is 10.33 kB raw / 2.99 kB gzip, and the mobile hero AVIF is
27,041 bytes. These are within the stated budgets.

## Deployment, native artifact, privacy, accessibility, and performance

- `npm run verify:live-release -- 1cab44ef8befe26a157548195bcc0bb8b87ec150 https://receipt-to-room.sociobot.in`:
  PASS. GitHub release `v0.1.5` and `latest.json` bind to the candidate commit;
  required DMG/MSI/EXE/AppImage assets and manifest checksums verified.
- The live `index.html`, `main-CUaKumWr.js`, and `styles-CzV0UYTb.css` SHA-256
  values exactly equal the fresh local production build.
- The live Linux installer downloaded the AppImage, verified SHA-256
  `ca03ec111fd2f40a968109946228eae6928592e9ff49bbb2572b0c0c6d42336c`,
  and installed it to an isolated `XDG_BIN_HOME`. Extracted from the AppImage,
  the app stayed running for eight seconds under Xvfb. The sole output was
  expected headless EGL/DRI3 acceleration warnings.
- Checkout returned 303 to `checkout.dodopayments.com` and the hosted page
  returned 200. The live allowance is **30 verification requests per service
  window**; request 31 returned **429** with `Retry-After: 4`.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS (title,
  `lang=en`, exactly one main/h1, alt text, no 390px overflow, no load errors).
- Fresh Playwright + axe checks on home, demo, Privacy, Terms, and 404 at 390px
  found zero serious/critical violations. Keyboard tabbing begins at the
  visible skip link; all interactive controls were reachable. Reduced-motion
  media was active and respected.
- Outgoing-request evidence: the landing page only requested its own origin
  plus the disclosed GitHub Releases API for download metadata; it set no
  cookies and logged no errors. App demo/manual intake/export claim tests made
  no external request. No analytics, telemetry, advertising, crash reporter,
  third-party runtime script, remote font, Azure endpoint, or embedded secret
  was observed.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive
  permissions policy, `X-Frame-Options: DENY`, and a CSP with
  `frame-ancestors 'none'`. HTML revalidates at 30 seconds; hashed assets are
  `public, max-age=31536000, immutable`; an unknown route is a true 404.
- Fresh mobile Lighthouse: Performance **100**, Accessibility **100**, FCP
  **1.2 s**, LCP **1.2 s**, TBT **30 ms**, CLS **0**.

All crawled live links returned 200 except the intentional 404 test route;
download and `mailto:` links were treated as non-document links.

## Defects

No release-blocking, high, medium, or low defects found in this verification.

## Notes

- Native packages are intentionally unsigned, and the landing page documents
  this. This is an accepted, disclosed operator-action gap rather than a test
  defect.
- `.factory/brief.json` is absent from this candidate; the supplied researched
  brief and existing design/demo/claims documentation were used as the
  acceptance contract.
