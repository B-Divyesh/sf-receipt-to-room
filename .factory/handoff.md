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

## Release and deployment procedure

The source release commit is tagged `v0.1.9`. GitHub Actions checks out that
exact tag SHA for every native target and records it in `latest.json`. The
production site is built from the same detached SHA with
`BUILD_SOURCE_COMMIT=<tag SHA>` and deployed from `dist/site` to Azure Static
Web Apps resource `sf-receipt-to-room`.

The post-release evidence commit records the immutable source SHA, workflow,
asset checksums, deployment, claims, billing, and live provenance results.

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
