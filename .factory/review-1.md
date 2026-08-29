# Adversarial first-read review 1 — FAIL

Reviewed 2026-08-29 against repository commit
`05e94e78ce796b54fc057031d87db3eb37874494` and the live `v0.1.5` site at
<https://receipt-to-room.sociobot.in/>. `.factory/brief.json` is absent, so the
supplied work order, `.factory/design.md`, `.factory/demo.md`, and
`.factory/claims.json` were used as the contract.

## Verdict

**FAIL.** There are three blocking findings, nine claim-coverage findings, and
nine copy/structure findings. The first screen is clear, every declared claim
command passes, the core app flow is credible, and the visual identity is
distinct. Those passes do not override broken Back behavior, a demo-mode write
to a normal storage key, or the missing desktop screenshot walkthrough.

## Cold first read

I opened the live URL in fresh Chromium contexts at 390×844 and 1440×900 and
did not scroll before answering:

- **What it does:** a desktop app turns receipt images into searchable
  household purchase records organized by room.
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to click first:** **Try it with sample data**.

All three answers are visible on the first screen at both sizes. The exact text
that carries them is “Turn receipts into room records,” “For renters and
homeowners who need purchase details after a move, repair, or insurance
question,” and “Try it with sample data,” followed by “See three room records
right away.” This part passes.

## Findings

### Blocking

#### F-1-1 — Back leaves the page in demo mode after the URL returns home

- **Location / exact state:** From `/`, choose **Try it with sample data**, then
  use browser Back. The URL returns from `/?demo=1#sample` to `/`, but the title
  remains `Demo — Receipt to Room`, the demo banner and sample workspace remain
  visible, and focus remains on “Your room inventory.”
- **Why this fails:** the visible state contradicts the address bar and the
  required Back/forward behavior. This is a broken route, which is blocking
  under the site-structure contract.
- **Concrete fix:** add a `popstate` handler that derives demo state, title,
  visibility, scroll, and focus from the current URL. Add a Playwright test for
  enter demo → Back → Forward and assert URL, title, banner, sample, scroll, and
  focus at every step.

#### F-1-2 — A direct demo visit writes to a non-demo storage namespace

- **Location / exact evidence:** A fresh visit to `/?demo=1` creates both
  `demo:receipt-to-room:sample:v1` and
  `receipt-to-room:release-metadata:v2`. The latter is written by
  `site/main.ts` while “Demo — sample data, nothing is saved to your real
  records” is visible. Reset removes the demo key but leaves the normal key.
- **Why this fails:** real inventory remained untouched in the sentinel test,
  but the contract is broader: nothing in demo mode may persist to normal
  storage. The current `@claim:sample-demo` test checks the real inventory value
  but does not assert that every changed key is demo-prefixed.
- **Concrete fix:** either keep release metadata in memory during demo or use a
  `demo:` cache key. Extend `@claim:sample-demo` to snapshot every storage key
  before a direct demo load and assert that all additions/changes begin with
  `demo:`.

#### F-1-3 — The desktop landing page has no 3–5 frame product walkthrough

- **Location / exact evidence:** the landing page contains one conceptual
  botanical hero image and a text-only three-step section. The one-click demo
  shows a searchable, read-only three-row inventory, but no receipt intake,
  line review, correction, or export screen.
- **Why this fails:** for a desktop product, the demo contract requires a
  captioned 3–5 frame screenshot walkthrough on the landing page. A visitor
  cannot see the actual desktop workflow before downloading it. A missing or
  weak demo is blocking.
- **Concrete fix:** add four original, captioned app screenshots: load sample
  project, review extracted lines, assign rooms/warranties, and search/export
  the resulting inventory. Keep **Load sample project** on the installed app’s
  first screen.

### Claim coverage

#### F-1-4 — “Sociobot/Dodo handles payment.” is an unlisted claim

- **Location:** landing price section.
- **Why this fails:** the live checkout does redirect to Dodo, but no
  `claims.json` entry owns this visitor-facing merchant claim.
- **Concrete fix:** add a `checkout-operator` claim whose test follows the
  Sociobot checkout redirect and asserts the hosted Dodo origin, or rewrite to
  the already-tested result: “Payment opens on Sociobot.”

