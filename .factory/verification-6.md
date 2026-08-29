# Independent verification 6 — FAIL

**Candidate:** `924655711c2fd45c1859bc4932b6fbd3755de7cd`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-29 UTC from the clean candidate checkout. Product code was
not changed.

## Release decision

**FAIL.** The earlier deployment-only failure is fixed: the live static files,
GitHub release target, and release manifest all identify the exact candidate.
The candidate still fails the acceptance contract on its demo, the central
mixed-room workflow, and the required claims inventory.

## Release-blocking findings

### P1 — the one-click demo does not put the product in use on the next screen

A cold live visit passes the plain first-read test. It says “Turn receipts into
room records,” names renters and homeowners, and presents **Try it with sample
data** with “See three room records right away.”

After that one click, however, the browser remains at `scrollY=0` on the same
hero. Although the URL is `/?demo=1#sample`, no sample record is visible:

| Viewport | Sample section top | First sample row top | Viewport height |
| --- | ---: | ---: | ---: |
| 1440×900 | 864 px | 1,216 px | 900 px |
| 390×844 | 1,148 px | 1,543 px | 844 px |

The desktop screenshot shows only a sliver of the sample section; the mobile
screen shows none of it. This violates the demo contract that the first screen
after clicking must already look like the product being used.

The demo is also only a read-only landing preview. `.factory/demo.md` documents
no in-app **Load sample project** entry point, and the desktop app has no demo
storage namespace. Core claim tests such as receipt workflow, bulk queue,
export, local storage, and offline work navigate directly to the normal app at
`http://127.0.0.1:1420/` and write `receipt-to-room:*` storage. They therefore
cannot be exercised using only the isolated demo entry point as required.

### P1 — one receipt cannot produce correct records for different rooms

The brief centers on a large purchase and requires reviewable line items with
room, category, and warranty assignment. A representative receipt containing
“Kitchen kettle” and “Office lamp” produced two editable lines but only one
room select, one category select, and one warranty input. Saving the receipt
stored both items as `Kitchen / Home supply` with the same warranty value.

Room/category/warranty fields are held on the receipt draft, outside the line
items, and saved onto every selected line. There is no saved-record edit action
to correct the second item later. A mixed household shop therefore cannot be
turned into an accurate room-level inventory without retyping or artificial
receipt splitting. This misses the real job-to-be-done.

### P1 — `.factory/claims.json` is not a complete truthful claims inventory

All 11 listed tests pass, but visitor-facing promises remain outside the
manifest. Material examples include:

- **“Everything remains editable”** in the intake privacy note. After saving,
  an inventory row offers only **Remove**; there is no edit action. The promise
  is both unlisted and false.
- **“All future v1 updates”** in the paid-license screen and Terms. It is
  unlisted and cannot be proven by the current sandbox.
- **“Payment fragments redacted from exports”** and the Privacy page’s
  no-analytics/no-telemetry promises are not represented as claim entries.
  Some have lower-level or one-off verification, but the claims contract
  requires the promises and their observable tests to be listed in
  `.factory/claims.json`.

An unlisted or false claim is release-blocking under the supplied claims
contract even when every currently listed command is green.

## Other defects

### P2 — malformed JSON restore poisons local inventory and throws

With a cached valid license, restoring the syntactically valid file
`{"items":[{}]}` is accepted and persisted as the real inventory. Rendering
then raises `Cannot read properties of undefined (reading 'toLowerCase')`.
Opening Inventory continues to fail because the bad value remains in
`receipt-to-room:inventory:v1`. Restore validates only that `items` is an
array; it must validate every record before replacing known-good data.

### P2 — navigation loses location, scroll, and focus

- Opening `/#inventory` shows the intake view, not Inventory.
- After selecting Inventory, reload at the same hash returns to intake.
- At 390 px, choosing **Review these lines** left `scrollY=951`; the review
  heading was 425 px above the viewport and focus fell to `<body>`.
- Saving left `scrollY=622`; the Inventory `<h1>` was 445 px above the viewport
  and focus again fell to `<body>`.

The app does not restore initial route state or move focus/scroll to the new
screen heading, contrary to the routing and screen-reader contract.

### P2 — common receipt number formats are not parsed correctly

`inferDate("08/19/2026")` returns invalid ISO text `2026-19-08`, even though
USD is the default currency. `parseReceiptText` also drops both
`Desk lamp 1,299.99` and `Desk lamp 39`; only `Desk lamp 39.00` is accepted.
These are representative US receipt formats and create avoidable OCR review
work.

### P2 — two first-screen mobile targets are smaller than 44×44 CSS px

At 390 px, the wordmark link measured 185×34 and the Demo navigation link
measured 36×44. The keyboard focus treatment is visible, but these hit areas
miss the attached touch-target baseline.

## Mandatory claims gate

`.factory/claims.json` exists. After `npm ci`, every manifest command was run
individually so one result could not mask another. Each invocation rebuilt the
production outputs first.

