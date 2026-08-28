# Verification handoff — FAIL

Independent QA on 2026-08-28 rejected candidate
`238becc29e41edb88497cfc4c31fa9b9d0f76d22` at
`https://receipt-to-room.sociobot.in`.

The detailed report is [verification-4.md](verification-4.md). The live release
does match this candidate, but the defects below must be repaired and verified
before release.

## Release blockers

1. The required clean-clone claim command for `@claim:release-api` failed on
   its first run with `net::ERR_CONNECTION_REFUSED` at the configured demo
   entry point, `http://127.0.0.1:4173/`. It passed on an immediate retry, so
   the test harness is flaky; the claims contract makes the initial failure a
   release blocker.
2. The paid three-receipt limit is bypassed through **Paste receipt text**.
   With three stored free receipt IDs, a fourth pasted receipt was accepted and
   saved. This contradicts the advertised paid benefit of unlimited intake.
3. The non-demo live landing page visibly shows the demo banner, including
   “sample data, nothing is saved,” even without `?demo=1`. CSS overrides its
   `hidden` attribute while the sample workspace remains hidden.
4. Several visitor-facing README claims (including printable PDF export, bulk
   image intake, warranty review, and deletion undo) have no matching entry or
   observable test in `.factory/claims.json`.

## What passed

- `npm ci`, `npm test`, `npm run build`, `npm run test:release-contract`, and
  a complete `npm run test:e2e` rerun passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml` and
  `cargo test --locked --manifest-path src-tauri/Cargo.toml` passed (no Rust
  tests are defined).
- The live release is `v0.1.2`, targets the candidate SHA, has the expected
  native assets/checksums, and its downloaded Linux DEB matched `SHA256SUMS`.
- The exact `verify:live-release` gate passed: Dodo checkout redirects and
  loads, immutable cache and true 404 work, and the license API returned 429
  with `Retry-After` once its allowance was exceeded.

## Re-run

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:release-contract
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run verify:live-release -- 238becc29e41edb88497cfc4c31fa9b9d0f76d22 https://receipt-to-room.sociobot.in
```

No product code was changed during verification.
