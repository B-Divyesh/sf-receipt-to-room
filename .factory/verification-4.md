# Independent verification 4 — FAIL

**Candidate:** `238becc29e41edb88497cfc4c31fa9b9d0f76d22` (`v0.1.2`)

**Live URL:** `https://receipt-to-room.sociobot.in`

**Date:** 2026-08-28

## Verdict

**FAIL.** The deployed site and release genuinely correspond to the candidate,
and most build, functional, privacy, accessibility, and release checks pass.
It is nevertheless not releasable: one required claim test failed in the
clean-clone sequence, the paid intake limit can be bypassed, and the normal
landing page presents itself as a demo.

## First-read result

Cold opening the live page communicates: it turns receipt photos into
searchable room records; it is for renters and homeowners who need purchase
details after a move, repair, or insurance question; click **Try it with sample
data** first to see three room records. This passes the plain-words and
one-click-demo first-screen requirement. The caveat is defect P1-2 below: the
demo banner is also visible on the normal, non-demo page.

## Release-blocking findings

### P1-1 — Required `release-api` claim test is flaky and failed from the clean clone

After `npm ci`, each test listed in `.factory/claims.json` was run through its
declared `npm run test:e2e -- --grep …` command. `@claim:release-api` initially
failed with:

```
page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:4173/
```

It passed immediately on retry, and a later full 8-test E2E run passed. The
failure is still release-blocking under the claims contract: every listed claim
test must pass from a clean clone. The test configuration uses
`reuseExistingServer: true` for the two Vite demo servers, consistent with the
observed stale/unavailable local entry point.

### P1-2 — The live non-demo page falsely displays the demo banner

Fresh Playwright inspection of `/` found `#demo-banner` with `hidden` still set,
but computed `display: flex`, a visible 1180×58 px box, and the text:
“Demo — sample data, nothing is saved to your real records. Reset demo Start for
real.” The sample workspace is still hidden. `site/styles.css` sets
`.demo-banner { display:flex }` without an overriding `[hidden]` rule, overriding
the browser’s hidden styling. Visitors not in the isolated sandbox are told that
they are in it.

### P1-3 — Free users can bypass the advertised three-receipt limit

In a fresh 390 px browser app session, preloading three distinct receipt IDs
made the intake page report “3 of 3 free receipts used.” Then:

1. Select **Paste receipt text**.
2. Enter `FOURTH SHOP\nFourth item 4.00\nTOTAL 4.00`.
3. Review and select **Add to room inventory**.

The fourth receipt saved successfully; inventory had four rows including
“Fourth item.” The manual path calls `createDraft` directly and never checks the
free receipt allowance. The page, terms, and price claim all promise a $29
one-time unlock for unlimited receipt intake.

### P1-4 — Unlisted visitor claims in README

The claims file has only sample isolation, local OCR, CSV export, price, and
release metadata. README also tells visitors that the product has a bundled OCR
model, bulk image queue, room/category/warranty review, printable PDF export,
deletion undo, and local storage/no-CDN behaviour. These are claims a visitor
can rely on but have no corresponding claim entry and demo-observable test, as
required by the claims contract.

## Additional findings

### P2-1 — CSP omits clickjacking protection

The live response has a valid restrictive CSP but no `frame-ancestors` directive
and no `X-Frame-Options`. The site-structure requirement calls for
`frame-ancestors` as a response header. Add it to the static host headers and
verify it is present on the deployment.

### P2-2 — Required `verify-url.sh` is absent

No worker `verify-url.sh` exists in the checkout, so that prescribed command
could not be run. Equivalent live checks were performed manually (title, lang,
main landmark, alt text, console errors and axe), but the missing scripted gate
should be restored.

### P2-3 — Unlock allowance is enforced but not documented as a number

`npm run verify:live-release` sent 31 invalid verification requests and passed
only after the live API returned `429` with `Retry-After`. A direct sequence
immediately afterwards was already in the shared bucket (two 200 responses,
then 429 responses with `Retry-After: 0`), so it could not independently count
a fresh full window. The supplied release gate and prior bucket behaviour imply
a 30-request window, but neither README nor public copy documents that
allowance. Publish the number and an appropriate non-zero retry interval.

## Claims from clean clone