#### F-1-5 — “Botanical hero imagery was generated for this product.” is an unlisted provenance claim

- **Location:** landing footer.
- **Why this fails:** provenance is a factual statement a visitor can rely on,
  but it is absent from `claims.json`.
- **Concrete fix:** add an `image-provenance` claim tied to a test that checks
  the committed source image and prompt sidecars, or move this repository fact
  out of visitor copy and link to a tested provenance note.

#### F-1-6 — The README’s scope-exclusion sentence is unlisted

- **Exact quote:** “It does not scrape retailers, estimate current value, file
  insurance claims, or promise that an insurer will accept a record.”
- **Why this fails:** these are useful boundaries, but they remain observable
  product claims and have no manifest entry.
- **Concrete fix:** add a `scope-boundaries` claim/test that exercises the full
  demo and confirms no retailer, valuation, or claim-submission integration, or
  split this into a clearly labelled non-functional scope statement and list
  it in `claims.json`.

#### F-1-7 — The README’s release-trigger claim is unlisted

- **Exact quote:** “GitHub Actions builds native bundles only after a `v*` tag
  or manual dispatch.”
- **Why this fails:** `tests/release-contract.test.ts` checks this, but the test
  is not represented by a `claims.json` entry.
- **Concrete fix:** add a `release-trigger` entry using
  `npm run test:release-contract -- --grep "ships one new native version"`.

#### F-1-8 — The README’s published-artifact claim is unlisted

- **Exact quote:** “It publishes DMG, MSI/EXE, AppImage, and DEB assets together
  with `SHA256SUMS` and `latest.json`.”
- **Why this fails:** the release gate verifies this, but the visitor claim has
  no claims manifest entry.
- **Concrete fix:** add a `release-artifacts` claim that runs the release
  contract locally and the live release verifier in the release gate.

#### F-1-9 — The README’s installer-integrity claim is unlisted

- **Exact quote:** “The scripts verify SHA256 before installing or opening an
  installer.”
- **Why this fails:** this security-sensitive promise has no claim entry and
  no declared sandbox command that runs both scripts against a fixture.
- **Concrete fix:** rewrite as “The install scripts check each download against
  its published checksum,” add an `installer-integrity` entry, and test both
  shell and PowerShell paths with matching and mismatched fixtures.

#### F-1-10 — “Accessibility and CSV/PDF exports are never paywalled.” is unlisted

- **Location:** README, Privacy and licensing.
- **Why this fails:** `csv-export` and `print-undo` test exports, but no claim
  asserts that both remain available at the free limit. “Accessibility” is
  also too broad to be a meaningful paid-feature promise.
- **Concrete fix:** write “CSV and print export remain available in the free
  version,” add a claim test at the three-receipt limit, and remove the vague
  accessibility clause.

#### F-1-11 — The README’s claim-manifest completeness statement is false

- **Exact quote:** “Every visitor-facing capability above maps to an executable
  entry in `.factory/claims.json`.”
- **Why this fails:** F-1-4 through F-1-10 and F-1-12 are counterexamples. This
  reopens the substance of `verification-4` P1-4 and `verification-6`’s claims
  inventory finding.
- **Concrete fix:** remove this meta-claim, or add all missing entries and a
  content-to-claim coverage test that enumerates exact documented statements.

#### F-1-12 — “Native releases are produced by `.github/workflows/release.yml`.” is unlisted

- **Location:** README, Deploy.
- **Why this fails:** the statement is testable and currently covered only by
  an undeclared release-contract test.
- **Concrete fix:** include it in the proposed `release-trigger` claim, with
  `where` naming the README Deploy section.

### Copy and structure

#### F-1-13 — One README sentence exceeds 22 words

- **Exact quote (29 words):** “The landing page reads CORS-enabled metadata
  from the GitHub Releases API, caches a successful response for one hour, and
  selects the matching release asset for the visitor’s operating system.”
- **Why this fails:** it combines source, cache duration, and OS selection, and
  includes implementation jargon.
- **Concrete rewrite:** “The site checks GitHub for the latest release. It
  saves those details for one hour. It then shows the installer for your
  operating system.”

#### F-1-14 — “OCR” is unexplained jargon in first-screen and README copy

