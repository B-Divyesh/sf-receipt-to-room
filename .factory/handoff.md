# Receipt to Room — verification 15 handoff

## Outcome

**PASS — accept candidate `f5092e1079b93143ad64bfdeb0d013219771d65a`.**

Verified 2026-08-29 against `https://receipt-to-room.sociobot.in`. The live
deployment, GitHub release `v0.1.17`, tag, manifest, and release workflow all
identify the tested candidate. No P0, P1, P2, or P3 defect was found. The prior
mobile performance failure is resolved.

## Evidence

- Cold first screen plainly says what the product does, who it serves, and to
  click **Try it with sample data**. One click shows three isolated records.
- After `npm ci`, all 25 exact `.factory/claims.json` commands passed.
- `npm test`: 21/21 passed; `npm run test:e2e`: 26/26 passed.
- TypeScript, production build, Cargo format/check/test, and Clippy passed.
- Desktop and 390 px browser audits found no overflow, undersized visible touch
  targets, application console/page errors, or Axe violations. The intentional
  404 produced only Chromium's expected failed-document line. Keyboard and
  reduced-motion behavior passed.
- Three live mobile Lighthouse runs scored 99/98/100 Performance and 100
  Accessibility, with LCP 1.06–1.17 s, CLS 0, and ~106.7 KB transfer.
- Direct demo requests were same-origin only, with no cookies and only a
  demo-prefixed storage write. Security and cache headers passed.
- All 43 public build files match production byte-for-byte.
- The release gate verified every manifest checksum, Dodo-hosted checkout,
  immutable caching, AVIF MIME type, and a true 404.
- The live Linux installer verified SHA-256 and its extracted AppImage payload
  passed a 12-second Xvfb launch smoke test.
- License verification allows 30 requests per client; request 31 returned 429
  with `Retry-After: 4`.

Detailed results and commands are in `.factory/verification-15.md`. Raw browser
and Lighthouse evidence is in `.factory/evidence-15/`.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
npx tsc --noEmit
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings
npm run verify:release-candidate -- v0.1.17 f5092e1079b93143ad64bfdeb0d013219771d65a
npm run verify:live-release -- f5092e1079b93143ad64bfdeb0d013219771d65a https://receipt-to-room.sociobot.in
npm run verify:url -- https://receipt-to-room.sociobot.in
```

Linux Cargo commands require the Tauri 2 system packages documented in the
README prerequisite link.

## Known gaps and operator action

- Native installers are intentionally unsigned and this is disclosed. Signing
  requires operator-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
- The Tauri shell has no Rust unit tests; its behavior is covered by the 26
  browser integration tests and the native package smoke test.
- `.factory/brief.json` is absent. Verification used the researched brief in
  work order `receipt-to-room-verify-15` plus `.factory/design.md`.