| Claim ID | Result |
| --- | --- |
| `sample-demo` | PASS (1/1) |
| `local-ocr` | PASS (1/1) |
| `csv-export` | PASS (1/1) |
| `price` | PASS (1/1) |
| `release-api` | PASS (1/1) |
| `receipt-workflow` | PASS (1/1) |
| `bulk-queue` | PASS (1/1) |
| `print-undo` | PASS (1/1) |
| `local-storage` | PASS (1/1) |
| `license-rate-policy` | PASS (1/1) |
| `offline-work` | PASS (1/1) |

The table records the commands as written. It does not waive the P1 findings
that the product demo is not the entry point for most tests and that the claim
list omits visitor-facing promises.

## Build and automated verification

- `npm ci`: PASS; 84 packages installed, 0 audit vulnerabilities.
- `npm test`: PASS, 10/10.
- `npm run test:release-contract`: PASS, 5/5.
- `npx tsc --noEmit`: PASS. No separate lint script exists.
- `npm run build`: PASS; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS, 13/13.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after
  installing the Linux packages declared by the release workflow.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the Rust
  crate contains zero unit/doc tests.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
  - DEB: 16,961,278 bytes, SHA-256
    `902731d5b86fb3b68a539badcc66d9054131cbb77959816d10f35adafb432429`.
  - AppImage: 91,396,600 bytes, SHA-256
    `2ce120f8185b7cb9e98e0e7ced74d3adf47e8068759f821378e453bc37486021`.
- The local release binary and the extracted AppImage both remained running
  for an eight-second Xvfb smoke test. The only output was expected headless
  EGL acceleration warnings.

Independent normal/boundary/recovery coverage also passed for blank manual
input, zero selected lines, quantity below the HTML minimum, a missing required
retailer, 999 quantity, zero price, a receipt over 10 MiB, search, CSV,
printable output, five-second deletion expiry, offline intake/export, and
recovery after a rejected oversized image.

## Deployment, release, privacy, accessibility, and performance

The earlier release-provenance failure is resolved:

- GitHub release `v0.1.4` targets
  `924655711c2fd45c1859bc4932b6fbd3755de7cd`.
- `latest.json` records the same `sourceCommit`.
- The GitHub Actions release run for that SHA completed successfully.
- Local/live SHA-256 values match for `index.html`
  (`dfd60b…f780`), `main-CZPmBnd9.js` (`79d164…df5c`), and
  `styles-DM7INdxG.css` (`c04b87…d243`).
- `npm run verify:live-release -- 924655711c2fd45c1859bc4932b6fbd3755de7cd
  https://receipt-to-room.sociobot.in`: PASS. It downloaded and verified the
  selected platform artifacts, received checkout 303 to
  `checkout.dodopayments.com`, loaded hosted checkout with 200, confirmed a
  true 404, and confirmed immutable asset caching.
- Observed license allowance: **30 requests per service window**. Request 31
  returned **429** with `Retry-After: 4`.
- The live Linux installer was run with an isolated `XDG_BIN_HOME`. It
  installed the 91,396,600-byte AppImage, verified published SHA-256
  `e7a69ef8d9be3d6ae6799fa72d22623bf372d5e10897d54a62293b7d292c731a`,
  and the downloaded AppImage extracted and smoke-ran successfully.

`npm run verify:url -- https://receipt-to-room.sociobot.in` passed. Desktop
and 390 px checks across home, demo, Privacy, Terms, and 404 found one h1/main,
valid language/titles, no overflow or missing alt text, no load errors on 200
routes, and zero serious/critical axe findings. App intake, review, and
inventory states also had zero serious/critical axe findings. First keyboard
focus is the visible skip link with a 3 px blue outline. Reduced-motion styles
reduce transitions to `0.01ms` and remove app animation.

The live request log contained only the product origin and the disclosed
GitHub Releases API. Manual intake/export generated no external request; local
OCR claim coverage likewise recorded none. No analytics, third-party fonts,
Azure endpoints, or embedded secret were found. Headers include HSTS,
`nosniff`, strict-origin referrer policy, restrictive permissions policy,
`X-Frame-Options: DENY`, and CSP `frame-ancestors 'none'`. Hashed JS/CSS use
`public, max-age=31536000, immutable`; HTML revalidates after 30 seconds.

Fresh mobile Lighthouse: Performance 99, Accessibility 100, Best Practices
100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 120 ms, CLS 0, total transfer 39 KiB.
Production site JS is 5.02 kB raw / 2.13 kB gzip, CSS is 10.27 kB raw / 2.97
kB gzip, and the mobile hero AVIF is 27,041 bytes. App initial JS chunks are
well below 200 kB; OCR data is loaded only when receipt recognition starts.

## Required repair before another candidate

1. Make the one-click demo land on visible, useful sample records and add an
   isolated in-app sample project that can exercise every claim.
2. Move room, category, and warranty assignment to each reviewed line and add
   saved-record editing.
3. Reconcile every visitor-facing promise with `.factory/claims.json`; remove
   unprovable promises and test the remaining observable outcomes.
4. Validate imported backup schemas before writing storage, restore initial
   route state, manage focus/scroll on screen changes, and fix the documented
   parsing and touch-target defects.
