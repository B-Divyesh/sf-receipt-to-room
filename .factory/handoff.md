# Receipt to Room — verification 13 handoff

## Outcome

**FAIL** on 2026-08-29 UTC for candidate
`5e4023b748d08f478c8be2c474546dc34c07dca4` at
<https://receipt-to-room.sociobot.in/>.

The website and product workflow pass, and the live static build matches the
candidate. Release acceptance fails because the native `v0.1.15` release,
tag, and `latest.json` identify parent
`7ddbd63b0ac262d1f4afcd0292e18beaaca858c9`, not the nominated candidate.
There is no tag or release workflow run for `5e4023b...`.

No product code was changed. The full report is
[`.factory/verification-13.md`](verification-13.md).

## Defects

- **P0:** native release provenance does not match the nominated candidate.
- **P2:** the two focusable install-command panels use an unstyled 1 px browser
  outline instead of the designed 3 px focus treatment.
- **P3:** live AVIF assets are served as `application/octet-stream`, not
  `image/avif`.

## Verification summary

- Every `.factory/claims.json` command: **25/25 PASS**, run separately after
  clean `npm ci`.
- Cold first-read at desktop and 390 px: **PASS**; the first screen states the
  job, audience, first action, and sample result. One click opens three sample
  records in an isolated demo.
- `npm test`: **19/19 PASS**.
- `npm run test:release-contract`: **12/12 PASS**.
- `npx tsc --noEmit`: **PASS**; no separate npm lint script exists.
- `npm run build`: **PASS**, with `dist/app` and `dist/site`.
- `npm run test:e2e`: **24/24 PASS**.
- Rust format/check/test/clippy with the release workflow's Linux libraries:
  **PASS**.
- Independent mobile intake, error recovery, quantity boundaries, line-level
  classification, warranty, search, edit, CSV, remove/undo, storage isolation,
  request logging, and keyboard flow: **PASS**.
- Desktop/390 px live route sweep: zero serious/critical axe findings,
  console/page/request errors, cookies, or overflow. Reduced motion and 200%
  page scale retain the task.
- Lighthouse mobile: **99 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO**; LCP 1.1 s, TBT 150 ms, CLS 0.
- Live privacy: only the documented GitHub API request leaves the website;
  direct demo and app workflow are same-origin only.
- Paid service: checkout 303 to Dodo; hosted page 200; requests 1–30 allowed;
  request 31 is 429 with `Retry-After: 4`.
- Parent release AppImage: checksum matches manifest and `SHA256SUMS`; public
  installer succeeds; extracted app stays alive for the smoke window.
- Exact provenance commands for `5e4023b...`: **FAIL**.

Evidence is under `.factory/evidence-13/`.

## Reproduce

```sh
npm ci
npm test
npm run test:release-contract
npx tsc --noEmit
npm run build
npm run test:e2e
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:release-candidate -- v0.1.15 5e4023b748d08f478c8be2c474546dc34c07dca4
npm run verify:live-release -- 5e4023b748d08f478c8be2c474546dc34c07dca4 https://receipt-to-room.sociobot.in
```

The final two commands reproduce the release blocker.

## Operator action

Publish/tag the exact nominated candidate, or nominate the already released
parent SHA. Native bundles remain intentionally unsigned; signing still needs
the owner's Apple notarization and Windows Authenticode credentials if desired.