| Claim ID | Command | Result |
| --- | --- | --- |
| `sample-demo` | `npm run test:e2e -- --grep @claim:sample-demo` | PASS (1 test) |
| `local-ocr` | `npm run test:e2e -- --grep @claim:local-ocr` | PASS (1 test; no external runtime asset request) |
| `csv-export` | `npm run test:e2e -- --grep @claim:csv-export` | PASS (1 test) |
| `price` | `npm run test:e2e -- --grep @claim:price` | PASS (1 test) |
| `release-api` | `npm run test:e2e -- --grep @claim:release-api` | **FAIL first run**: connection refused at demo entry point; PASS immediate retry |

## Build and test evidence

- `npm ci`: passed, 0 vulnerabilities reported.
- `npm test`: **7/7 passed**.
- `npm run build`: passed. App type-check passed and `dist/app` plus `dist/site`
  were produced.
- `npm run test:release-contract`: **2/2 passed**.
- Full `npm run test:e2e`: **8/8 passed** after the failed isolated claim run.
  It covered typed-receipt → review → room assignment → search → CSV download,
  blank-manual recovery, checkout return/token stripping with a recorded API
  response, and bundled OCR without an external request.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed after
  installing the release workflow’s Linux GTK/WebKit prerequisites.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed; the crate
  exposes zero Rust unit/doc tests.

The built app’s initial JS files are 27.14 kB and 17.27 kB uncompressed
(10.60 kB and 7.34 kB gzip); site JS is 5.02 kB (2.13 kB gzip), site CSS is
10.24 kB (2.96 kB gzip), and the mobile hero AVIF is 27,041 bytes. These meet
the stated static budgets.

## Live deployment and installer evidence

- GitHub Releases `latest` reports `v0.1.2` with
  `target_commitish: 238becc29e41edb88497cfc4c31fa9b9d0f76d22`.
- The live HTML, site JavaScript, and site CSS byte-match the locally built
  candidate artifacts (SHA-256 checked).
- Release assets include DMG (arm64/x64), MSI/EXE, AppImage, DEB/RPM,
  `latest.json`, and `SHA256SUMS`. Downloaded
  `Receipt.to.Room_0.1.2_amd64.deb` had SHA-256
  `c5681eb5a38936c729145a3240be86d5710fee776e93ca7fee2921f5b6530936`,
  matching `SHA256SUMS`; package metadata is `receipt-to-room 0.1.2 amd64`.
- `npm run verify:live-release -- 238becc29e41edb88497cfc4c31fa9b9d0f76d22 https://receipt-to-room.sociobot.in`:
  **PASS**. Dodo checkout was 303 → hosted 200; immutable asset cache and a
  true 404 also passed.

## Privacy, headers, accessibility, and responsive evidence

- Playwright request logs on a fresh live landing context and a fresh demo
  context contained only same-origin assets plus the disclosed GitHub Releases
  metadata endpoint. There were no analytics, trackers, receipt uploads, or
  third-party scripts. The local OCR claim test recorded no HTTP(S) request
  outside the local origin.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`, and CSP with only self plus GitHub/Sociobot connect
  origins. HTML cache is 30 seconds; hashed assets are
  `public, max-age=31536000, immutable`. See P2-1 for the missing
  `frame-ancestors` policy.
- Desktop (1280 px) and mobile demo (390 px) both had exactly one h1 and main
  landmark, no horizontal overflow, no console or page errors, and no axe
  serious/critical findings with `@axe-core/playwright`. Tab first reaches the
  skip link with a visible `rgb(11, 99, 206) solid 3px` focus ring. Reduced
  motion CSS sets transition duration to .01 ms and removes transforms.

## Required next steps

1. Make the demo banner obey `[hidden]` and add a regression test for `/`
   versus `?demo=1`.
2. Enforce the three-receipt cap for the manual intake path without removing
   its recovery flow; add a claim test.
3. Make the two-server Playwright setup deterministic, then run every claim
   command from a fresh clone until all pass on the first run.
4. Either test every public README claim through demo data or remove/qualify
   the claim. Add `frame-ancestors` and restore the URL verification script.
5. Document the product-unlock request allowance and keep 429 responses
   accompanied by a meaningful `Retry-After` value.
