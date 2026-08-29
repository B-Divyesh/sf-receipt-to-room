# Independent verification 9 — FAIL

**Candidate:** `b5b307b4dc38a2001f503652f0661712c5b498f9`

**Live URL:** <https://receipt-to-room.sociobot.in/>

**Verified:** 2026-08-29 UTC from the clean candidate checkout

**Product code changed:** no

## Release decision

**FAIL.** The live website is the candidate and the core receipt workflow is
healthy, but the downloadable desktop release is not attested to the nominated
commit. The manual mobile audit also found controls below the contract's
44-by-44 CSS-pixel touch-target minimum.

## Release-blocking findings

### P0 — the native release does not identify the nominated candidate

`npm run verify:live-release -- b5b307b4dc38a2001f503652f0661712c5b498f9 https://receipt-to-room.sociobot.in`
failed with:

```text
release targets b6683dbeb3806c5cbc0af98ab536d98b93924b13,
expected b5b307b4dc38a2001f503652f0661712c5b498f9
```

Fresh corroborating evidence:

- The deployed HTML says `build-commit=b5b307b4dc38a2001f503652f0661712c5b498f9`.
- Fresh local and live SHA-256 values match for `index.html`, the main JS,
  version JS, CSS, Privacy, Terms, and 404 documents.
- GitHub's latest release is `v0.1.9`, with `target_commitish`
  `b6683dbeb3806c5cbc0af98ab536d98b93924b13`.
- Its `latest.json` also says `sourceCommit=b6683dbeb3806c5cbc0af98ab536d98b93924b13`.
- No tag contains the candidate and GitHub reports no release workflow run for
  the candidate SHA.
- The parent release workflow itself succeeded on Linux, Windows, Intel macOS,
  Apple silicon macOS, and manifest jobs.

The commits differ only in `.factory/handoff.md`, so this is an identity and
release-process defect rather than evidence of a functional binary difference.
The acceptance gate nevertheless requires an exact candidate-to-release match.

### P1 — mobile touch targets are below the required minimum

At 390 px, bounding-box measurements found these visible interactive targets
below 44 px in at least one dimension:

- Landing Privacy note: `166.3 × 17`.
- Demo banner “Leave demo and use my records”: `217.1 × 16`.
- Footer links: Demo `37.4 × 21.7`, Privacy `45.9 × 21.7`, Terms
  `38.1 × 21.7`, and Source `44.4 × 21.7`.
- Privacy and Terms email/return links: 17 px high.
- Desktop-app wordmark link: `210 × 34`.

These miss the attached accessibility and design baseline of 44×44 CSS pixels.
Axe reports no serious/critical rule violation because this target-size check
is a manual requirement.

## Mandatory first-read and demo gate — PASS

A cold 1440×900 and 390×844 visit answers all three questions in the first
screen:

- What: “Turn receipts into room records.”
- For whom: renters and homeowners needing purchase details after a move,
  repair, or insurance question.
- First action: “Try it with sample data,” with “See three demo records right
  away.” beside it.

One activation opens `/?demo=1#sample`, focuses “Your room inventory,” and
shows Cedar kettle within the first post-click viewport. At desktop its row is
at y=458 of 900; at mobile it is at y=561 of 844. The persistent banner offers
Reset demo and Leave demo. The live sample contains three records and only
writes `demo:receipt-to-room:sample:v1`.

Evidence screenshots:

- `verification-evidence-9/live-cold-desktop.png`
- `verification-evidence-9/live-cold-mobile.png`
- `verification-evidence-9/live-demo-mobile.png`

## Mandatory claims gate — PASS

`.factory/claims.json` exists with 24 entries. After `npm ci`, every listed
command was run separately from the candidate checkout. Every invocation
matched exactly one test and passed:

| Claim ID | Result |
| --- | --- |
| `sample-demo` | PASS, 1/1 |
| `local-ocr` | PASS, 1/1 |
| `csv-export` | PASS, 1/1 |
| `price` | PASS, 1/1 |
| `release-api` | PASS, 1/1 |
| `receipt-workflow` | PASS, 1/1 |
| `editable-records` | PASS, 1/1 |
| `bulk-queue` | PASS, 1/1 |
| `image-input` | PASS, 1/1 |
| `print-undo` | PASS, 1/1 |
| `local-storage` | PASS, 1/1 |
| `backup-restore` | PASS, 1/1 |
| `redacted-exports` | PASS, 1/1 |
| `privacy-boundaries` | PASS, 1/1 |
| `license-cache` | PASS, 1/1 |
| `license-rate-policy` | PASS, 1/1 |
| `offline-work` | PASS, 1/1 |
| `checkout-operator` | PASS, 1/1 |
| `free-exports` | PASS, 1/1 |
| `scope-boundaries` | PASS, 1/1 |
| `release-trigger` | PASS, 1/1 |
| `release-artifacts` | PASS, 1/1 |
| `installer-integrity` | PASS, 1/1 |
| `refund-revocation` | PASS, 1/1 |

