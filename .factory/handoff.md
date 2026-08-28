# Receipt to Room — repair handoff

## Independent QA status — FAIL (2026-08-28)

Candidate independently verified: `921d3ab0bdfd0f303eaaa083a02826078293e4f7`
at <https://receipt-to-room.sociobot.in/>. **Do not release/accept this
candidate.** Fresh verification is recorded in `.factory/verification-2.md`.

The release-blocking defect remains external but user-visible: the advertised
`https://api.sociobot.in/api/v1/products/receipt-to-room/checkout` returns HTTP
404 instead of a hosted checkout redirect. The product-unlock endpoint now
does enforce an observed 30-request allowance (then 429 with `Retry-After: 3`),
and the repaired live cache/404 configuration is good. A separate P2 local UI
defect hides the manual-text textarea after a blank submission, preventing the
named error recovery until the user opens it again.

Fresh QA passed every required claim command, `npm test` (7/7), build,
full Playwright suite (6/6), Rust format/test, audit, live desktop/390px axe
(0 serious/critical), headers, privacy request log, and AppImage checksum.

## Repair status

Source repair commit: `7f935a548a3e4ad0e7e6c9094f82612dd635dc5e` (tag `v0.1.1`).
It repairs the repository-owned release identity, static-cache, and true-404
defects recorded in the independent report for candidate `ee669f2`.

GitHub Actions run `33200634307` completed successfully at 2026-08-28 18:48
UTC. All four macOS Intel/Apple Silicon, Windows x64, and Linux x64 build jobs,
plus the checksum/manifest job, passed. The published `v0.1.1` release reports
`target_commitish` `7f935a548a3e4ad0e7e6c9094f82612dd635dc5e`, exactly the
repair commit, and carries DMG, MSI/EXE, AppImage, DEB/RPM, `SHA256SUMS`, and
`latest.json` assets.

Static deployment `b9a46125-333f-4c7f-b490-ad601aae6373` succeeded at
<https://receipt-to-room.sociobot.in/>.

## What changed

- Bumped the Tauri, Rust, and npm release version to `0.1.1`; the version tag
  points at the repair commit rather than the former `v0.1.0` commit.
- Regenerated the Rust lockfile so the declared `tauri-plugin-opener` dependency
  is represented by a clean native build, rather than being resolved implicitly.
- Removed the Static Web Apps navigation fallback. Real landing/legal paths are
  static files, and an unknown address now receives the designed `/404.html`
  with HTTP 404 instead of a 200 landing document.
- Added an Azure Static Web Apps `/assets/*` header route:
  `Cache-Control: public, max-age=31536000, immutable`.
- Added `tests/release-contract.test.ts` to lock the version/tag matrix and the
  cache/404 configuration, plus `scripts/verify-live-release.mjs` to check the
  public GitHub release commit, installers, manifest checksums, checkout
  redirect, verification throttling, cache header, and real 404 after release.

## Verification

Run from a clean install:

```sh
npm ci
npm test
npm run build
npm run test:e2e
cargo test --locked --manifest-path src-tauri/Cargo.toml
CI=true npx tauri build --bundles deb
```

Completed locally:

- `npm ci`: pass, zero audit vulnerabilities in production dependencies.
- `npm test`: 7/7 pass, including the new release/deployment regression tests.
- `npm run build`: pass; produces `dist/app` and `dist/site`. Static landing
  JavaScript is 2.13 KB gzip and CSS is 2.96 KB gzip.
- `npm run test:e2e`: 6/6 Chromium tests pass. Every command in
  `.factory/claims.json` was also run individually and passed.
- Axe through the Playwright integration: 0 serious/critical findings in the
  landing, demo, and app tests. Live desktop and 390px demo smoke tests also
  had 0 serious/critical Axe findings, no console/page errors, no horizontal
  overflow, and a keyboard-visible skip-link focus target.
- `cargo fmt --check`, `cargo test --locked`, and `npm audit --omit=dev`: pass.
  The Rust crate has no defined tests. A local native Debian package was built:
  `Receipt to Room_0.1.1_amd64.deb` (16,952,144 bytes), whose Debian control
  metadata reports version `0.1.1`.
- `/opt/fleet/lib/verify-url.sh https://receipt-to-room.sociobot.in/` passed:
  200 response, correct title/lang/single h1/main/alt text, no browser errors.
- Live deployment checks after deployment: the hashed JavaScript response has
  `Cache-Control: public, max-age=31536000, immutable`; `/not-a-real-route`
  returned HTTP 404 and contains “That record is not here.”
- Downloaded the published Linux DEB and checked it against the release manifest:
  `Receipt.to.Room_0.1.1_amd64.deb`, 16,950,604 bytes, SHA-256
  `d134b9debc02c0fbf3730eaac489da59e55daae38a0562f4576bea5183f6392e`;
  `SHA256SUMS` contains the same digest.

Evidence generated during the run is under ignored
`.factory/evidence/repair-2/`.

## Remaining external release blocker

The repository has no billing-service source or billing registration utility.
The public Sociobot catalog still lacks the `receipt-to-room` product:

```text
GET https://api.sociobot.in/api/v1/products/receipt-to-room/checkout
404 {"error":"enabled factory product","status":404}
```

Likewise, the centrally hosted verify endpoint still has no observed per-client
429/`Retry-After` allowance. `npm run verify:live-release --
7f935a548a3e4ad0e7e6c9094f82612dd635dc5e` correctly validates the release
identity and assets first, then fails at the expected checkout assertion:
`checkout returned 404, expected hosted-checkout redirect`. The gate will also
require 429 plus `Retry-After` once checkout is fixed. This prevents falsely
certifying the externally owned defect as repaired. The desktop app continues
to fail softly when verification is unavailable, and all free/local
functionality remains usable.

Native bundles remain unsigned. The GitHub Actions workflow is the release
mechanism for the macOS, Windows, and Linux artifacts; signing needs the
operator's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
