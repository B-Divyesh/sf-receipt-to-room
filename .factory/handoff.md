# Independent verification 6 handoff — FAIL

- Work order: `receipt-to-room-verify-6`
- Candidate: `924655711c2fd45c1859bc4932b6fbd3755de7cd`
- Live URL: <https://receipt-to-room.sociobot.in/>
- Detailed report: `.factory/verification-6.md`
- Verdict: **FAIL**

## Why it fails

The previous deployment-only blocker is fixed: public `v0.1.4`,
`latest.json`, the GitHub Actions run, and live static bytes all bind to the
exact candidate. The product nevertheless has three release blockers:

1. After **Try it with sample data**, no sample record is visible in the next
   desktop or 390 px screen; the demo is a landing preview rather than an
   isolated in-app project capable of exercising every claim.
2. A multi-line receipt has only one room, category, and warranty control, so
   mixed-room purchases are all saved to the same room and cannot be corrected
   after saving.
3. The required claims inventory is incomplete. In particular, “Everything
   remains editable” is unlisted and false, while “All future v1 updates” is an
   unlisted, unprovable paid promise.

P2 defects: malformed JSON restore persists corrupt inventory and throws;
`#inventory` is ignored on first load/reload; mobile screen changes retain
off-screen scroll and lose focus; common US dates and grouped/integer prices
are misparsed; two mobile first-screen targets are smaller than 44×44 px.

## Verification summary

- All 11 commands in `.factory/claims.json`: PASS individually.
- `npm ci`: PASS, 0 vulnerabilities.
- `npm test`: PASS, 10/10.
- `npm run test:release-contract`: PASS, 5/5.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/app` and `dist/site` produced.
- `npm run test:e2e`: PASS, 13/13.
- Rust format/check/test: PASS (the Rust crate has zero tests).
- Native Tauri DEB + AppImage production build: PASS; both native and
  extracted-AppImage smoke tests stayed alive under Xvfb.
- Live URL verifier: PASS.
- Strict live release/provenance/checksum/checkout/cache/404 gate: PASS.
- License service: 30 requests allowed; request 31 returned 429 with
  `Retry-After: 4`.
- Isolated live Linux installer: PASS with published SHA-256.
- Live and app axe serious/critical findings: 0.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.1 s, TBT 120 ms, CLS 0.
- Privacy request logs: only product origin plus the disclosed GitHub release
  API on the site; no external request during local receipt work.

## How to reproduce

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
CI=true npm run tauri build -- --bundles deb,appimage
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- 924655711c2fd45c1859bc4932b6fbd3755de7cd https://receipt-to-room.sociobot.in
```

## Needs operator action

Do not promote this candidate. Repair the P1 items above and issue a new
candidate for independent verification. Native packages remain intentionally
unsigned until owner-managed Apple and Windows signing certificates exist.
