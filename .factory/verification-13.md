# Independent verification 13 — FAIL

**Candidate:** `5e4023b748d08f478c8be2c474546dc34c07dca4`

**Live URL:** <https://receipt-to-room.sociobot.in/>

**Verified:** 2026-08-29 UTC from the clean candidate checkout

**Product code changed:** no

## Release decision

**FAIL.** The website and local desktop workflow satisfy the researched job,
all 25 declared claims pass, and the live static files match the candidate.
However, the installable native release does not identify the nominated
candidate. The latest release, tag, and manifest all identify its parent
`7ddbd63b0ac262d1f4afcd0292e18beaaca858c9`. The repository's two exact
provenance gates fail, so this candidate cannot be accepted.

## Defects by severity

### P0 — the native release is not the nominated candidate

- `v0.1.15`, GitHub Release `target_commitish`, and
  `latest.json.sourceCommit` all equal `7ddbd63b0ac262d1f4afcd0292e18beaaca858c9`,
  not candidate `5e4023b748d08f478c8be2c474546dc34c07dca4`.
- `npm run verify:release-candidate -- v0.1.15 5e4023b...` fails with the
  exact tag mismatch.
- `npm run verify:live-release -- 5e4023b... <URL>` fails with the exact
  release-target mismatch.
- GitHub reports no tag and no Actions release run for `5e4023b...`.
- The live website does embed `build-commit=5e4023b...`, and all 27 served
  build files are byte-identical to the fresh candidate build. The mismatch
  is confined to the installable release.
- The candidate differs from `7ddbd63b...` only inside `.factory/`. That makes
  the released program functionally equivalent, but the acceptance contract
  explicitly requires the candidate, deployment, and native release to match.

### P2 — two keyboard stops lack the designed focus treatment

The macOS/Linux and Windows install-command panels are focusable
`div[tabindex="0"]` regions. Keyboard focus reaches both, but their computed
outline is the browser default `rgb(16, 16, 16) auto 1px`; every link, button,
and app control uses the designed 3 px blue ring. This misses the supplied
accessibility requirement that every focus state be designed. Keyboard access
is not trapped and the fallback outline remains visible.

Evidence: `evidence-13/keyboard.json` and
`evidence-13/install-command-focus.png`.

### P3 — AVIF responses use a generic MIME type

The live mobile hero returns `Content-Type: application/octet-stream` instead
of `image/avif`. Chromium renders it successfully and Lighthouse is unaffected,
but the deployment metadata is incorrect. Its caching is correct:
`public, max-age=31536000, immutable`.

## Mandatory first-read and demo gate — PASS

A cold 1440×900 and 390×844 visit answers all three questions in the first
screen:

- What: **“Turn receipts into room records.”**
- For whom: renters and homeowners needing purchase details after a move,
  repair, or insurance question.
- First action: **“Try it with sample data”**, beside **“See three demo
  records right away.”**

At 390 px, the headline, audience sentence, action, and action result are all
visible without scrolling. One keyboard activation opens `/?demo=1#sample`,
focuses **Your room inventory**, and immediately shows Cedar kettle, Reading
lamp, and Linen storage box. The persistent banner says **“Demo — sample data,
nothing is saved”** and provides **Reset demo** and **Leave demo and use my
records**.

A fresh direct-demo context made only same-origin requests, set no cookie, and
wrote only `demo:receipt-to-room:sample:v1`.

Evidence:

- `evidence-13/first-read-desktop.png`
- `evidence-13/first-read-mobile.png`
- `evidence-13/live-demo-mobile.png`
- `evidence-13/direct-demo.json`

## Mandatory claims gate — PASS

`.factory/claims.json` exists with 25 entries. After the clean `npm ci`, every
listed command was invoked separately against the shipped demo entry point.
All returned zero and each selected one tagged test:

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| `sample-demo` | PASS | `local-ocr` | PASS |
| `csv-export` | PASS | `price` | PASS |
| `release-api` | PASS | `receipt-workflow` | PASS |
| `editable-records` | PASS | `bulk-queue` | PASS |
| `image-input` | PASS | `print-undo` | PASS |
| `local-storage` | PASS | `backup-restore` | PASS |
| `redacted-exports` | PASS | `privacy-boundaries` | PASS |
| `license-cache` | PASS | `license-rate-policy` | PASS |
| `offline-work` | PASS | `checkout-operator` | PASS |
| `free-exports` | PASS | `scope-boundaries` | PASS |
| `release-trigger` | PASS | `release-artifacts` | PASS |
| `release-candidate` | PASS | `installer-integrity` | PASS |
| `refund-revocation` | PASS |  |  |

Per-claim output and return codes are in `evidence-13/claims/`. The full
release-contract suite also verifies unique IDs, one tag per claim, and public
capability coverage. Manual live/README review found no unlisted reliance
claim. The copy audit has no reader sentence over 22 words or banned term.

## Clean local quality gates

- Initial checkout: clean `main` at the exact nominated SHA.
- `npm ci`: PASS; 84 packages installed, zero audit vulnerabilities.
- `npm test`: PASS, 19/19.
- `npm run test:release-contract`: PASS, 12/12.
- `npx tsc --noEmit`: PASS. No separate npm lint script exists.
- `npm run build`: PASS; exact production build created `dist/app` and
  `dist/site`.
- `npm run test:e2e`: PASS, 24/24 with pinned Playwright 1.58.2.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; this thin
  Tauri shell defines zero Rust unit/doc tests.
- `cargo clippy --locked --manifest-path src-tauri/Cargo.toml -- -D warnings`:
  PASS.