The repository contract test also confirms one unique test tag for every
listed claim and no documented capability outside the claims inventory.

## Local quality gates

- `npm ci`: PASS; 84 packages installed, zero audit vulnerabilities.
- `npm test`: PASS, 16/16.
- `npm run test:release-contract`: PASS, 9/9.
- `npx tsc --noEmit`: PASS. No separate lint script exists.
- `npm run build`: PASS; generated `dist/app` and `dist/site`.
- `npm run test:e2e`: PASS, 21/21 with Playwright 1.58.2.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after
  installing the Linux packages declared in the release workflow.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the crate
  defines zero Rust unit/doc tests.
- `CI=true npm run tauri build -- --bundles deb,appimage`: PASS.
  - DEB: 16,967,630 bytes; SHA-256
    `56881d5b3c0f350948a0a4c7b6bcb728d4da90368f2d665e47f53a12ca24bd1b`.
  - AppImage: 91,400,696 bytes; SHA-256
    `ebd510696c5df0b6be06abf9ede2bed1bf38c2d1f0be4a3d672d8773026f0586`.

## End-to-end product exercise

The independent mobile app flow parsed a mixed receipt with `39`, `1,299.99`,
and `0.00` prices plus US date `08/19/2026`; assigned different rooms,
categories, and warranty dates per line; saved, searched, edited, and exported
the inventory. Quantity 999 saved; 1000 was blocked with “Value must be less
than or equal to 999.”

Blank manual input kept the field visible, focused, `aria-invalid`, and
described by “Paste at least one item and price, then try again.” Unsupported
text and a PNG one byte over 10 MiB were rejected with JPG/PNG/WebP and 10 MB
recovery guidance. The real-storage sentinel remained unchanged throughout the
demo flow. No console error, page error, or external app request occurred.

The full claim suite additionally exercised bundled OCR, two-image queueing,
zero selected lines, malformed backup recovery, redacted CSV/print output,
delete/undo, paid-token caching/revocation, free-limit exports, and offline
manual intake/edit/export.

## Live deployment, privacy, accessibility, and performance

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS.
- Home, demo, Privacy, and Terms have `lang=en`, distinct titles, one h1, one
  main, complete image alternatives, no 390 px overflow, and no console/page
  errors.
- Axe on desktop and mobile routes plus app review/inventory states found zero
  serious/critical violations. Keyboard focus starts on the skip link with a
  solid 3 px `#0B63CE` outline. Enter on the primary action focuses the demo
  heading. Reduced motion reports no active transitions or animations.
- Live normal-page traffic is same-origin plus the documented GitHub Releases
  API lookup. Demo traffic is same-origin only. The app intake/export flow is
  same-origin only. No cookies, analytics, telemetry, advertising, crash
  reporter, remote font, Azure endpoint, or embedded key was observed.
- HTML headers include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  strict-origin referrer policy, restrictive permissions policy, and
  `X-Frame-Options: DENY`. Hashed assets use
  `public, max-age=31536000, immutable`; HTML revalidates after 30 seconds.
- Privacy, Terms, robots, sitemap, installers, and the designed 404 return the
  expected responses. An unknown path returns HTTP 404. All crawled live links
  returned 2xx or an intentional 3xx navigation/download response.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 20 ms, CLS 0, total transfer 247 KiB.
- Site initial JS is about 3.4 KiB gzip and CSS 3.1 KiB gzip. App initial JS is
  about 20.1 KiB gzip and CSS 4.1 KiB gzip. Mobile hero AVIF is 27,041 bytes.
- No service worker or web manifest is present; this is a Tauri desktop app,
  not a PWA. No sign-in exists, so the Entra requirement is not applicable.

## Billing and installer evidence

- Checkout returned 303 to `checkout.dodopayments.com`; the hosted page loaded
  with 200.
- Observed license allowance: requests 1–30 returned 200; request 31 returned
  429 with `Retry-After: 4`.
- The release lists native artifacts for Linux, Windows, Intel macOS, and Apple
  silicon macOS plus `SHA256SUMS` and `latest.json`.
- The live Linux one-line installer succeeded in an isolated `XDG_BIN_HOME`.
  The installed 91,396,600-byte AppImage hash
  `16249dd44efe163a09e2981fc9da158b028aff7e8699472bd06d10a36d155a29`
  matches both `latest.json` and `SHA256SUMS`.
- The installed AppImage extracted successfully and stayed running for an
  eight-second Xvfb smoke test; only expected headless EGL warnings appeared.

## Required next steps

1. Publish a release whose release target and `latest.json.sourceCommit` are
   the exact nominated candidate, or nominate the already released SHA.
2. Give every interactive mobile target at least a 44×44 CSS-pixel hit area,
   including demo-banner, footer, legal/return, and app wordmark links.
3. Rerun the candidate provenance gate and the 390 px touch-target audit.

`.factory/brief.json` is absent; the researched brief supplied in the work
order and the checked-in design/demo/claims documents were used as the
acceptance contract.
