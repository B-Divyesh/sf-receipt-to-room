# Receipt to Room repair 9 handoff

## Outcome

The verifier’s two release blockers are repaired in product source commit
`e67ad5a17140399f4c2c2000e299dacaec988f29`.

1. Native release provenance is now guarded before builders run. Version
   `0.1.10` is synchronized across the web, Tauri, Rust, and package metadata.
   `scripts/release-candidate.mjs` rejects a version tag that points at a
   parent commit rather than the nominated candidate. The tag workflow runs
   that preflight before it starts native builds.
2. Every control named in verification 9 has a 44 by 44 CSS-pixel target at
   390 px: the privacy-note link, demo-banner actions, footer links, legal
   email/return links, landing wordmark, and desktop-app wordmark.

The final release candidate is the `v0.1.10` tag created from this handoff
commit. The tag preflight, GitHub release provenance check, and static deploy
must all use that exact tag commit; no follow-up source commit is needed.

## Regression coverage

- `tests/release-contract.test.ts` uses the verifier’s exact stale parent
  `b6683dbeb3806c5cbc0af98ab536d98b93924b13` and candidate
  `b5b307b4dc38a2001f503652f0661712c5b498f9`; it proves the new guard rejects
  that mismatch and accepts an exact tag/candidate match.
- `tests/e2e/product.spec.ts` has a 390 px measurement regression covering
  every target in the report across landing, demo, privacy, terms, footer, and
  desktop app. It asserts both width and height are at least 44 pixels.

## Verification evidence

Run from a clean `npm ci` install:

- `npm ci`: PASS; 84 packages installed; 0 vulnerabilities.
- `npm test`: PASS, 17/17.
- `npm run test:release-contract`: PASS, 10/10.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; created `dist/app` and `dist/site`.
  - Site main JavaScript: 2.28 KiB gzip; stylesheet: 3.09 KiB gzip.
  - App JavaScript: 20.11 KiB gzip total; stylesheet: 4.13 KiB gzip.
- `npm run test:e2e`: PASS, 21/21. This covers desktop and 390 px mobile,
  keyboard/focus, reduced motion, demo isolation, offline intake/export,
  privacy request boundaries, paid-token handling, checkout fixture, and
  Playwright Axe checks with 0 serious/critical violations.
- `npm run verify:url -- http://127.0.0.1:4173/`: PASS; title, `lang=en`, one
  main, one h1, complete image alternatives, no 390 px overflow, and no
  console/page errors.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; 0 Rust
  unit/doc tests are defined.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
  - `Receipt to Room_0.1.10_amd64.deb` SHA-256:
    `7028d4620072393bd2944121e30f0bf6d5cab91b8b24589e63829a86336b97f1`.
  - `Receipt to Room_0.1.10_amd64.AppImage` SHA-256:
    `4c3fb02bc312512b236cc7748c3b8334bcc61c9c37809db37bf2a82d7432268b`.
  - The AppImage stayed running for eight seconds under Xvfb with
    `APPIMAGE_EXTRACT_AND_RUN=1`; only expected headless EGL warnings
    appeared. Direct AppImage mounting is unavailable in this container
    because FUSE is not exposed.

## Release and deployment

The static deployment target remains `dist/site` at
`https://receipt-to-room.sociobot.in`. The repository’s exact candidate
release sequence is:

```sh
git tag v0.1.10
npm run verify:release-candidate -- v0.1.10 "$(git rev-parse HEAD)"
git push origin main v0.1.10
CI=true npm run tauri build -- --bundles deb,appimage
/opt/fleet/lib/deploy-static.sh receipt-to-room dist/site
npm run verify:live-release -- "$(git rev-parse HEAD)" https://receipt-to-room.sociobot.in
```

The GitHub workflow builds macOS Intel/Apple silicon, Windows, and Linux,
then publishes `SHA256SUMS` and `latest.json`. The live-release command checks
the release target, manifest source commit, native asset checksums, hosted
checkout redirect, license allowance response policy, immutable cache header,
and true HTTP 404.

## Known gaps and operator action

- Native packages are intentionally unsigned, as disclosed on the download
  page. Apple and Windows signing still require the owner certificate secrets.
- No product behaviour, privacy boundary, claim, or accessibility issue remains
  open from verification 9. The absence of `.factory/brief.json` is unchanged;
  the checked-in design, claims, demo, and verifier report were used as the
  acceptance contract.