The first Rust attempt stopped before product code because the container lacked
`glib-2.0`. After installing the exact Ubuntu dependencies declared by the
release workflow, all Rust gates passed. This is not a product defect.

Production bundle sizes are within contract:

- Site JavaScript: 9,374 bytes raw / 4,187 bytes gzip total.
- Site CSS: 11,076 bytes raw / 3,154 bytes gzip.
- App JavaScript: 52,612 bytes raw / 19,874 bytes gzip total.
- App CSS: 14,871 bytes raw / 4,133 bytes gzip.
- Mobile hero AVIF: 27,041 bytes; desktop AVIF: 131,355 bytes.
- No downloaded font or polyfill bundle.

## Independent product exercise

In a separate 390×844 reduced-motion app context, a real-storage sentinel was
created before entering the demo. The run then:

1. Rejected a text file and a PNG one byte above 10 MiB with JPG/PNG/WebP and
   10 MB recovery guidance.
2. Submitted blank manual input and received the named, linked alert
   **“Paste at least one item and price, then try again.”** The textarea kept
   focus and `aria-invalid=true`.
3. Reviewed three lines priced `249.99`, `0.00`, and `1,234.56`, with purchase
   date `08/29/2026`.
4. Rejected quantity `1000` with **“Value must be less than or equal to 999.”**
   and then saved boundary value `999`.
5. Assigned separate rooms/categories and warranty dates, saved, searched,
   edited Office lamp to Living room/Decor, and persisted the edit.
6. Downloaded a 755-byte CSV with one header and six records; the edited item
   and room were present.
7. Removed the item, exposed Undo, and restored it.

Only the two documented `demo:` app keys were added. The real sentinel remained
unchanged. The run had no external request, cookie, console/page error,
horizontal overflow, or serious/critical axe finding. A separate keyboard-only
sequence activated Add receipt, Paste receipt text, and Review these lines;
the expected route headings received focus and controls showed 3 px blue rings.

The claim suite additionally exercised bundled local OCR, two-photo queueing,
print output, payment-detail redaction in CSV/print, malformed-backup recovery,
five-second undo, offline typed intake/edit/export, free-limit exports, license
caching, and refunded-license locking.

Evidence: `evidence-13/app-independent.json`,
`evidence-13/app-independent-mobile.png`, and `evidence-13/keyboard.json`.

## Live deployment, accessibility, privacy, and performance

- `npm run verify:url -- https://receipt-to-room.sociobot.in`: PASS.
- A fresh local site build and all 27 public live files are byte-identical.
  The deployment-only `staticwebapp.config.json` is correctly not a public
  route.
- Unknown paths return the candidate-designed 404 body with HTTP 404. Home,
  Demo, Privacy, Terms, and direct `/404.html` return 200.
- Every discovered live link returns 2xx or an intentional release/checkout
  redirect; mail links were inspected but not sent.
- Desktop and 390 px scans across Home, Demo, Privacy, Terms, and 404 find zero
  serious/critical axe violations, missing image alternatives, or horizontal
  overflow. Routes have `lang=en`, distinct titles, one main, and one h1.
- Actual mobile controls are at least 44×44 CSS px. The search label itself is
  24.8 px high but expands the adjacent input's click target and is not a
  separate control.
- The first Tab exposes a 172.97×44.80 px skip link with a 3 px blue focus
  ring. Page scale 200% retains the h1, main landmark, and sample-data action.
- Reduced-motion mode matches and reports zero running animations.
- Home traffic is same-origin plus the documented GitHub Releases API lookup.
  Direct demo and the app workflow are same-origin only. No analytics,
  telemetry, advertising, crash-reporting, remote font/script, cookie, receipt
  upload, raw Azure endpoint, console error, page error, or failed request was
  observed.
- HTML responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  `X-Frame-Options: DENY`, strict-origin referrer policy, and disabled camera,
  microphone, and geolocation. HTML revalidates after 30 seconds; hashed JS,
  CSS, and images use one-year immutable caching.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 150 ms, CLS 0, total transfer 300 KiB.

## Paid service and native artifact evidence

- Checkout returns 303 to `checkout.dodopayments.com`; the hosted page returns
  200 and identifies Dodo Payments.
- Observed allowance for one fresh client: requests 1–30 returned 200;
  request 31 returned 429 with `Retry-After: 4`.
- The parent `v0.1.15` release contains Linux, Windows, Intel macOS, and Apple
  silicon macOS installers plus `SHA256SUMS` and `latest.json`.
- The Linux AppImage is 91,396,600 bytes. SHA-256
  `df2cb07ac0ee32602d16404baba895ffebfeeec332441fb18463c8ffd5a71764`
  matches both manifest and checksum file.
- The public shell installer downloaded that AppImage into a fresh
  `XDG_BIN_HOME`, verified it, and installed an executable. Its extracted
  `AppRun` remained alive through the full eight-second Xvfb smoke window;
  only expected headless DRI3 warnings appeared.
- Native packages are unsigned, and the site discloses that fact.

This is a Tauri desktop app, not a PWA, library, CLI, or product backend. There
is no service worker, package-consumer API, sign-in, or product-owned server
state to test. The only server endpoint used by the app is the Sociobot paid
service tested above, so concurrency, persistence/health, and Entra checks are
not applicable.

## Required next steps

1. Bind a native release, tag, and `latest.json.sourceCommit` to the nominated
   candidate, or nominate the already released parent SHA. Then rerun both
   provenance commands.
2. Give `.commands div[tabindex="0"]` the same designed focus-visible treatment
   as other keyboard targets.
3. Serve `.avif` assets as `image/avif`.

`.factory/brief.json` is absent. The researched brief supplied in work order
`receipt-to-room-verify-13` was used as the acceptance contract.
