# Receipt to Room — independent verification 15

**Result: PASS — accept candidate `f5092e1079b93143ad64bfdeb0d013219771d65a`.**

Verified independently on 2026-08-29 against the clean `main` checkout and
`https://receipt-to-room.sociobot.in`. The live page, release `v0.1.17`, tag,
release manifest, and successful release workflow all identify the candidate
commit.

## Defects by severity

- P0: none.
- P1: none.
- P2: none found.
- P3: none found.

The earlier verification-14 mobile performance failure is resolved. Three new
cold mobile Lighthouse runs all meet the contract.

## Mandatory first read and demo

The cold first screen answers all three questions in plain words:

- What it does: **“Turn receipts into room records.”**
- For whom: renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- What to click first: **“Try it with sample data”**, beside the explanation
  **“See three demo records right away.”**

This is visible without scrolling at 1440×900 and 390×844. Activating it once
shows three useful records, the persistent “Demo — sample data, nothing is
saved” banner, Reset demo, and Leave demo controls. The heading receives focus.
The direct demo made only same-origin requests, set no cookies, and wrote only
`demo:receipt-to-room:sample:v1`.

## Claims and clean build

`.factory/claims.json` exists and lists 25 claims. After the required `npm ci`,
every listed command was invoked separately and passed: **25/25**. This covers
the demo sandbox, local OCR, exports, price, release lookup, receipt review,
saved-record edits, bulk queue, image limits, print/undo, local storage,
backup validation, export redaction, privacy boundaries, license cache and
throttling, offline work, hosted checkout, free exports, product boundaries,
release contracts, installer integrity, and refund revocation.

An instruction-order probe before installing dependencies could not start the
test runner: e2e commands stopped at the absent OCR package asset and contract
commands could not find Vitest. No assertion ran in that probe. `npm ci` then
installed the lockfile cleanly (84 packages, zero audit vulnerabilities), and
all 25 runnable claim commands passed from that clean dependency state.

Additional gates:

- `npm test`: PASS, 21/21.
- `npm run test:e2e`: PASS, 26/26.
- `npx tsc --noEmit`: PASS. There is no separate lint script.
- `npm run build`: PASS; produced `dist/app` and `dist/site`.
- `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, and
  `cargo clippy --locked -- -D warnings`: PASS after installing the documented
  Tauri Linux system prerequisites. The thin Rust shell has zero unit tests.

## Product workflow and recovery

The clean browser suite exercised the smallest useful workflow with a
representative mixed-room receipt: manual intake, per-line inclusion, room,
category and warranty dates, save, search, edit, CSV download, printable
output, deletion, five-second undo, and persistence. It also exercised:

- two queued OCR images and local English OCR from the shipped fixture;
- comma-grouped and whole-number prices, quantities, and date parsing;
- blank input with announced guidance, `aria-invalid`, retained fallback, and
  focus returned to the field;
- unsupported and over-10 MB files without losing manual entry;
- malformed backup rejection without replacing known-good records;
- CSV formula guarding and payment-number redaction in CSV and print;
- the free three-receipt boundary, paid behavior, cached verification,
  revocation, and continued access to existing records/exports;
- offline manual intake, editing, and spreadsheet download.

The desktop first-run screen offers both receipt selection and **Load demo
records**. The 390 px app demo retains all controls and shows the three seeded
records. Screenshots are in `.factory/evidence-15/`.

## Accessibility, privacy, and browser behavior

`npm run verify:url -- https://receipt-to-room.sociobot.in` passed: status 200,
descriptive title, `lang=en`, one main and h1, complete alt text, no overflow,
and no console/page errors.

Independent Playwright Axe scans on desktop home and 390 px home, Privacy,
Terms, and 404 found **zero violations of any impact**, therefore zero serious
or critical findings. Every visible mobile link/control measured at least
44×44 CSS px. Keyboard-only Tab/Enter reached and opened the demo with a 3 px
blue focus ring, then focused its heading. Reduced-motion mode matched, used
`scroll-behavior: auto`, and had zero running animations. No tested route had
horizontal overflow. The only console line on the intentional unknown URL was
Chromium reporting its expected 404 document response; there was no script or
page error.

The demo request log is entirely same-origin. App claim flows sent no receipt
or inventory data off-origin and stored no image data. The site sets no cookies
and loads no third-party scripts or fonts. The normal landing makes only the
documented GitHub Releases API request for installer metadata.

Live HTML returns a restrictive CSP with only the documented GitHub and
Sociobot connections, `frame-ancestors 'none'`, HSTS, `nosniff`,
`strict-origin-when-cross-origin`, disabled camera/microphone/geolocation, and
`X-Frame-Options: DENY`. HTML caches for 30 seconds; hashed assets cache for one
year as immutable.

## Performance

Three fresh production mobile Lighthouse runs:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 0.983 s | 1.059 s | 135 ms | 0 | 106,703 B |
| 2 | 98 | 100 | 100 | 100 | 1.134 s | 1.170 s | 155.5 ms | 0 | 106,685 B |
| 3 | 100 | 100 | 100 | 100 | 0.931 s | 1.065 s | 34 ms | 0 | 106,675 B |

All runs meet Performance ≥90, Accessibility ≥95, LCP <2.5 s, TBT/interaction
proxy <200 ms, and CLS <0.1. The landing ships 4.09 KB gzip JavaScript and
3.19 KB gzip CSS. The app ships 20.05 KB gzip JavaScript and 4.13 KB gzip CSS,
well below the 200 KB/50 KB budgets.

## Deployment, release, and server endpoint

- All 43 publicly served files in a fresh `dist/site` build match the live
  response byte-for-byte. `staticwebapp.config.json` is deployment
  configuration and correctly is not public.
- `npm run verify:release-candidate -- v0.1.17 f5092e...` passed.
- `npm run verify:live-release -- f5092e... <live URL>` passed. It checks
  candidate provenance, all manifest artifact hashes, checkout, cache policy,
  AVIF MIME type, and true 404 handling.
- GitHub Actions release run `33271767112` completed successfully for the
  candidate. The public release is neither draft nor prerelease and contains
  macOS arm64/x64, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and
  `latest.json`.
- The live installer selected Linux, downloaded the AppImage, and verified
  SHA-256 `c15bd412722ace74743058eb6b49e4534dd7e55efc3d8b501ba3b6b1267cc74d`.
  It extracted successfully and remained running for a 12-second Xvfb smoke
  session (timeout 124, only expected headless DRI warnings). The container has
  no FUSE device, so the equivalent extracted payload was used for launch.
- Every rendered link plus `robots.txt`, `sitemap.xml`, `install.sh`, and
  `install.ps1` returned 200 or the expected checkout/download redirect.
- One client received 200 for license verification requests 1–30. Request 31
  returned **429** with `Retry-After: 4`; the documented allowance is enforced.

This is a desktop app, not a PWA or general backend, so service-worker update,
web offline reload, backend persistence/concurrency, and sign-in-provider gates
do not apply. Desktop offline behavior and the only server-side product endpoint
were tested as described above.

## Evidence and remaining operator action

Raw Lighthouse JSON, the live audit JSON/script, and desktop/mobile screenshots
are under `.factory/evidence-15/`.

Native installers remain intentionally unsigned and the landing page discloses
that fact. Production signing still requires the operator's Apple and Windows
certificates (`APPLE_CERTIFICATE`, `WINDOWS_CERT_PFX`). This is not an
acceptance defect under the supplied installer contract.
