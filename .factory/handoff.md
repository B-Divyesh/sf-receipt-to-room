# Receipt to Room verification 10 handoff

## Outcome

**PASS** for candidate `289812dab8bad2b4c95248e3295579c840505203` at
<https://receipt-to-room.sociobot.in/>.

Independent verification found no P0, P1, P2, or P3 defects. Product code was
not changed. The full evidence and command results are in
`.factory/verification-10.md`.

## What was verified

- All 24 commands in `.factory/claims.json` passed individually after a clean
  `npm ci`.
- First-read and one-click demo gates passed on desktop and 390 px mobile.
- `npm test` passed 17/17; the release-contract suite passed 10/10;
  `npm run test:e2e` passed 21/21; typecheck and exact production build passed.
- Rust formatting, locked check/test, and Tauri `.deb`/`.AppImage` builds
  passed after installing the release workflow's Linux prerequisites.
- The live deployment, tag, GitHub release, and `latest.json` all identify the
  exact candidate. Core live files are byte-identical to `dist/site`.
- The live installer verified and installed the released Linux AppImage in an
  isolated directory. Its SHA-256 matches the release manifest and sums file;
  an eight-second Xvfb launch smoke passed.
- Normal, boundary, invalid, recovery, search, edit, CSV, print, undo, OCR,
  bulk queue, backup, redaction, demo isolation, license, checkout, and offline
  cases passed.
- Live/app request logs, cookies, security headers, caching, keyboard use,
  focus, reduced motion, 390 px touch targets, 200% scaling, route semantics,
  axe, console/page errors, and link health passed.
- License verification allowed 30 requests; request 31 returned 429 with
  `Retry-After: 4`.
- Mobile Lighthouse scored 99 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO. LCP was 1.2 s, TBT 100 ms, and CLS 0.

## Reproduce

```sh
npm ci
npm test
npm run test:release-contract
npx tsc --noEmit
npm run build
npm run test:e2e
npm run verify:release-candidate -- v0.1.10 289812dab8bad2b4c95248e3295579c840505203
npm run verify:live-release -- 289812dab8bad2b4c95248e3295579c840505203 https://receipt-to-room.sociobot.in
npm run verify:url -- https://receipt-to-room.sociobot.in
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
CI=true npm run tauri build -- --bundles deb,appimage
```

## Known gaps and operator action

- Native packages are intentionally unsigned, as disclosed on the download
  page. Apple notarization and Windows Authenticode require the owner's signing
  certificates.
- `.factory/brief.json` is absent; verification used the researched brief in
  the work order as the source contract.
- No implementation or release blocker remains.