- **Locations:** “Receipt OCR runs on your computer”; “Local English receipt
  OCR”; “OCR assets are copied…”
- **Why this fails:** a first-time household user should not need to expand an
  acronym to understand the privacy fact.
- **Concrete rewrites:** “Receipt text is read on your computer”; “Reads English
  receipt text on your computer”; and “The text-reading files come from pinned
  packages and are bundled with the app.”

#### F-1-15 — CSV, JSON, CDN, CORS, and SHA256 are unexplained file/infrastructure jargon

- **Locations:** landing “Export a redacted CSV” and “JSON backup”; README
  export, runtime, release, and installer paragraphs.
- **Why this fails:** the copy names formats and infrastructure rather than the
  result a visitor gets.
- **Concrete rewrites:** use “Download a spreadsheet with payment details
  removed,” “downloadable backup file,” “no files load from outside services,”
  and “checks each download against its published checksum.” Keep acronyms in
  parentheses only where developers need them.

#### F-1-16 — “Useful free tier” is unsupported marketing copy

- **Location / exact quote:** README bullet “Useful free tier (three receipts)
  and a $29 one-time Sociobot license unlock.”
- **Why this fails:** “Useful” adds no verifiable information.
- **Concrete rewrite:** “Free version for three receipts; $29 once for unlimited
  receipt intake and backups.”

#### F-1-17 — “Buy the field kit” is a metaphor and does not name the result

- **Location:** landing price button; README also calls the purchase a
  “Sociobot license unlock” and an “optional license.”
- **Why this fails:** “field kit,” “license unlock,” and “license” make one paid
  product sound like three concepts. The button does not say what buying does.
- **Concrete fix:** use one term, such as “paid version,” throughout. Rename the
  button **Buy unlimited receipts — $29**.

#### F-1-18 — Demo terminology changes between “sample data,” “workspace,” “sandbox,” and “project”

- **Locations:** landing hero/banner/sample section and README Try the sample.
- **Why this fails:** a visitor cannot tell whether these are different demo
  modes or the same isolated example.
- **Concrete fix:** use “demo” for the mode and “demo records” for its contents;
  for example, **Try the demo**, “The demo shows three reviewed records,” and
  **Load demo records**.

#### F-1-19 — Demo and secondary routes do not have complete route metadata

- **Exact evidence:** `/?demo=1` changes only `document.title`; its canonical,
  Open Graph title, and description still describe `/`. It is absent from
  `sitemap.xml`. Privacy and Terms omit the apple-touch icon and Twitter title,
  description, and image. The designed 404 omits description, canonical, Open
  Graph, Twitter, favicon, and apple-touch metadata.
- **Why this fails:** the metadata contract applies per route, including Demo
  and 404.
- **Concrete fix:** make `/demo` a real route or update all demo metadata on
  entry/exit, list it in the sitemap, and give every static route the complete
  shared metadata set with route-specific title/description/canonical values.

#### F-1-20 — Header and footer navigation are inconsistent across routes

- **Exact evidence:** Home has header links Demo / How it works / Privacy /
  Downloads and footer links Demo / Privacy / Terms / Source. Privacy and Terms
  replace Downloads with Terms and omit Source in the footer. The 404 omits
  Downloads and Terms from the header and omits Demo and Source from the
  footer.
- **Why this fails:** visitors lose stable navigation depending on the route.
- **Concrete fix:** render one shared header/footer link set on every route,
  including 404.

#### F-1-21 — Full-page route changes do not focus the new h1

- **Exact evidence:** choosing “Read the privacy note” loads `/privacy/` at the
  top, but `document.activeElement` is `<body>`, not “Privacy in plain
  language.”
- **Why this fails:** the route-change focus requirement is not met for
  keyboard and screen-reader users.
- **Concrete fix:** focus a `tabindex="-1"` h1 after navigation (or use an
  equivalent server-navigation focus strategy) and add Privacy/Terms/404 focus
  assertions.

## Copy audit

Word counts treat hyphenated terms and URLs as one word and do not count a
standalone dash. Code blocks are not sentences. State-only demo, reset, and
download-failure sentences are included.

### Landing page sentences

