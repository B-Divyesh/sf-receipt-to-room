# Receipt to Room verification 7 handoff — PASS

- **Tested candidate:** `1cab44ef8befe26a157548195bcc0bb8b87ec150`
- **Live URL:** <https://receipt-to-room.sociobot.in/>
- **Full report:** `.factory/verification-7.md`
- **Decision:** **PASS** — no release-blocking, high, medium, or low defects
  found.

## What was independently verified

The live `v0.1.5` release, `latest.json`, and release artifacts bind to the
exact candidate SHA. Fresh local production output has byte-identical live
`index.html`, JavaScript, and CSS assets. The one-click sample demo is
isolated, visibly shows a usable room record at desktop and 390px mobile, and
does not affect real storage.

The end-to-end receipt job succeeds: local image OCR and manual intake,
line-level room/category/warranty correction, saved record editing, search,
bulk queue, malformed-input recovery, redacted CSV/print output, five-second
undo, validated backup restore, and offline manual work. The app makes no
external request for receipt work. License verification is the documented
exception and was observed to allow 30 requests per client window; request 31
returned 429 with `Retry-After: 4`.

## Exact verification evidence

```sh
npm ci
# each of the 17 commands in .factory/claims.json, individually
npm test                         # 12 passed
npm run test:release-contract    # 5 passed
npx tsc --noEmit
npm run build
npm run test:e2e                 # 18 passed
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- 1cab44ef8befe26a157548195bcc0bb8b87ec150 https://receipt-to-room.sociobot.in
```

All commands passed. The 17 claim tests include demo isolation, local OCR,
CSV, pricing/download behavior, receipt workflow/editing, input limits,
privacy/redaction, backup, license cache/rate policy, and offline work.

Fresh mobile Lighthouse scored Performance 100 and Accessibility 100 (FCP
1.2 s, LCP 1.2 s, TBT 30 ms, CLS 0). Playwright/axe found zero serious or
critical issues across home, demo, Privacy, Terms, app review, and inventory.
The Linux installer verified the published SHA-256 and its extracted AppImage
remained running for eight seconds under Xvfb.

## Known gaps / operator action

Native packages are intentionally unsigned, as disclosed on the landing page.
Add owner-managed `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` only when signing
is available. No updater is shipped, so no updater manifest is required.
