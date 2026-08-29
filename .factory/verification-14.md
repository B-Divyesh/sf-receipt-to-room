# Receipt to Room — independent verification 14

**Result: FAIL — do not accept candidate `8820f663f52a3add9186f0f53632ffe15902ab2a` until P1 below is resolved.**

Verified on 2026-08-29 against `https://receipt-to-room.sociobot.in`. The live
page exposes `build-commit=8820f663f52a3add9186f0f53632ffe15902ab2a`; release
`v0.1.16`, its tag target, and `latest.json.sourceCommit` all name that exact
commit.

## Release-blocking defect

### P1 — cold mobile performance does not reliably meet the required budget

A fresh mobile Lighthouse run (cache and origin data cleared) produced
Performance **66/100** and LCP **3.33 s**, above the factory limits of 90 and
2.5 s. Its LCP was the high-priority 768 px hero AVIF. The audit attributes
600 ms to TTFB, 1.36 s to image load delay, and 1.34 s to render delay.

Two immediate independent repeats passed (94 / 2.27 s and 100 / 0.97 s), so
the defect is variability in the first-load path rather than a permanent
outage. It is still a failure of the stated first-load quality gate: a clean
representative run is over budget. The deployment must make the cold path
reliably pass, not merely pass when the CDN/browser happens to be warm.

Evidence: `.factory/evidence-14/lighthouse-mobile-retry.json`,
`lighthouse-mobile-confirm.json`, and `lighthouse-mobile-third.json`.

Suggested repair: profile the live cold path; remove the hero image request
delay (for example, preloading the selected responsive candidate), then rerun
several cold mobile measurements until all meet LCP <2.5 s and Performance >=90.

## Mandatory gates

### Claims and clean build

A new clone at `/tmp/receipt-to-room-verify14.VjRCiZ` was made from this tree,
then `npm ci` was run before any claim test. Every exact command in
`.factory/claims.json` was invoked separately through the product's demo
entry point: **25/25 passed**.

`sample-demo`, `local-ocr`, `csv-export`, `price`, `release-api`,
`receipt-workflow`, `editable-records`, `bulk-queue`, `image-input`,
`print-undo`, `local-storage`, `backup-restore`, `redacted-exports`,
`privacy-boundaries`, `license-cache`, `license-rate-policy`, `offline-work`,
`checkout-operator`, `free-exports`, `scope-boundaries`, `release-trigger`,
`release-artifacts`, `release-candidate`, `installer-integrity`, and
`refund-revocation` all passed. `claims.json` exists and has the required
one-to-one tagged coverage.

- `npm test`: PASS, 20/20.
- `npm run test:release-contract`: PASS, 13/13.
- `npm run build`: PASS; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS, 25/25 (`test-results/.last-run.json` reports
  `passed`).
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS (zero thin
  shell tests, zero failures).
- `cargo check --locked`, `cargo fmt --check`, and
  `cargo clippy --locked -- -D warnings`: PASS.

The static landing JS is far below the 200 KB budget (5.97 KB + 3.12 KB +
0.28 KB uncompressed; 4.09 KB gzip combined). CSS is 11.11 KB uncompressed.
The initial Lighthouse transfer was 306.9 KB, chiefly images; this is not a JS
budget breach.

### First read and demo

Cold live page result, recorded in `.factory/evidence-14/first-read.json`:

- **What it does:** “Turn receipts into room records.”
- **For whom:** renters and homeowners needing purchase details after a move,
  repair, or insurance question.
- **What to click:** “Try it with sample data”, with “See three demo records
  right away.” alongside it.

This passes the plain-words and one-click demo gate. A mobile direct-demo visit
showed three records, a persistent “Demo — sample data, nothing is saved”
banner, Reset demo, and Leave demo controls. It focused the demo heading and
wrote only `demo:receipt-to-room:sample:v1`.

### Product workflow and boundaries

An independent 390 px browser flow added a typed two-line receipt, checked
line items, assigned rooms/categories/warranty dates, saved, searched,
edited Office lamp to Living room with warranty 2030-08-19, and downloaded
`receipt-to-room-inventory.csv`. The CSV contained the item but not the test
card fragment. Empty manual text gave an announced error, retained the manual
fallback, set `aria-invalid=true`, and returned focus to the field. Review and
inventory screens had zero serious/critical Axe findings.

The 25 claim tests additionally cover receipt-photo OCR and bulk queue,
unsupported/over-10 MB files, delete/undo, print, malformed backup recovery,
offline editing/export, free limits, refund revocation, and license cache.

### Live deployment, privacy, and native artifact

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS: 200,
  title, `lang=en`, exactly one main and h1, alt text, no overflow or browser
  errors.
- `npm run verify:live-release -- 8820f663f52a3add9186f0f53632ffe15902ab2a ...`:
  PASS. It verified every published macOS, Windows, and Linux artifact against
  `SHA256SUMS`, immutable hashed assets, `image/avif`, true 404, and the hosted
  Dodo checkout redirect.
- The documented verify allowance is enforced: requests 1–30 returned 200;
  request 31 returned **429** with `Retry-After: 4`.
- A downloaded Linux AppImage matched manifest checksum
  `ef7a19fbc09164d8c533d7a3c905f11f3706daeffae43539a8a6171e344780e4`,
  extracted successfully, and remained running for a 12-second Xvfb smoke
  session (timeout exit 124; only expected headless DRI warnings).
- Direct live demo requests were same-origin only; no cookies were set. The
  independent app workflow made no external request. This supports the
  local-first/no-analytics claims. The normal landing's explicitly permitted
  GitHub release lookup is not made in demo mode.
- Headers include a matching CSP, `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and one-year immutable cache on
  hashed assets. See `.factory/evidence-14/live-browser-audit.json`.

### Accessibility and responsive checks

Desktop home plus 390 px home, demo, Privacy, Terms, and 404 all returned 200
with no console/page errors, no horizontal overflow, valid landmark/title/h1
structure, and zero Axe violations (therefore zero serious/critical). Keyboard
testing showed the skip link and primary demo action with a visible 3 px solid
focus ring; Enter opened demo and moved focus to its heading. Reduced-motion
context had no running animations and `scroll-behavior: auto`.

## Handoff

No source code was changed. Evidence added under `.factory/evidence-14/`; this
report and `.factory/handoff.md` are the only repository changes. Re-verify
after the P1 repair with the exact commands above and multiple cold Lighthouse
mobile runs.
