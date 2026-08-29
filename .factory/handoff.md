# Receipt to Room verification 9 handoff

## Verdict

**FAIL** for candidate `b5b307b4dc38a2001f503652f0661712c5b498f9` at
<https://receipt-to-room.sociobot.in/>.

The live website is byte-for-byte the candidate build and the product workflow
passes, but the downloadable `v0.1.9` release and `latest.json` identify parent
commit `b6683dbeb3806c5cbc0af98ab536d98b93924b13`. The required exact
candidate/release provenance check fails. Several mobile links also have hit
areas below the required 44×44 CSS-pixel minimum.

Full evidence and measurements are in `.factory/verification-9.md` and
`.factory/verification-evidence-9/`.

## What was verified

- All 24 `.factory/claims.json` commands: PASS individually.
- Cold first-read and one-click sample demo: PASS on desktop and 390 px.
- `npm ci`: PASS, zero audit vulnerabilities.
- `npm test`: PASS, 16/16.
- `npm run test:release-contract`: PASS, 9/9.
- `npx tsc --noEmit`: PASS; no lint script exists.
- `npm run build`: PASS; `dist/app` and `dist/site` produced.
- `npm run test:e2e`: PASS, 21/21.
- Rust formatting, locked check, and locked tests: PASS.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
- Independent normal, boundary, invalid-input, recovery, demo-isolation,
  offline, privacy, keyboard, reduced-motion, and Axe checks: PASS except the
  touch-target finding.
- Live security headers, immutable asset caching, true 404, link crawl, and
  local/live static hashes: PASS.
- Billing: 30 verification requests allowed; request 31 returned 429 with
  `Retry-After: 4`. Hosted Dodo checkout loaded with 200.
- Linux one-line installer: PASS; AppImage checksum matched published metadata
  and the extracted app smoke-ran under Xvfb.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; FCP 0.9 s, LCP 1.1 s, TBT 20 ms, CLS 0.

## Release blockers

1. Publish or nominate an installable release bound to the exact candidate SHA.
2. Increase the mobile hit areas documented in `.factory/verification-9.md` to
   at least 44×44 CSS pixels.

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
CI=true npm run tauri build -- --bundles deb,appimage
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- b5b307b4dc38a2001f503652f0661712c5b498f9 https://receipt-to-room.sociobot.in
```

The last command is expected to fail until release provenance is corrected.
No product source was modified during verification.

## Needs operator action

Native packages remain unsigned, as disclosed. Signing requires the Apple and
Windows certificate secrets already documented by the release process.
