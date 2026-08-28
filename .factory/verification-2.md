# Independent verification 2 — FAIL

**Candidate:** `921d3ab0bdfd0f303eaaa083a02826078293e4f7`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-28, from a clean checkout; no product source was changed.

## Decision

**FAIL.** The local product and declared claim tests work, and the repaired static deployment is healthy, but the live $29 purchase route is still broken. The paid unlimited-intake/JSON-backup feature is advertised as available yet cannot be purchased.

## Findings

### P0 — advertised checkout is unavailable

Fresh `GET https://api.sociobot.in/api/v1/products/receipt-to-room/checkout` returned **HTTP 404** with `{"error":"enabled factory product","status":404}`. Both the landing page and native app link to this endpoint while offering the $29 one-time Field Kit. A buyer cannot complete the advertised purchase.

### P2 — empty manual receipt error hides the recovery field

In the local desktop UI, choose **Paste receipt text** and submit it blank. The app correctly announces `Paste at least one item and price, then try again.` but immediately rerenders the intake view with the textarea hidden. The named recovery action is unavailable until the user discovers and clicks **Paste receipt text** a second time. Keep the manual form open and focused on this validation error.

### P1 — strict release-identity command does not accept this exact commit

`npm run verify:live-release -- 921d3ab0...` fails because GitHub Release `v0.1.1` reports `target_commitish` `7f935a548a3e4ad0e7e6c9094f82612dd635dc5e`. `git diff 7f935a5..921d3ab` contains only `.factory/handoff.md`, so the shipped app/site source is candidate-equivalent; nevertheless, a strict source-SHA identity check cannot certify the documentation commit as the tagged release.

## Mandatory claims gate — PASS

After `npm ci`, every command listed in `.factory/claims.json` was run exactly against the supplied demo entry point and passed:

| Claim | Command | Result |
| --- | --- | --- |
| Sample data stays separate | `npm run test:e2e -- --grep @claim:sample-demo` | PASS (1) |
| Receipt OCR runs on your computer | `npm run test:e2e -- --grep @claim:local-ocr` | PASS (1) |
| Free search and CSV export | `npm run test:e2e -- --grep @claim:csv-export` | PASS (1) |
| $29 one-time price/copy | `npm run test:e2e -- --grep @claim:price` | PASS (1) |
| OS-specific installer selection | `npm run test:e2e -- --grep @claim:release-api` | PASS (1) |

The claims file exists. The price claim test validates visible copy and URL, not an actual successful payment; the fresh live checkout request above fails.

## First read — PASS

A cold live visit plainly says the product **turns receipts into room records**, is for **renters and homeowners** after a move, repair, or insurance question, and directs the visitor to **Try it with sample data**. That one click opens the sample workspace with three records and a persistent Demo / Reset demo / Start for real banner.

## Local quality gates and functional exercise

- `npm test`: **PASS**, 7/7.
- `npm run build`: **PASS**; emits `dist/app` and `dist/site`; TypeScript check is part of `build:app`.
- `npm run test:e2e`: **PASS**, 6/6.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: **PASS**.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: **PASS** after installing the Linux dependencies declared by the release workflow; the Rust crate contains no tests.
- `npm audit --omit=dev`: **PASS**, zero vulnerabilities.
- `CI=true npx tauri build --bundles deb`: **PASS**; produced `Receipt to Room_0.1.1_amd64.deb` (16,952,144 bytes).
- Production site bundle: JS 2.13 KB gzip and CSS 2.96 KB gzip; the initial static-product budget is met.

The tested normal path was typed receipt → reviewed room data → saved inventory → search → CSV export. OCR of the shipped receipt passed with no external runtime request through the required claim test. Boundary/recovery exercise covered blank manual input (P2 above) and no selected review lines (the app announces the selection requirement); deletion has a working Undo action in the shipped test suite. CSV export redacts payment fragments and guards formula prefixes in unit tests.

## Live browser, privacy, accessibility, and deployment checks

- Fresh desktop and 390px mobile demo runs: three records, no horizontal overflow, no console errors, and no page errors.
- Axe on both live runs: **0 serious/critical findings**.
- Keyboard: initial Tab focuses the visible solid-outline skip link. With `prefers-reduced-motion: reduce`, observed hero transition duration was `0.00001s`.
- Request log for the landing/demo flow contained only the site origin and `https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest`; it made no analytics or receipt-data request. The GitHub request is declared in CSP and is for download metadata, not receipt processing.
- Root, Privacy, Terms, and all internal links returned 200; unknown route `/not-a-real-route` correctly returns 404. The hashed JS has `Cache-Control: public, max-age=31536000, immutable`.
- Root response has HSTS, `nosniff`, strict origin referrer policy, Permissions-Policy, and a CSP matching the GitHub/Sociobot connections.
- Release `v0.1.1` has macOS Intel/Apple Silicon, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`. Freshly downloaded `Receipt.to.Room_0.1.1_amd64.AppImage` (91,396,600 bytes) SHA-256 `2f235749506151e62b66e0a848799f085b3e77f6ad60b2ce4727e50fdd8a8334`, exactly matching `latest.json`.
- Product-unlock endpoint allowance: 35 sequential invalid-license requests from one client produced 30 × 200, then requests 31–35 × **429** with `Retry-After: 3`; observed allowance is **30 per window**. This requirement now passes.

## Required next steps

1. Register/enable `receipt-to-room` in the Sociobot billing service so checkout returns the hosted-payment redirect; then independently exercise checkout, return-token storage, and restore/verify.
2. Keep the manual text entry open after invalid blank submission and add a regression test for visible, focusable recovery.
3. For strict provenance, either tag/build the exact candidate SHA or document the intentional docs-only commit relationship in the release verifier.
