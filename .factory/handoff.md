# Receipt to Room repair 10 handoff

## Outcome

The two release blockers in independent verification 11 are repaired for
version `0.1.13`:

- Native artifacts, `latest.json`, and the deployed site are checked as one
  source identity. Release `v0.1.13` is made from the final repair commit.
- The desktop header's **Demo** link is exactly `44 × 44` CSS px on Home,
  Privacy, Terms, and 404 at a 1440 px viewport.

The final commit is tagged and deployed only after this handoff is committed.
No evidence-only commit is added after the tag. This prevents the parent-commit
release drift found in candidate `09d0468e5f31692affb70ff58ee998f85f8ebbf9`.

## Finding, cause, and repair

### P0 — native release did not match the nominated candidate

Reproduced before changes:

```text
npm run verify:release-candidate -- v0.1.12 09d0468e5f31692affb70ff58ee998f85f8ebbf9
Error: release tag v0.1.12 targets bb83b4096ab30d46eb04d82fdb67dea89c571ea0,
expected 09d0468e5f31692affb70ff58ee998f85f8ebbf9
```

The prior native release was made before later candidate commits. The static
site identified the later commit, but its download page still offered the
parent's binaries. Version `0.1.13` now ships from the final repair commit.

`assertPublishedCandidate` makes the GitHub release target,
`latest.json.sourceCommit`, and deployed `build-commit` one contract. The live
release gate uses it before accepting checksums, caching, checkout, and policy.
The verification-11 regression supplies each stale identity in turn and proves
that all three mismatches fail before the exact-match case passes.

### P2 — desktop Demo target was too narrow

Reproduced before changes in Chromium at `1440 × 900`: `41.6875 × 44` CSS px.
The shared desktop navigation rule now sets both dimensions to at least 44 px.
After the repair, Chromium measured `44 × 44` on `/`, `/privacy/`, `/terms/`,
and `/404.html`.

The browser regression visits all four routes at 1440 px and applies the same
bounding-box assertion used by the existing 390 px touch-target audit.

## Preserved product contract

The receipt workflow, local OCR, per-line review, search, editing, redacted
spreadsheet and print output, undo, backup restore, demo isolation, free limit,
paid-version behavior, legal pages, and botanical field-guide design are
unchanged. The researched behavior in the existing claims, demo, design, and
copy-audit documents remains the source of truth. No AI feature was added; the
local receipt workflow does not need a remote model.

## Local verification

Run from the final source tree with Node 22, Playwright 1.58.2, Rust stable,
and the Linux packages listed in `.github/workflows/release.yml`:

- `npm ci`: passed; 84 packages, zero audit vulnerabilities.
- `npm test`: passed; 19/19 unit and release-contract tests.
- `npm run test:release-contract`: passed; 12/12.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; produced `dist/app` and `dist/site`.
- `npm run test:e2e`: passed; 22/22.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed; zero
  Rust unit/doc tests are defined.
- `cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings`:
  passed with no warnings.
- Every command in `.factory/claims.json`: 25/25 passed individually.

The E2E run covers desktop and 390 px layouts, keyboard focus and activation,
serious/critical Axe checks, demo/real storage separation, no-tracking request
logs, offline typed receipt work, license cache and revocation, malformed input
recovery, redacted exports, release failure fallback, routing, and metadata.
There is no service worker or updater in this desktop product, so PWA update
tests do not apply. Native packaging is performed only by GitHub Actions.

Production sizes remain within budget:

- Site JavaScript: 5.70 kB + 1.87 kB + 0.23 kB raw; 3.42 kB gzip total.
- Site CSS: 10.99 kB raw; 3.09 kB gzip.
- App JavaScript: 52.60 kB raw; 20.05 kB gzip total.
- App CSS: 14.87 kB raw; 4.13 kB gzip.
- Mobile hero AVIF: 27,041 bytes.

Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
100, SEO 100; FCP 1.08 s, LCP 1.44 s, TBT 0 ms, CLS 0.

## Release and deployment evidence

- Release: <https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.13>
- Static site: <https://receipt-to-room.sociobot.in/>
- Git tag `v0.1.13^{}` and `origin/main` resolve to the same final commit.
- The release target and `latest.json.sourceCommit` resolve to that commit.
- The release contains both macOS DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM,
  app archives, `SHA256SUMS`, and `latest.json`.
- The published platform downloads match `latest.json` and `SHA256SUMS`.
- The site is built with `BUILD_SOURCE_COMMIT` set to the same commit and is
  deployed to Azure Static Web App `sf-receipt-to-room` in `sociobot`.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passes.
- `npm run verify:live-release -- "$(git rev-parse v0.1.13^{})" https://receipt-to-room.sociobot.in`
  passes release/deployment identity, download hashes, checkout, 30-request
  allowance plus 429/Retry-After, immutable asset caching, and true 404.

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
npm run verify:release-candidate -- v0.1.13 "$(git rev-parse HEAD)"
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- "$(git rev-parse v0.1.13^{})" https://receipt-to-room.sociobot.in
```

Also invoke each `test` field in `.factory/claims.json` separately from a fresh
clone.

## Known gaps and operator action

No verification-11 finding remains open. Native packages are intentionally
unsigned and say so on the site. Signing future releases requires
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` in the release environment.
