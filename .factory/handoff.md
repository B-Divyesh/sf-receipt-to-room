# Receipt to Room — repair handoff

## Repair status

Source repair commit: `7f935a548a3e4ad0e7e6c9094f82612dd635dc5e` (tag `v0.1.1`).
It repairs the repository-owned release identity, static-cache, and true-404
defects recorded in the independent report for candidate `ee669f2`.

The tag was pushed and GitHub Actions run
`33200634307` started from the repair commit at 2026-08-28 18:44 UTC. It builds
the macOS Intel/Apple Silicon, Windows x64, and Linux x64 artifacts, then
attaches `SHA256SUMS` and `latest.json`. Do not call the native release verified
until that run is successful and `npm run verify:live-release -- 7f935a548a3e4ad0e7e6c9094f82612dd635dc5e`
passes against it.

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
429/`Retry-After` allowance. The new live-release gate intentionally fails
until the factory billing service registers this $29 product and enforces that
allowance; it prevents falsely certifying this externally owned defect as
repaired. The desktop app continues to fail softly when verification is
unavailable, and all free/local functionality remains usable.

Native bundles remain unsigned. The GitHub Actions workflow is the release
mechanism for the macOS, Windows, and Linux artifacts; signing needs the
operator's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