| Sentence | Words | Flag |
| --- | ---: | --- |
| Turn receipts into room records. | 5 | — |
| For renters and homeowners who need purchase details after a move, repair, or insurance question. | 15 | — |
| See three room records right away. | 6 | — |
| Sample data stays separate. | 4 | F-1-18 |
| Receipt OCR runs on your computer. | 6 | F-1-14 |
| $29 once for unlimited receipts. | 5 | — |
| Identify the line. | 3 | — |
| Check the detail. | 3 | — |
| Place it in a room. | 5 | — |
| Demo — sample data, nothing is saved to your real records. | 10 | F-1-2, F-1-18 |
| Three reviewed purchases are ready to search. | 7 | — |
| This is a sample workspace. | 5 | F-1-18 |
| Your real records are never read here. | 7 | — |
| No sample records match that search. | 6 | F-1-18 |
| Sample reset. | 2 | F-1-18 |
| Read, check, and file each receipt. | 6 | — |
| Choose receipt images in the desktop app. | 7 | — |
| Correct item names, prices, rooms, and warranty dates before saving. | 10 | — |
| Search by room or item. | 5 | — |
| Export a redacted CSV. | 4 | F-1-15 |
| Receipt work stays on your computer. | 6 | — |
| The desktop app reads receipt images locally. | 7 | — |
| Read the privacy note for storage and license details. | 9 | — |
| Start with three receipts. | 4 | — |
| The free app includes search and CSV export. | 8 | F-1-15 |
| Pay $29 once for unlimited receipt intake and JSON backup. | 10 | F-1-15 |
| Sociobot/Dodo handles payment. | 3 | F-1-4 |
| Install Receipt to Room. | 4 | — |
| Choose the installer for your computer. | 6 | — |
| Releases are unsigned. | 3 | — |
| Downloads are being published. | 4 | — |
| Check the release page again soon. | 6 | — |
| A local room record for reviewed receipts. | 7 | — |
| Botanical hero imagery was generated for this product. | 8 | F-1-5 |

### README sentences and bullet statements

| Sentence or statement | Words | Flag |
| --- | ---: | --- |
| Turn receipts into room records. | 5 | — |
| Receipt to Room is for renters and homeowners who need purchase details after a move, repair, or insurance question. | 19 | — |
| The desktop app reads JPG, PNG, and WebP receipts on-device. | 10 | — |
| Each line has its own room, category, and warranty date, and every saved item can be edited. | 17 | — |
| It does not scrape retailers, estimate current value, file insurance claims, or promise that an insurer will accept a record. | 20 | F-1-6 |
| Keep original receipts where a retailer, warranty provider, or insurer requires them. | 12 | — |
| Tauri 2 desktop app for Windows, macOS, and Linux | 9 | — |
| Local English receipt OCR, including a multi-image queue | 8 | F-1-14 |
| Manual fallback with per-line room, category, warranty, and saved-item editing | 10 | — |
| Redacted CSV and printable inventory output; deletion includes five-second undo | 10 | F-1-15 |
| Useful free tier (three receipts) and a $29 one-time Sociobot license unlock | 12 | F-1-16, F-1-17 |
| Static, OS-aware download site in `dist/site` | 6 | — |
| Open `https://receipt-to-room.sociobot.in/?demo=1` or choose Try it with sample data on the landing page. | 13 | F-1-18 |
| The sandbox immediately shows three reviewed room records. | 8 | F-1-18 |
| In the app, choose Load sample project on the first screen. | 11 | F-1-18 |
| The editable sample project uses only `demo:receipt-to-room:*` storage and never reads or writes real inventory. | 15 | F-1-18 |
| See `.factory/demo.md`. | 2 | — |
| Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from the Tauri prerequisites. | 14 | — |
| OCR assets are copied from pinned npm packages into the local Vite public folder before app builds. | 17 | F-1-14 |
| No CDN is used at runtime. | 6 | F-1-15 |
| The static deploy root is `dist/site`. | 6 | — |
| GitHub Actions builds native bundles only after a `v*` tag or manual dispatch. | 13 | F-1-7 |
| It publishes DMG, MSI/EXE, AppImage, and DEB assets together with `SHA256SUMS` and `latest.json`. | 13 | F-1-8, F-1-15 |
| The landing page reads CORS-enabled metadata from the GitHub Releases API, caches a successful response for one hour, and selects the matching release asset for the visitor’s operating system. | 29 | F-1-13, F-1-15 |
| If no release metadata is available, it links to the release page and says that downloads are being published. | 19 | — |
| Builds are unsigned. | 3 | — |
| The scripts verify SHA256 before installing or opening an installer. | 10 | F-1-9, F-1-15 |
| macOS users may need to right-click the app and choose Open. | 11 | — |
| Windows may show a SmartScreen publisher warning. | 7 | — |
| Inventory lives in local app storage. | 6 | — |
| The only product API call verifies an optional license at `api.sociobot.in`, cached for one day. | 15 | F-1-17 |
| Accessibility and CSV/PDF exports are never paywalled. | 7 | F-1-10, F-1-15 |
| See `/privacy/` and `/terms/` on the site. | 7 | — |
| The license service allows 30 verification requests per client in a service window. | 13 | — |
| Further requests return 429 with `Retry-After`. | 6 | — |
| The app always shows a wait of at least one second before the next attempt. | 15 | — |
| The live release gate checks this response policy. | 8 | — |
| Every visitor-facing capability above maps to an executable entry in `.factory/claims.json`. | 11 | F-1-11 |
| Deploy the contents of `dist/site` as a static site. | 9 | — |
| Do not deploy `dist/app`. | 4 | — |
| Native releases are produced by `.github/workflows/release.yml`. | 6 | F-1-12 |
| MIT — see LICENSE. | 4 | — |

