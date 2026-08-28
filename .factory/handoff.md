# Repair handoff — v0.1.4

- Work order: `receipt-to-room-repair-5`
- Report commit: `0cea27421be7680d87697b35033bd604c45a1195`
- Rejected candidate: `fbd685d4e11121bfee033b5897e750c51a63155c`
- Verifier report: `.factory/verification-5.md`

## Repaired release blocker

Independent verification found one release-blocking defect: public `v0.1.3`
targeted `50e6888fc2e78ef7c4dde423ed136db82adcac51`, while the candidate under review
was `fbd685d4e11121bfee033b5897e750c51a63155c`. Product behaviour passed, but the
native release could not prove exact candidate provenance.

Version `0.1.4` fixes the root cause:

- The release workflow resolves one full source SHA before any matrix build.
  Every build and manifest job checks out that exact SHA.
- Tag pushes must match the version in `package.json`, and the tag must resolve
  to the workflow SHA. Package, Cargo, and Tauri versions must agree.
- Tauri release creation receives the source SHA through `releaseCommitish`.
- `latest.json` now records `sourceCommit` as well as version and checksums.
- The final workflow step rejects any difference among the GitHub Release
  target, `latest.json`, and the source SHA before declaring success.
- The live release gate checks both GitHub release metadata and manifest
  provenance. It still downloads and hashes every selected platform asset.
- The landing release cache namespace advanced to v2 so an earlier installer
  is not retained for one hour after this release.

`tests/release-contract.test.ts` reproduces the verifier's exact stale
`50e6888…` target against expected `fbd685d…`, requires rejection, then proves
the matching case. It separately rejects a stale manifest source SHA.

The researched brief, Tauri 2 desktop artifact, local-first product behaviour,
claims, and household-field-guide visual system are unchanged.

## Local verification evidence

All checks ran on 2026-08-28 UTC from `/work/repo`.

- `npm ci`: passed; 84 packages installed and 0 audit vulnerabilities.
- `npm test`: passed; 10/10 unit and release-contract tests.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed and emitted `dist/app` plus `dist/site`.
- `npm run test:e2e`: passed; 13/13 Chromium tests.
- Every command in `.factory/claims.json` passed independently, 1/1 each, from
  a fresh Playwright browser state.
- Browser coverage includes desktop and 390 px layouts, keyboard focus, axe,
  reduced motion, demo isolation/reset, local OCR, privacy request capture,
  offline intake/edit/export, license recovery/rate response, and downloads.
- `npm run verify:url -- http://127.0.0.1:4173`: passed with the correct title,
  `lang=en`, one main, one h1, complete alt text, no horizontal overflow, and
  zero console/page errors.
- Production-preview Lighthouse mobile: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms.
- Site output: JavaScript 5.02 kB raw / 2.13 kB gzip; CSS 10.27 kB raw /
  2.97 kB gzip; mobile hero AVIF 27,041 bytes.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed; the Rust
  crate has zero unit/doc tests.
- `CI=true npm run tauri build -- --bundles deb,appimage`: passed after adding
  the release workflow's Linux packages plus `xdg-utils` and `file`.
- Local DEB: 16,961,284 bytes; SHA-256
  `84e45f9356c052c538e119aae039bc113d7ea648aef2e7748db4535e9a37d14c`.
- Local AppImage: 91,396,600 bytes; SHA-256
  `51cb792f0ff51b030d77dfd2af6b8f9c0424a7e6b963188cb360b7cf67b3454e`.

## Release and deployment verification

The final repair commit is tagged `v0.1.4`; no documentation commit is made
after tagging. `.github/workflows/release.yml` builds unsigned macOS arm64 and
x86_64 DMGs, Windows MSI/EXE installers, Linux AppImage/DEB/RPM packages,
`SHA256SUMS`, and the commit-bound `latest.json` from that exact commit.

The static site is built from the same tagged commit and deployed to the
existing Azure Static Web App at `https://receipt-to-room.sociobot.in`. Run the
strict identity check without copying a stale SHA:

```sh
npm run verify:live-release -- "$(git rev-parse HEAD)" https://receipt-to-room.sociobot.in
npm run verify:url -- https://receipt-to-room.sociobot.in
```

The strict gate verifies exact release and manifest source identity, platform
assets and checksums, hosted checkout, the 30-request license allowance plus
429/Retry-After policy, immutable caching, and a real 404 response.

## Needs operator action

Packages are intentionally unsigned. Signing later requires owner-managed
Apple notarization and Windows Authenticode certificates. No signing secret is
stored in this repository.

## Known gaps

None release-blocking. Native signing remains unavailable until the owner
provides certificates.
