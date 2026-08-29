# Receipt to Room — repair 11 handoff

## Outcome

Release blockers from independent verification commit `dc5325a` are repaired
for desktop release `v0.1.16`. The researched workflow, 25 declared claims,
local-first behavior, demo isolation, paid feature, and deployment class are
unchanged.

## Repairs

- **Native release provenance:** bumped the npm, Cargo, and Tauri versions
  together to `0.1.16`. Tag `v0.1.16` is created only from this final handoff
  commit. The release workflow builds every target from that exact SHA, writes
  it to `latest.json.sourceCommit`, and rejects release/manifest drift.
- **Keyboard focus:** both focusable install-command panels now use the shared
  3 px solid `#0b63ce` focus ring with a 4 px offset.
- **AVIF response type:** the Azure Static Web Apps configuration explicitly
  maps `.avif` to `image/avif`. The live release gate now checks the actual
  response header.

## Exact regression coverage

- `tests/release-contract.test.ts` reproduces the reported
  `5e4023b` candidate versus `7ddbd63b` release mismatch and rejects it.
- `tests/e2e/product.spec.ts` focuses both install-command panels at 390 px and
  asserts the exact focus color, style, width, and offset.
- `scripts/response-policy.mjs` rejects `application/octet-stream` for AVIF.
  The contract test checks the deployment mapping, and
  `scripts/verify-live-release.mjs` checks the served asset after deployment.

## Verification evidence

Evidence is in `.factory/repair-11-evidence/`.

- Clean `npm ci`: 84 packages, zero audit vulnerabilities.
- `npm test`: 20/20 passed.
- `npm run test:release-contract`: 13/13 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; created `dist/app` and `dist/site`.
- `npm run test:e2e`: 25/25 passed with Playwright `1.58.2`.
- Every command in `.factory/claims.json`: 25/25 passed independently.
- `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, and
  `cargo clippy --locked -- -D warnings`: passed. The thin shell has zero Rust
  unit tests; functional native UI coverage runs against the bundled app UI.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0.
- Browser coverage includes desktop and 390 px, keyboard-only navigation,
  200% text/page scale, reduced motion, offline work, demo reset/isolation,
  local OCR, edit/search/export/print/remove/undo, payment-data redaction,
  license caching/revocation, empty/error/boundary states, console errors,
  request privacy, and serious/critical axe findings.

## Release and deployment proof

Release from the final committed tree and verify it with:

```sh
npm run verify:release-candidate -- v0.1.16 "$(git rev-list -n 1 v0.1.16)"
npm run verify:live-release -- "$(git rev-list -n 1 v0.1.16)" https://receipt-to-room.sociobot.in
npm run verify:url -- https://receipt-to-room.sociobot.in | tee .factory/repair-11-evidence/verify-url-live.log
```

The live release gate verifies all `.dmg`, `.msi`, `.exe`, and `.AppImage`
assets, `SHA256SUMS`, `latest.json`, source/deployment identity, hosted checkout,
the 30-request license allowance and `429` response, immutable asset caching,
`image/avif`, and a true HTTP 404.

The static deployment command is:

```sh
BUILD_SOURCE_COMMIT="$(git rev-list -n 1 v0.1.16)" npm run build:site
/opt/fleet/lib/deploy-static.sh receipt-to-room dist/site
```

## Known gaps and operator action

- Native installers remain intentionally unsigned. Apple notarization and
  Windows Authenticode require owner certificates (`APPLE_CERTIFICATE` and
  `WINDOWS_CERT_PFX`). The landing page discloses unsigned releases.
- This desktop app does not implement an updater, so no updater manifest is
  shipped. Users install a newer release from the download page.
- `.factory/brief.json` is absent in the repository. The supplied work order
  and preserved product contract were used as scope.
