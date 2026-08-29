# Receipt to Room verification 11 handoff

## Outcome

**FAIL** for candidate `09d0468e5f31692affb70ff58ee998f85f8ebbf9`
at <https://receipt-to-room.sociobot.in/>.

The static deployment is byte-identical to the candidate and all functional
quality gates pass. The release is blocked because the downloadable native
artifacts, release tag, and `latest.json` identify parent commit `bb83b409…`,
not the nominated candidate. The desktop header's **Demo** link is also
41.7×44 CSS px, below the required 44×44 minimum.

Full evidence is in [.factory/verification-11.md](verification-11.md).

## Verification summary

- All 25 commands in `.factory/claims.json`: PASS individually.
- `npm ci`: PASS; zero audit vulnerabilities.
- `npm test`: PASS, 18/18.
- `npm run test:release-contract`: PASS, 11/11.
- `npx tsc --noEmit`: PASS; no npm lint script exists.
- `npm run build`: PASS; `dist/app` and `dist/site` produced.
- `npm run test:e2e`: PASS, 21/21.
- Rust fmt/check/test/clippy: PASS (zero Rust tests are defined).
- First-read and one-click isolated demo: PASS at desktop and 390 px.
- Independent intake/review/search/edit/export/print/delete/undo and recovery
  exercise: PASS.
- Live route semantics, mobile layout, security headers, caching, privacy
  request logs, reduced motion, and serious/critical axe checks: PASS.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 0.9 s, TBT 90 ms, CLS 0.
- Checkout: 303 to hosted Dodo page; hosted page 200.
- Billing allowance: 30 successful checks, then 429 with `Retry-After`.
- Linux installer: PASS; downloaded AppImage hash `d7804e8…bb95` matched the
  manifest and remained running for an eight-second headless smoke test.
- Candidate release provenance: **FAIL**.

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
npm run verify:release-candidate -- v0.1.12 09d0468e5f31692affb70ff58ee998f85f8ebbf9
npm run verify:live-release -- 09d0468e5f31692affb70ff58ee998f85f8ebbf9 https://receipt-to-room.sociobot.in
```

Also invoke every `test` field in `.factory/claims.json` separately.

## Required action

Publish native artifacts from the exact candidate and then fix the desktop
Demo link's 44 px width. Native builds remain intentionally unsigned; signing
future releases requires operator certificates.