### Headings, labels, and actions

Landing headings are descriptive: “Turn receipts into room records,” “Your
room inventory,” “Read, check, and file each receipt,” “Add receipt photos,”
“Check each line,” “Find records later,” “Receipt work stays on your computer,”
“Start with three receipts,” and “Install Receipt to Room.” README headings are
also descriptive: “What ships,” “Try the sample,” “Develop,” “Test and build,”
“Install,” “Privacy and licensing,” “Deploy,” and “License.” No mood heading or
generic slogan was found.

Actions checked: **Try it with sample data**, **Reset demo**, **Start for real**,
**Read the privacy note**, **Buy the field kit**, **Download Linux AppImage**,
**See all downloads**, and the fallback **View release page**. Only **Buy the
field kit** fails the result-naming rule; see F-1-17. Navigation nouns such as
Demo, Privacy, Terms, and Source are links, not command buttons.

## Demo and sandbox evidence

- One click from the first screen shows Cedar kettle / Kitchen / Appliance /
  $42.00, Reading lamp / Office / Decor / $39.00, and Linen storage box /
  Bedroom / Home supply / $12.50. On mobile, Cedar kettle is visible in the
  first post-click viewport and “Your room inventory” receives focus.
- The persistent banner, Reset demo, and Start for real are present. Search for
  `lamp` narrows to Reading lamp; Reset restores all three rows.
- A seeded real inventory sentinel was unchanged by the landing and installed
  app demo flows. The app sample project writes its editable room change only
  under `demo:receipt-to-room:inventory:v1` and resets it to Kitchen.
- The direct landing demo’s additional normal release-cache write is the
  blocking exception in F-1-2.
- The live landing/demo request log contains the product origin and
  `https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest`.
  No receipt data appears in that request. The app claim tests recorded no
  external request during OCR, manual intake, CSV, or print.

## Claims gate

Every command in `.factory/claims.json` was run individually from clean clone
`/tmp/receipt-claims-clean.O7VwK3` at commit `05e94e7`. All declared commands
passed:

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `sample-demo` | PASS | 1 Playwright test passed |
| `local-ocr` | PASS | 1 Playwright test passed |
| `csv-export` | PASS | 1 Playwright test passed |
| `price` | PASS | 1 Playwright test passed |
| `release-api` | PASS | 1 Playwright test passed |
| `receipt-workflow` | PASS | 1 Playwright test passed |
| `editable-records` | PASS | 1 Playwright test passed |
| `bulk-queue` | PASS | 1 Playwright test passed |
| `image-input` | PASS | 1 Playwright test passed |
| `print-undo` | PASS | 1 Playwright test passed |
| `local-storage` | PASS | 1 Playwright test passed |
| `backup-restore` | PASS | 1 Playwright test passed |
| `redacted-exports` | PASS | 1 Playwright test passed |
| `privacy-boundaries` | PASS | 1 Playwright test passed |
| `license-cache` | PASS | 1 Playwright test passed |
| `license-rate-policy` | PASS | 1 Playwright test passed |
| `offline-work` | PASS | 1 Playwright test passed |

