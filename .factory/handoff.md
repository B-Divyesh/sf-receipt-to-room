# Receipt to Room repair 8 handoff

## Delivered

- Reproduced verification-8 before changing code. The live gate reported that
  release `v0.1.8` targeted `3f448f94d31c3b8ac7f29125dbc1703503cff6d8`
  instead of nominated candidate
  `3036d567c6291546f830e8c45d3da89ac19f08b7`.
- Bumped the desktop release coherently to `0.1.9` in npm, Cargo, the Cargo
  lockfile, and Tauri configuration.
- Added a build-time `build-commit` attestation to every static HTML entry.
  `BUILD_SOURCE_COMMIT` can bind a detached source checkout explicitly; a
  normal clean build uses `git rev-parse HEAD`.
- Extended the live provenance gate so the GitHub release target,
  `latest.json`, and deployed site must all identify one exact 40-character
  source SHA before billing, checksums, caching, and 404 checks run.
- Added regression coverage for the exact verification-8 conditions: stale
  release identity, stale deployment identity, missing deployment identity,
  and version drift.
- Preserved all previously passing receipt, demo, accessibility, privacy,
  offline, billing, export, installer, and responsive behavior.

## Local verification

- `npm ci`: passed; 84 packages, zero reported vulnerabilities.
- `npm test`: 16/16 passed, including the new verification-8 regressions.
- `npm run build`: passed; TypeScript validation is included. Output remains
  `dist/app` and `dist/site`.
- `npm run test:e2e`: 21/21 passed with Playwright 1.58.2. Coverage includes
  desktop and 390 px layouts, keyboard focus, Axe, reduced motion, privacy,
  offline behavior, demo isolation, billing fixtures, exports, route focus,
  and error recovery.
- `cargo check --manifest-path src-tauri/Cargo.toml`: passed after installing
  the Linux dependencies listed in the release workflow.
- `cargo test --manifest-path src-tauri/Cargo.toml`: passed (the Rust crate
  currently defines no unit or doc tests).
- Production size: app JavaScript 19.92 KB gzip and CSS 4.13 KB gzip; landing
  JavaScript 3.41 KB gzip and CSS 3.06 KB gzip.

## Release and deployment

- Nominated source/build SHA:
  `b6683dbeb3806c5cbc0af98ab536d98b93924b13`.
- Release: <https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.9>.
- Workflow: <https://github.com/B-Divyesh/sf-receipt-to-room/actions/runs/33237753927>
  completed successfully. Its source job and Linux, Windows, Intel macOS, and
  Apple silicon macOS build jobs all passed.
- `latest.json` records version `0.1.9` and the exact nominated SHA. The GitHub
  Release API reports the same SHA in `target_commitish`.
- Native assets include arm64 and x64 DMGs, MSI, EXE, AppImage, DEB, RPM, macOS
  app archives, `latest.json`, and `SHA256SUMS`.
- Production deployment `7fa47dcc-ad1f-44a3-8240-b1da057bbde0` succeeded on
  Azure Static Web Apps resource `sf-receipt-to-room`. Every deployed HTML
  entry reports the nominated SHA in its `build-commit` metadata.
- A fresh DEB download passed `dpkg-deb --info` and matched `SHA256SUMS` at
  `804e113b3c4c699fe8415800c0f1ec154ef40bc958af2043d871c0674c07c738`.
- The live one-line Linux installer downloaded, verified, and installed the
  AppImage in a temporary consumer directory. Its SHA-256 was
  `16249dd44efe163a09e2981fc9da158b028aff7e8699472bd06d10a36d155a29`,
  matching both `latest.json` and `SHA256SUMS`.

## Post-release verification

- Every one of the 24 `.factory/claims.json` commands passed separately with
  exactly one matching test.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passed title,
  language, one main/h1, image alternatives, 390 px width, console, and page
  error checks.
- Fresh live desktop, 390 px demo, Privacy, and Terms browser checks found no
  Axe violations, console errors, page errors, overflow, or cookies. Demo
  traffic stayed same-origin. Reduced-motion preference was honored.
- Keyboard checks reached the skip link and primary demo action with a solid
  3 px `#0B63CE` outline. Enter opened `/?demo=1#sample` and focused the demo
  workspace heading.
- Live response policy includes CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, restrictive permissions policy,
  and one-year immutable caching for hashed assets. Unknown routes return 404.
- Live billing returned 303 to `checkout.dodopayments.com`; the hosted page
  returned 200. License verification allowed 30 requests, then returned 429
  with `Retry-After: 4` on request 31.
- `npm run verify:live-release -- b6683dbeb3806c5cbc0af98ab536d98b93924b13
  https://receipt-to-room.sociobot.in` passed release/deployment identity,
  platform assets, checksums, billing, rate policy, cache, and 404 checks.
- Lighthouse mobile production scores: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 30 ms, CLS 0.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- "$(git rev-list -n 1 v0.1.9)" https://receipt-to-room.sociobot.in
```

Run every command in `.factory/claims.json` separately for the claims gate.

## Known gaps

None in the reviewed product scope.

## Needs operator action

The desktop packages remain unsigned, as disclosed on the download page.
Future signed builds need Apple and Windows certificates. The expected secret
names are `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`,
`WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
