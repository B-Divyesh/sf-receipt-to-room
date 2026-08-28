# Independent verification 5 — FAIL

**Candidate:** `fbd685d4e11121bfee033b5897e750c51a63155c`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-28 UTC from this clean checkout; no product source was changed.

## Release decision

**FAIL.** The product itself is healthy and the live static site byte-matches
the candidate's product source. However, the public installable release is
proven to target `50e6888fc2e78ef7c4dde423ed136db82adcac51`, not the candidate
requested for this verification. Exact deployment identity is an acceptance
requirement for a desktop app, so this candidate cannot be accepted.

### P1 — public release does not target the requested candidate SHA

`npm run verify:live-release -- fbd685d4e11121bfee033b5897e750c51a63155c
https://receipt-to-room.sociobot.in` failed with:

```
release targets 50e6888fc2e78ef7c4dde423ed136db82adcac51,
expected fbd685d4e11121bfee033b5897e750c51a63155c
```

The candidate changes only `.factory/handoff.md` relative to that release
target, and the regenerated local static HTML, JS and CSS byte-match live.
That demonstrates product equivalence but not exact candidate provenance.
Publish/tag the requested SHA (or make the candidate's release provenance
explicitly match it) and rerun the strict gate.

## Mandatory claim gate — PASS

`.factory/claims.json` exists. After `npm ci`, every listed command was run
individually through the product's local demo entry points from fresh browser
state; all passed 1/1 on the first verification sequence:

| Claim ID | Result |
| --- | --- |
| `sample-demo` | PASS |
| `local-ocr` | PASS |
| `csv-export` | PASS |
| `price` | PASS |
| `release-api` | PASS |
| `receipt-workflow` | PASS |
| `bulk-queue` | PASS |
| `print-undo` | PASS |
| `local-storage` | PASS |
| `license-rate-policy` | PASS |
| `offline-work` | PASS |

The full `npm run test:e2e` suite also passed (13/13). It independently covers
typed receipt intake/review/search/export, blank-input recovery, sample-data
isolation/reset, queueing, OCR, offline work, undo/print, restore-token flow,
and the free-limit boundary.

## First read — PASS

A cold live visit says it **turns receipts into room records**, says it is for
**renters and homeowners** after a move, repair, or insurance question, and
offers **Try it with sample data** with “See three room records right away.”
The one-click demo URL is `/?demo=1`; it exposes three realistic records plus
the persistent “Demo — sample data, nothing is saved to your real records”
banner, Reset demo, and Start for real. The normal URL correctly hides that
banner.

## Local quality gates

- `npm ci`: PASS; 84 packages installed, no npm audit vulnerabilities.
- `npm test`: PASS, 9/9.
- `npm run test:release-contract`: PASS, 4/4.
- `npm run build`: PASS; type checking is included and `dist/app` and
  `dist/site` were produced.
- `npm run test:e2e`: PASS, 13/13.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after
  installing the same Linux WebKit/GTK dependencies used by the release
  workflow.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the crate
  has zero unit or doc tests.
- Native production bundle attempt: `CI=true npm run tauri build -- --bundles
  deb,appimage` produced the 16,961,598-byte DEB, but the local AppImage step
  stopped at `failed to run linuxdeploy` after the disposable runner lacked
  that external bundler. Installing the workflow's GTK/WebKit packages and
  `xdg-open` resolved earlier environment errors but does not provide
  linuxdeploy. This is a runner-tooling limitation, not used for the verdict:
  the public GitHub Actions release is independently present and its published
  assets/checksums pass the live release gate.

Static production outputs meet the applicable initial-load budgets: site JS is
5.02 kB raw / 2.13 kB gzip and CSS is 10.27 kB raw / 2.97 kB gzip. App chunks
are 27.87 kB and 17.27 kB raw (10.83 kB and 7.34 kB gzip).

## Live browser, privacy, accessibility and release evidence

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS: correct
  title and language, one main and h1, no missing image alt text, no overflow,
  no console/page errors.
- Fresh desktop `/` and 390px `/?demo=1` runs had one h1 and main, no horizontal
  overflow, and zero serious/critical axe findings. First Tab reaches the skip
  link with a visible `rgb(11, 99, 206) solid 3px` focus outline. Reduced-motion
  transition duration is `1e-05s`.
- Request logs contained only the product origin and the disclosed GitHub
  Releases API; no analytics, trackers, receipt uploads, or other third-party
  runtime request occurred. Local OCR/manual intake claims likewise assert no
  external receipt request.
- Live root and asset headers include HSTS, `nosniff`, strict-origin referrer
  policy, restrictive permissions policy, CSP `frame-ancestors 'none'`, and
  `X-Frame-Options: DENY`. Hashed JS is
  `Cache-Control: public, max-age=31536000, immutable`; an unknown route is a
  real HTTP 404; Privacy and Terms return 200.
- Local/live SHA-256 pairs are identical for `index.html`
  (`fdcc7f…b059`), `main-CEGUsQuF.js` (`a41687…92e7`), and
  `styles-DM7INdxG.css` (`c04b87…d243`).
- The release gate passes for actual target `50e6888…`: public `v0.1.3`, hosted
  checkout 303 then Dodo 200, all manifest assets/checksums valid, true 404,
  immutable caching, and 30 license verifications followed by HTTP 429 with
  `Retry-After: 4`. The documented observed allowance is therefore **30 per
  service window**.

## Required next step

Publish/tag a release whose target is
`fbd685d4e11121bfee033b5897e750c51a63155c` and re-run the exact
`verify:live-release` command. No product-behaviour defect was found in this
verification.
