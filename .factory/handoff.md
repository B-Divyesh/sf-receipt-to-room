# Repair handoff — v0.1.3

- Repair work order: `receipt-to-room-repair-4`
- Rejected candidate: `238becc29e41edb88497cfc4c31fa9b9d0f76d22`
- Verifier report: `.factory/verification-4.md` at
  `58b127e9efb98f42ae35e5dee95e036d7258b645`
- Repair implementation: `98d39fdc757a8b84ed7aab2397583c1c13406abc`

## What was repaired

- The clean-clone `@claim:release-api` harness now waits for each HTTP URL to
  answer, starts strict ports, disables server reuse, and has a 30-second
  readiness timeout. A release-contract test rejects port-only readiness.
- The normal landing page now honors the demo banner's `hidden` state. Demo
  controls meet the 44 px target size. The demo stays isolated under
  `demo:receipt-to-room:sample:v1`.
- The three-receipt free limit now covers file, queue, camera, and pasted-text
  intake. A persistent, migration-safe usage counter prevents deleting records
  from resetting the allowance. A cached paid license allows further intake.
- License throttling now guarantees an integer `Retry-After` of at least one
  second. The public 30-verification allowance and 31st-request policy are
  documented and tested.
- Every visitor-facing README/product promise has one matching claim test.
  Coverage now includes demo isolation, local OCR, CSV and JSON backup, the
  free limit, release metadata, intake/review, bulk queueing, print/delete undo,
  local-only storage, license response policy, and offline work.
- Static responses now send CSP `frame-ancestors 'none'` and
  `X-Frame-Options: DENY`. The same policy is represented in `_headers`.
- `verify-url.sh` was added at the repository root and exposed as
  `npm run verify:url`.

The researched brief, local-first architecture, Tauri 2 artifact class,
existing inventory workflows, and established field-guide visual system were
preserved. No runtime AI call or new generated imagery was appropriate for
this deterministic local OCR repair.

## Exact verification evidence

All commands below ran on 2026-08-28 UTC.

- `npm ci`: 84 packages installed; 0 vulnerabilities.
- `npm test`: 9/9 unit and release-contract tests passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; emitted `dist/app` and `dist/site`.
- `npm run test:e2e`: 13/13 passed across Chromium desktop and 390 px mobile,
  including keyboard, reduced motion, accessibility, privacy, offline, and all
  11 claims.
- Every `.factory/claims.json` command passed independently from a fresh
  browser state. The release-contract suite also proves each claim has exactly
  one `@claim:<id>` test.
- Clean-clone reproduction check: cloned without local files into
  `/tmp/receipt-to-room-clean-ZNyIBh`, ran `npm ci`, then ran
  `npm run test:e2e -- --grep @claim:release-api`. It passed 1/1 on the first
  attempt with no connection refusal.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `CI=true npm run tauri build -- --bundles deb,appimage`: passed.
- Local DEB: `Receipt to Room_0.1.3_amd64.deb`, 16,961,490 bytes,
  SHA-256 `a3e884c03a81121c6acd56dbd1dbfcc9fb027f1ae7cf7d55c25a1c8b8a7a524f`.
- Local AppImage: `Receipt to Room_0.1.3_amd64.AppImage`, 91,400,696 bytes,
  SHA-256 `4608c6853a02bb91db585246bab0fb413a2b940c0ddac0fe5b76746749dbe435`.
- Production-preview Lighthouse mobile: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms.
- Output budgets: app JS chunks 27.87/17.27 kB raw (10.83/7.34 kB gzip),
  site JS 5.02 kB raw (2.13 kB gzip), site CSS 10.27 kB raw (2.97 kB gzip).

## Production deployment

`dist/site` was deployed directly to the existing `sf-receipt-to-room` Azure
Static Web App production environment. Deployment ID:
`5080a7f2-ebd9-47ba-b4b3-2f9090c1fdef`. No DNS or infrastructure setting was
changed.

At `https://receipt-to-room.sociobot.in`:

- factory URL verification passed with HTTP 200, 907 ms load, correct title
  and language, one H1, one main landmark, no missing alt text, no unlabeled
  buttons, and no console or page errors;
- root `verify-url.sh` passed at 390 px with no horizontal overflow;
- desktop `/` and mobile `/?demo=1` each reported zero axe violations and zero
  console/page errors; the normal demo banner computed to `display: none` and
  the demo banner computed to `display: flex`;
- observed requests were limited to the product origin and the documented
  CORS-safe GitHub Releases API;
- live Lighthouse mobile scored 100/100/100/100 with LCP 0.9 s, CLS 0, and
  TBT 40 ms;
- response headers include the repaired frame protections, and the deployed
  HTML SHA-256 exactly matched the local `dist/site/index.html`.

## Native release

Tag `v0.1.3` triggers `.github/workflows/release.yml` to build unsigned macOS
arm64/x86_64, Windows, and Linux packages on GitHub-hosted runners. The final
release asset and live identity evidence is recorded below after that workflow
completes.

## Run it again

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm run verify:url -- https://receipt-to-room.sociobot.in
npm run verify:live-release -- <release-commit> https://receipt-to-room.sociobot.in
```

## Needs operator action

Packages are intentionally unsigned. To sign later, extend the workflow for
the owner-managed `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`,
`WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` secrets. No signing secret is
currently referenced or stored by this repository.

## Known gaps

None release-blocking. Native notarization and Authenticode remain unavailable
until the owner supplies signing certificates.