Passing commands do not cover the unlisted claims above, and the
`sample-demo` assertion does not detect F-1-2.

Additional verification passed:

- `npm test`: 12/12.
- `npm run build`: produced `dist/app` and `dist/site`.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: one h1/main,
  `lang=en`, no missing alt, no overflow, and no console/page errors on `/`.
- Live `npm run verify:live-release -- 1cab44e…`: release/manifest identity,
  checkout redirect and hosted Dodo page, 30-request allowance, immutable
  hashed assets, and true 404 all passed.
- Live Playwright + axe at 390 px: zero serious/critical violations on Home,
  Demo, Privacy, Terms, and 404.
- All crawled document, checkout, source, asset, and installer-script links
  returned 200 after redirects; mail links were excluded.

## Structure and visual identity

Home, Privacy, Terms, and 404 each have one h1, `lang=en`, a main landmark,
visible keyboard focus, and no horizontal overflow at 390 px. The home title
uses the required “Product — what it does” pattern. The 1200×630 social image,
512×512 SVG favicon, and 180×180 apple-touch icon are real product assets.
Security headers include CSP `frame-ancestors 'none'`, HSTS, `nosniff`,
Referrer-Policy, Permissions-Policy, and `X-Frame-Options: DENY`.

The botanical field-guide treatment is recognizably product-specific: warm
paper, botanical ink, room tabs, ruled lines, restrained sheet shapes, and an
original receipt/fern illustration. It is not a generic gradient SaaS hero.
The remaining route/metadata defects are F-1-1 and F-1-19 through F-1-21.

## History verification

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The prior handoff and all `verification-*.md` defect lists were checked anyway.

| Earlier finding | Current result |
| --- | --- |
| Stale native release / candidate mismatch | Fixed: live release and manifest bind to `1cab44e`; current HEAD adds docs only. |
| Broken checkout | Fixed: 303 to `checkout.dodopayments.com`, hosted page 200. |
| Undocumented/unenforced license allowance | Fixed: README says 30; request 31 returns 429 with `Retry-After: 4`. |
| Mutable asset caching / false 404 | Fixed: hashed assets are immutable and unknown paths return the designed 404 with status 404. |
| Hidden recovery field after blank manual input | Fixed and covered by the focused-field test. |
| Flaky Playwright server startup | Fixed: all 17 clean-clone claim invocations passed first try. |
| Demo banner visible on normal landing | Fixed: hidden on `/`, visible on `/?demo=1`. |
| Free receipt-limit bypass | Fixed by the price/gating test. |
| Missing CSP frame protection / verify script / rate documentation | Fixed. |
| Demo initially below viewport / no app sample namespace | Fixed: sample row is immediately visible and app demo uses `demo:` keys. F-1-2 and F-1-3 are additional sandbox/presentation failures. |
| Mixed-room receipt and saved-item editing | Fixed by claim tests. |
| Incomplete claims inventory | **Reopened:** F-1-4 through F-1-12. |
| Malformed backup replacing inventory | Fixed by claim test. |
| App deep-link, scroll, and focus loss | Fixed by app regression tests; F-1-1 is a separate live landing-history failure. |
| Common US dates/prices | Fixed by unit tests. |
| Small first-screen touch targets | Fixed by the 390 px target test. |

## Missed leverage

No additional AI feature is justified. Local OCR and explicit human review are
the core job; sending household receipts to a model would weaken the current
privacy proposition. Search, spreadsheet export, printable output, and backup
restore already cover the obvious import/export leverage. Sync is not implied
by the local-first contract.

## What would make this perfect

Resolve every finding above: make demo history reversible, prevent every
non-demo storage write while demo is active, show the actual desktop workflow
in four captioned frames, close the claim manifest, simplify and standardize
the copy, and make metadata/navigation/focus complete on every route. Then run
this entire review again from fresh browser contexts and a fresh clone. A pass
requires zero remaining findings, including minor ones.
