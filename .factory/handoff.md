# Receipt to Room verification 12 handoff

## Outcome

**PASS** for candidate `7683c0dc9f3b3fc17c42cfbf7067097c35af1f3b`
at <https://receipt-to-room.sociobot.in/> on 2026-08-29 UTC.

Independent verification found no open product defect. The prior
deployment-only failure is resolved: tag `v0.1.13`, GitHub release metadata,
`latest.json`, and the deployed build identity all point to the nominated
candidate. All 27 served files from the production site build were
byte-identical to the live deployment. This required verification-only commit
advances `main` afterward without changing the tested product or release.

Product code was not modified. Verification evidence and this handoff are the
only changes.

## What was verified

- Mandatory first-read passed at 1440×900 and 390×844. The first screen states
  the job, audience, first action, sample result, privacy, and price in plain
  words.
- **Try it with sample data** opens three useful records in one click, focuses
  the inventory heading, keeps a persistent demo banner, and isolates demo
  storage.
- Every test in `.factory/claims.json` passed separately: 25/25.
- Unit/release tests passed 19/19; the dedicated release contract passed 12/12;
  the full Playwright suite passed 22/22.
- TypeScript, production build, Rust format/check/test/clippy, and npm audit
  passed. No lint script exists.
- A separate mobile flow covered blank-input recovery, quantity 1000/999,
  zero and comma-formatted prices, per-line room/category/warranty fields,
  search, edit, CSV, delete/undo, and demo/real storage separation.
- Local OCR, multi-image queueing, invalid/oversized image recovery, print,
  redaction, malformed backup recovery, offline use, license cache/revocation,
  and free-limit exports passed in the claim/full suites.
- Fresh axe scans on five live routes at desktop and mobile found zero serious
  or critical findings. Keyboard focus, 44 px targets, reduced motion,
  semantics, metadata, and responsive overflow checks passed.
- Browser request logs and headers confirmed the privacy boundary, no cookies
  or tracking, strict security headers, 30-second HTML revalidation, and
  one-year immutable caching for hashed assets.
- Fresh mobile Lighthouse: Performance 91, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.5 s, LCP 1.6 s, TBT 360 ms, CLS 0.
- GitHub Actions release run `33258627451` passed all six source/build/manifest
  jobs for the candidate. Manifest-listed macOS, Windows, and Linux artifacts
  passed checksum verification.
- The isolated Linux installer verified and installed the 91,396,600-byte
  AppImage with SHA-256 `d83c84cd25d20777bc8678cb2c56d9cc97ab29a4e909ba3aae4cf21a319da04a`.
  Its extracted app stayed running for an eight-second Xvfb smoke window.
- The live paid-version service allowed 30 checks, then returned 429 on request
  31 with `Retry-After: 4`. Checkout redirected to hosted Dodo Payments.

Full evidence and exact observations are in
[verification-12.md](verification-12.md). Screenshots and the Lighthouse JSON
are in `verification-12-artifacts/`.

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
npm run verify:release-candidate -- v0.1.13 7683c0dc9f3b3fc17c42cfbf7067097c35af1f3b
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- 7683c0dc9f3b3fc17c42cfbf7067097c35af1f3b https://receipt-to-room.sociobot.in
```

Also invoke every `test` field in `.factory/claims.json` separately from a
fresh checkout. Linux Rust checks need the packages listed in the release
workflow.

## Known gaps and operator action

No product defect remains. The macOS and Windows packages are intentionally
unsigned and the download page states this. Future signing requires the
operator-owned `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.

This is a Tauri desktop app with no service worker, product backend, or sign-in
flow, so PWA, backend concurrency/health, consumer-package, and Entra checks do
not apply. `.factory/brief.json` is absent; the researched work-order brief was
used as the acceptance contract.
