# Independent verification 8 — FAIL

**Candidate:** `3036d567c6291546f830e8c45d3da89ac19f08b7`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-29 (UTC)  
**Verdict:** **FAIL — the public deployment and downloadable desktop release are not the candidate.**

## Release-blocking finding

### P0-1 — Public release provenance is stale

`npm run verify:live-release -- 3036d567c6291546f830e8c45d3da89ac19f08b7 https://receipt-to-room.sociobot.in`
failed before any product assertions with:

```
release targets 3f448f94d31c3b8ac7f29125dbc1703503cff6d8,
expected 3036d567c6291546f830e8c45d3da89ac19f08b7
```

Fresh GitHub Releases API evidence agrees: latest release is `v0.1.8`, its
`target_commitish` is `3f448f94d31c3b8ac7f29125dbc1703503cff6d8`, and
`latest.json` has the same `sourceCommit`. The current candidate differs from
that tag by repository documentation, but this does not satisfy the required
exact candidate/deployment identity gate. Do not accept or promote this
candidate until a release and deployment are built from the requested SHA (or a
new explicitly nominated candidate SHA).

## First-read result

Cold visit to the live landing page passed the plain-words/demo threshold. It
says **“Turn receipts into room records.”**, identifies **“renters and
homeowners”** who need purchase details after a move, repair, or insurance
question, and presents **“Try it with sample data”** with **“See three demo
records right away.”** as its first action. Activating it opens
`/?demo=1#sample` and shows the demo workspace.

## Claims gate — PASS

`.factory/claims.json` exists and has 24 entries. From the clean candidate
checkout, after `npm ci`, every declared command was run separately and passed:

| Claim IDs | Result |
| --- | --- |
| `sample-demo`, `local-ocr`, `csv-export`, `price`, `release-api`, `receipt-workflow`, `editable-records`, `bulk-queue`, `image-input`, `print-undo`, `local-storage`, `backup-restore`, `redacted-exports`, `privacy-boundaries`, `license-cache`, `license-rate-policy`, `offline-work`, `checkout-operator`, `free-exports`, `refund-revocation` | Each `npm run test:e2e -- --grep @claim:<id>` passed (one Playwright test). |
| `scope-boundaries`, `release-trigger`, `release-artifacts`, `installer-integrity` | Each declared `npm run test:release-contract -- -t @claim:<id>` passed (one Vitest test). |

## Local candidate checks — PASS except native check noted below

- `npm ci`: passed, 84 packages installed; audit reported zero vulnerabilities.
- `npm test`: **14/14** passed.
- `npm run build`: passed; includes `tsc --noEmit` and produced `dist/app` and
  `dist/site`.
- `npm run test:e2e`: **21/21** passed; Playwright run record reports
  `status: "passed"` and no failed tests.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed after installing
  the workflow's Linux GUI build dependencies.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed (0 Rust unit tests
  and 0 doc tests are defined).
- No lint script is defined in `package.json`.
- Initial first-load app output is 19.92 KB gzip JavaScript and 4.13 KB gzip
  CSS; the landing modules total 3.41 KB gzip JavaScript and 3.06 KB gzip CSS.
  These are within the stated static-product budgets.

## Independent behavior checks — PASS

- Representative and recovery flows are covered by the passing isolated E2E
  claims: manual and OCR receipt intake, per-line room/category/warranty
  review, edit/search, CSV and printable redacted exports, bulk queueing,
  invalid/oversize image recovery, malformed backup rejection, undo deletion,
  offline manual work, checkout, revocation, and free-limit behavior.
- Fresh direct live demo has title `Demo — Receipt to Room`, a visible demo
  banner, and only `demo:receipt-to-room:sample:v1` in storage. Its request log
  is same-origin only and it sets no cookies. Normal landing makes no telemetry
  request or cookie; its only cross-origin request is the declared functional
  GitHub Releases API lookup for downloads.
- Keyboard smoke test at 390 px reached the skip link and all primary links;
  the primary action has a visible 3 px `#0B63CE` focus outline and Enter
  opens/focuses the sample workspace. The reduced-motion context matched.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passed: title,
  `lang=en`, one `main`, one `h1`, image alt coverage, no 390 px horizontal
  overflow, and zero console/page errors.
- Axe on desktop landing, 390 px demo, Privacy, and Terms found **zero**
  violations, including zero serious/critical findings.
- All discovered same-origin landing links returned 200. Unknown route returns
  404. Response headers include CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, restrictive permissions policy, and
  immutable one-year caching for hashed assets.
- Live checkout returned 303 to `checkout.dodopayments.com` and that hosted
  page returned 200.
- Live license verification allowance was independently observed as **30**:
  requests 1–30 returned 200; request 31 returned **429** with
  `Retry-After: 4`.
- Current (stale) `v0.1.8` Linux AppImage was downloaded and its SHA-256
  (`27919674d054a1fc87105c42c47c43b99b90fa80b92df18271422aeb207e77a6`)
  matches both current `latest.json` and `SHA256SUMS`.

## Remaining action

Publish a release from `3036d567c6291546f830e8c45d3da89ac19f08b7` (or have
the factory nominate the commit actually released), deploy it, then rerun the
live-provenance gate. No code defect was found in the locally tested candidate;
the exact artifact identity failure remains release-blocking.
