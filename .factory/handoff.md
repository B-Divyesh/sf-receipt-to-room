# Receipt to Room — repair 3 handoff

## Release status

Candidate `921d3ab0bdfd0f303eaaa083a02826078293e4f7` failed independent
verification for an unavailable checkout, a hidden manual-entry recovery field,
and strict release provenance. All three findings are repaired in `v0.1.2`.
The original Tauri 2 desktop artifact, static landing deployment, researched
scope, and field-guide visual system are unchanged.

The static site was deployed with the work-order configuration to
<https://receipt-to-room.sociobot.in/>. Azure Static Web Apps deployment
`e0fcf2c2-ddde-4c75-8ec7-061db8acd5e8` succeeded on 2026-08-28. The `v0.1.2`
tag points to this handoff commit, so the public release target and repository
HEAD have exact source identity.

## Repairs

- Reproduced the blank manual submission before changing source. The alert was
  present, but `#manual-entry` had `hidden`, the textarea was invisible, and
  focus fell back to the document.
- Added durable manual-entry and validation state. A blank submission now keeps
  the textarea visible, focuses it, marks it `aria-invalid`, and links it to the
  announced error with `aria-describedby`. Entering a valid line immediately
  continues to review.
- Added a Playwright regression at 390 px for the exact failure and recovery.
- Added paid-return coverage for query-token storage, URL token removal,
  background verification, and the unlocked backup state.
- Rechecked the newly registered production billing mapping. The product URL
  returns HTTP 303 to a live `checkout.dodopayments.com/session/...` page, and
  that hosted page returns HTTP 200.
- Tightened `verify:live-release` so any non-Dodo redirect or broken hosted
  checkout fails the release gate.
- Bumped npm, Rust, Tauri, lockfile, release fixtures, and visible site version
  to `0.1.2`. GitHub Actions remains the only native release builder.

## Exact verification evidence

The repository was installed from its lockfile with `npm ci`; npm reported 84
packages and zero vulnerabilities. Verification then produced:

- `npm test`: 7/7 passed, including release/deployment policy tests.
- `npm run build`: passed TypeScript checking and emitted `dist/app` plus
  `dist/site`; site JS is 5.02 kB raw / 2.13 kB gzip and CSS is 10.24 kB raw /
  2.96 kB gzip.
- `npm run test:e2e`: 8/8 passed, including the new manual recovery and paid
  return cases. Axe reported no serious or critical issues.
- Every command in `.factory/claims.json` passed separately: sample sandbox,
  local OCR, CSV export/search, $29 price/link, and release API selection.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed; both Rust
  targets and doc tests contain zero tests and returned success.
- `CI=true npx tauri build --bundles deb`: passed. It produced
  `Receipt to Room_0.1.2_amd64.deb` (17 MB); package metadata reports version
  `0.1.2`, architecture `amd64`, and local SHA-256
  `45679d7982f37f8ce04eb6ad2cf99774d558051260c89c645fe9e2b7d42ec6b5`.
- Mobile Lighthouse against the production build and live URL: Performance
  100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0,
  total blocking time 0 ms.
- `/opt/fleet/lib/verify-url.sh` against the live root: HTTP 200, correct title
  and `lang`, one `h1`, a `main` landmark, no missing alt text, no unlabeled
  buttons, and no console/page errors.
- Fresh live desktop (1366×900) and mobile (390×844) demo checks: no horizontal
  overflow, no console/page errors, keyboard Tab reveals a solid skip-link
  focus ring, and Axe found zero serious/critical violations. Requests went
  only to the site origin and the documented GitHub Releases API.
- Mobile offline app check: the offline state was announced, manual entry and
  its blank-error recovery remained usable, no external request occurred, and
  reduced-motion transition duration was `0.00001s`.
- Live response policy: `/`, `/privacy/`, and `/terms/` return 200; an unknown
  route returns 404; hashed JavaScript returns
  `Cache-Control: public, max-age=31536000, immutable`; HSTS, CSP, nosniff,
  Referrer-Policy, and Permissions-Policy are present.
- The release gate is `npm run verify:live-release -- $(git rev-parse HEAD)`.
  It checks exact GitHub release commit identity, all required OS assets,
  `latest.json`, `SHA256SUMS`, downloadable checksums, hosted checkout, license
  throttling with `Retry-After`, immutable caching, and the true HTTP 404.

The landing copy audit remains current: no sentence exceeds 22 words and no
banned wording was introduced. No analytics, telemetry, external fonts, raw AI
keys, receipt uploads, or direct payment-provider integration were added.

## Known gaps and operator action

Native packages are unsigned. macOS notarization and Windows Authenticode need
operator-owned `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets. The app has
no in-app updater, so it ships no updater manifest; the landing page discovers
new signed or unsigned releases through the GitHub Releases API.
