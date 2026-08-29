# Adversarial first-read review 2 — FAIL

Reviewed 2026-08-29 against repository commit
`b1d6d8894cc5375c037d26986f7a77cd5669a0b1` and the live v0.1.6 site at
<https://receipt-to-room.sociobot.in/>. `.factory/brief.json` is absent, so the
work order, design, demo, claims, earlier review, polish report, and handoff were
used as the contract. Product code was not changed.

## Verdict

**FAIL.** Three blocking and thirteen minor findings remain. The cold first
screen is clear, the demo has realistic records, all 23 declared claim commands
pass, and the visual identity is distinct. Those passes do not override a
cross-origin request in the demo sandbox, a false merchant-of-record statement,
or a focused demo heading hidden under the mobile banner. A pass requires zero
findings and no untested claims.

## Cold first read

I opened `/` without stored state in fresh Chromium contexts at 390×844 and
1440×900. I did not scroll before answering:

- **What it does:** turns receipts into purchase records organized by room.
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to click first:** **Try the demo**.

The exact text carrying those answers is “Turn receipts into room records,”
“For renters and homeowners who need purchase details after a move, repair, or
insurance question,” and “Try the demo,” followed by “See three demo records
right away.” All are visible before scrolling at both sizes. This check passes.

## Findings

### Blocking

#### F-2-1 — Demo mode makes a third-party request

- **Location / exact evidence:** a clean direct visit to `/?demo=1` requested
  `https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest`.
  The request log otherwise contained only the product origin. The
  `@claim:sample-demo` test mocks this cross-origin request.
- **Why this fails:** the demo-sandbox contract requires verification from the
  demo entry point with no network beyond the product itself. Release discovery
  is unrelated to trying the sample and should not leave the sandbox. The
  request carries no receipt data, but that does not satisfy the isolation rule.
- **Concrete fix:** do not call `loadDownloads()` in demo mode, or serve fixed
  release metadata from the product origin. Extend `@claim:sample-demo` to fail
  on every cross-origin request during landing-demo and app-demo use.

#### F-2-2 — Payment copy and its claim test contradict the live checkout

- **Locations / exact quotes:** the landing page says “Payment opens on
  Sociobot.” `/terms/` says “Sociobot is the merchant of record.” The live link
  ends at `https://checkout.dodopayments.com/...`, where the checkout states:
  “This order process is conducted by our online reseller & Merchant of Record,
  dodopayments.com.”
- **Why this fails:** the legal page names the wrong merchant of record. The
  declared `checkout-operator` test passes only because it checks the initial
  Sociobot API `href`; it does not follow the redirect or assert the checkout
  disclosure. This is misleading payment information and an inadequately tested
  visitor claim.
- **Concrete fix:** use “Payment opens in a hosted checkout” on the landing page,
  name the actual merchant of record in Terms, and make
  `@claim:checkout-operator` follow the live or recorded redirect and assert the
  final host and merchant disclosure.

#### F-2-3 — The mobile demo banner obscures the focused demo heading

- **Location / exact evidence:** after choosing **Try the demo** at 390×844,
  the sticky banner ends at y=125.38 while “Your room inventory” starts at
  y=117.92. The banner covers 7.45 CSS px of the focused heading; hit-testing
  that part returns `#demo-banner`. The clipped heading is visible in the first
  post-click viewport.
- **Why this fails:** the required one-click demo immediately focuses a partly
  obscured heading. This weakens the first demo screen and fails visible focus
  after a route change on the required phone viewport.
- **Concrete fix:** keep the banner in flow, or give the demo target a
  responsive `scroll-margin-top` at least as tall as the wrapped banner. Add a
  390 px assertion that `heading.top >= banner.bottom` after direct entry,
  click entry, Back, and Forward.

### Minor

#### F-2-4 — The primary demo action does not name the sample-data result

- **Quote:** “Try the demo.”
- **Why this fails:** “demo” describes a mode, not what clicking produces, and
  it does not use the required first-screen wording.
- **Rewrite:** **Try it with sample data**.

#### F-2-5 — “Start for real” is vague

- **Location:** demo banner.
- **Why this fails:** the visitor must infer that this leaves the sandbox and
  opens an empty real workspace.
- **Rewrite:** **Leave demo and use my records**.

#### F-2-6 — The price heading does not name the section

- **Quote:** “Start with three receipts.”
- **Why this fails:** out of context, it reads as an instruction rather than
  the free limit or price.
- **Rewrite:** **Three receipts are free**.

#### F-2-7 — “PLATE 01” is decorative product lore

- **Location:** label over the hero illustration.
- **Why this fails:** it conveys no action, capability, price, or proof and
  violates the no-invented-lore rule.
- **Concrete fix:** remove the label. The original botanical art already
  establishes the field-guide identity.

#### F-2-8 — The walkthrough provenance claim is unlisted

- **Quote:** “Each frame is from the shipped desktop app using its bundled demo
  records.”
- **Why this fails:** this is a factual provenance claim, but no
  `.factory/claims.json` entry names or tests it.
- **Concrete fix:** add a `walkthrough-provenance` entry whose test generates or
  compares the four captures from the packaged demo, or replace the sentence
  with non-claiming guidance such as “The four frames show loading, review,
  room assignment, and export.”

#### F-2-9 — The one-hour download cache claim is unlisted and untested

- **Location / quote:** README Install: “It saves those details for one hour.”
- **Why this fails:** `release-api` checks that a cache entry exists, but neither
  its manifest claim nor its test asserts one-hour freshness and expiry.
- **Concrete fix:** add the one-hour behavior to the claim and test timestamps
  just below and above 60 minutes, or remove the duration from the README.

#### F-2-10 — Other paid-version terms have no claims entries

- **Location / quotes:** Terms: “A $29 one-time purchase grants one person
  unlimited receipt intake and backup files,” “It is not a subscription,” and
  “Refunds revoke the paid version.”
- **Why this fails:** `price` tests the amount and features but not the
  one-person restriction, subscription status, or refund revocation. A buyer
  can rely on all three statements.
- **Concrete fix:** list and test these billing terms through recorded Sociobot
  fixtures, or remove details the product cannot verify.

#### F-2-11 — The 404 footer reports the wrong release

- **Location / exact text:** every normal live route says “Built by Param
  Factory · v0.1.6”; the live designed 404 and `site/404.html` say “Built by
  Param Factory · v0.1.5.”
- **Why this fails:** the shared footer is inconsistent and the error route
  identifies an obsolete build.
- **Concrete fix:** derive one version value for every page and add the 404
  disclosure to the release-contract test.

#### F-2-12 — The README “What ships” section uses framework jargon

- **Quote:** “Tauri 2 desktop app for Windows, macOS, and Linux.”
- **Why this fails:** “Tauri 2” does not help a household user understand the
  shipped result.
- **Rewrite:** “Desktop app for Windows, macOS, and Linux.” Mention Tauri only
  in Develop.

#### F-2-13 — The README describes implementation instead of the download result

- **Quote:** “Static, operating-system-aware download site in `dist/site`.”
- **Why this fails:** “static” and the build directory are developer details in
  a user-facing feature list.
- **Rewrite:** “Download page that recommends the installer for your computer.”

#### F-2-14 — The README privacy sentence uses unexplained API/token jargon

- **Quote:** “The only product API call checks an optional paid-version token
  at `api.sociobot.in`.”
- **Why this fails:** “API call” and “token” hide the user action and data sent.
- **Rewrite:** “The app contacts `api.sociobot.in` only when you check a
  paid-version code.”

#### F-2-15 — The README exposes an HTTP status and header instead of the result

- **Quote:** “Further checks return `429` with `Retry-After`.”
- **Why this fails:** the reader needs the recovery behavior, not protocol
  jargon.
- **Rewrite:** “After 30 checks, the service pauses new checks and tells the app
  how long to wait.”

#### F-2-16 — “Photos” and “images” name the same input inconsistently

- **Locations / quotes:** “Add receipt photos” is immediately followed by
  “Choose receipt images in the desktop app.”
- **Why this fails:** two terms for the same input create avoidable doubt about
  whether scans or screenshots are accepted.
- **Rewrite:** “Choose receipt photos in the desktop app.” Use “receipt photos”
  throughout reader-facing copy.

## Copy audit

Counts use whitespace-delimited words, ignore a standalone dash, and treat a
hyphenated term or URL as one word. Code blocks are not prose sentences. No
sentence exceeds 22 words. Landing prose averages 6.8 words; README prose and
bullet statements average 8.6 words. No banned marketing adjective appears.

### Landing-page sentences

| Sentence | Words | Flag |
| --- | ---: | --- |
| Turn receipts into room records. | 5 | — |
| For renters and homeowners who need purchase details after a move, repair, or insurance question. | 15 | — |
| See three demo records right away. | 6 | — |
| Demo records stay separate. | 4 | — |
| Receipt text is read on your computer. | 7 | — |
| $29 once for unlimited receipts. | 5 | — |
| Identify the line. | 3 | — |
| Check the detail. | 3 | — |
| Place it in a room. | 5 | — |
| Demo — demo records only; nothing is saved to your real records. | 11 | F-2-1 context |
| Three reviewed purchases are ready to search. | 7 | — |
| These demo records never read or change your real records. | 10 | — |
| No sample records match that search. | 6 | — |
| Sample reset. | 2 | — |
| Read, check, and file each receipt. | 6 | — |
| Choose receipt images in the desktop app. | 7 | F-2-16 |
| Correct item names, prices, rooms, and warranty dates before saving. | 10 | — |
| Search by room or item. | 5 | — |
| Download a spreadsheet with payment details removed. | 7 | — |
| See the receipt workflow before installing. | 6 | — |
| Each frame is from the shipped desktop app using its bundled demo records. | 13 | F-2-8 |
| Open three reviewed records without touching your own. | 8 | — |
| Check names, prices, and which lines to save. | 8 | — |
| Give every line its room, category, and warranty date. | 9 | — |
| Find a record later and download a redacted spreadsheet. | 9 | — |
| Receipt work stays on your computer. | 6 | — |
| The desktop app reads receipt text on your computer. | 9 | — |
| Read the privacy note for storage and paid-version details. | 9 | — |
| Start with three receipts. | 4 | F-2-6 |
| The free app includes search, spreadsheet download, and printable output. | 10 | — |
| Pay $29 once for unlimited receipt intake and backup files. | 10 | — |
| Payment opens on Sociobot. | 4 | F-2-2 |
| Install Receipt to Room. | 4 | — |
| Choose the installer for your computer. | 6 | — |
| Releases are unsigned. | 3 | — |
| Downloads are being published. | 4 | — |
| Check the release page again soon. | 6 | — |
| A local room record for reviewed receipts. | 7 | — |

### README sentences and bullet statements

| Sentence or statement | Words | Flag |
| --- | ---: | --- |
| Turn receipts into room records. | 5 | — |
| Receipt to Room is for renters and homeowners who need purchase details after a move, repair, or insurance question. | 19 | — |
| The desktop app reads receipt text on your computer. | 9 | — |
| Each line has its own room, category, and warranty date. | 10 | — |
| Saved items remain editable. | 4 | — |
| The app does not scrape retailers. | 6 | — |
| It does not estimate current value. | 6 | — |
| It does not file insurance claims. | 6 | — |
| Keep original receipts where another party requires them. | 8 | — |
| Tauri 2 desktop app for Windows, macOS, and Linux | 9 | F-2-12 |
| Reads English receipt text on your computer, including several photos in a queue | 13 | — |
| Manual entry with per-line room, category, warranty, and saved-item editing | 10 | — |
| Spreadsheet download with payment details removed, printable output, and five-second undo | 11 | — |
| Free version for three receipts; $29 once for unlimited receipt intake and backup files | 14 | — |
| Static, operating-system-aware download site in `dist/site` | 6 | F-2-13 |
| Open `https://receipt-to-room.sociobot.in/?demo=1` or choose Try the demo on the landing page. | 11 | F-2-4 |
| The demo immediately shows three reviewed room records. | 8 | — |
| In the app, choose Load demo records on the first screen. | 11 | — |
| Demo records use only `demo:receipt-to-room:*` storage. | 6 | — |
| They never read or write real inventory. | 7 | — |
| See `.factory/demo.md`. | 2 | — |
| Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from the Tauri prerequisites. | 14 | Developer prerequisites; retained |
| The text-reading files come from pinned packages. | 7 | — |
| They are bundled with the app. | 6 | — |
| No files load from outside services at runtime. | 8 | — |
| The site checks GitHub for the latest release. | 8 | — |
| It saves those details for one hour. | 7 | F-2-9 |
| It then shows the installer for your operating system. | 9 | — |
| If details are unavailable, it links to the release page. | 10 | — |
| Builds are unsigned. | 3 | — |
| The install scripts check each download against its published checksum. | 10 | — |
| macOS users may need to right-click the app and choose Open. | 11 | — |
| Windows may show a SmartScreen publisher warning. | 7 | — |
| Inventory lives in local app storage. | 6 | — |
| The only product API call checks an optional paid-version token at `api.sociobot.in`. | 12 | F-2-14 |
| Its result is saved for one day. | 7 | — |
| Spreadsheet and printable exports remain available in the free version. | 10 | — |
| See `/privacy/` and `/terms/` on the site. | 7 | — |
| The token service allows 30 checks per client in a service window. | 12 | — |
| Further checks return `429` with `Retry-After`. | 6 | F-2-15 |
| The app always shows a wait of at least one second before the next attempt. | 15 | — |
| Deploy the contents of `dist/site` as a static site. | 9 | — |
| Do not deploy `dist/app`. | 4 | — |
| GitHub Actions builds native bundles after a `v*` tag or manual dispatch. | 12 | Developer deployment detail; retained |
| A native release publishes installers, checksums, and a release manifest. | 10 | Developer deployment detail; retained |
| MIT — see LICENSE. | 3 | — |

### Headings, labels, and actions

Descriptive landing headings pass: “Turn receipts into room records,” “Your
room inventory,” “Read, check, and file each receipt,” “Add receipt photos,”
“Check each line,” “Find records later,” “See the receipt workflow before
installing,” “Load demo records,” “Review receipt lines,” “Place each item,”
“Search and export,” “Receipt work stays on your computer,” and “Install Receipt
to Room.” “Start with three receipts” fails in F-2-6. The decorative “PLATE 01”
fails in F-2-7.

Actions checked: **Try the demo** (F-2-4), **Reset demo** (pass), **Start for
real** (F-2-5), **Read the privacy note** (pass), **Buy unlimited receipts —
$29** (pass), **Download Linux AppImage** (technically exact for the offered
artifact), **See all downloads** (pass), and **View release page** (pass).
README headings all name their sections: What ships, Try the demo, Develop,
Test and build, Install, Privacy and paid version, Deploy, and License.

Terminology is consistent for demo/demo records, paid version, spreadsheet,
and backup file. “Photos” versus “images” is the exception in F-2-16.

## Demo and sandbox evidence

- One click at 390 px changes the URL to `/?demo=1#sample` and immediately shows
  Cedar kettle / Kitchen / Appliance / $42.00, Reading lamp / Office / Decor /
  $39.00, and Linen storage box / Bedroom / Home supply / $12.50.
- The banner says “Demo — demo records only; nothing is saved to your real
  records” and offers Reset demo and Start for real. Search for `lamp` leaves
  only Reading lamp. Reset restores all three records.
- Seeded real inventory, receipt-usage, and release-cache sentinels were
  unchanged. A direct demo visit created only
  `demo:receipt-to-room:sample:v1` and
  `demo:receipt-to-room:release-metadata:v2` in addition to the sentinels.
- The app claim tests edit and reset `demo:receipt-to-room:inventory:v1`, then
  leave demo mode without copying records. Real inventory remains unchanged.
- App OCR, manual intake, CSV, print, and offline tests recorded no external
  runtime request. The landing demo exception is F-2-1.

## Claims gate

Every `test` command in `.factory/claims.json` was invoked individually from
the clean assigned checkout after `npm ci`.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `sample-demo` | PASS | 1 Playwright test |
| `local-ocr` | PASS | 1 Playwright test |
| `csv-export` | PASS | 1 Playwright test |
| `price` | PASS | 1 Playwright test |
| `release-api` | PASS | 1 Playwright test |
| `receipt-workflow` | PASS | 1 Playwright test |
| `editable-records` | PASS | 1 Playwright test |
| `bulk-queue` | PASS | 1 Playwright test |
| `image-input` | PASS | 1 Playwright test |
| `print-undo` | PASS | 1 Playwright test |
| `local-storage` | PASS | 1 Playwright test |
| `backup-restore` | PASS | 1 Playwright test |
| `redacted-exports` | PASS | 1 Playwright test |
| `privacy-boundaries` | PASS | 1 Playwright test |
| `license-cache` | PASS | 1 Playwright test |
| `license-rate-policy` | PASS | 1 Playwright test |
| `offline-work` | PASS | 1 Playwright test |
| `checkout-operator` | PASS, inadequate assertion | F-2-2 |
| `free-exports` | PASS | 1 Playwright test |
| `scope-boundaries` | PASS | 1 contract test |
| `release-trigger` | PASS | 1 contract test |
| `release-artifacts` | PASS | 1 contract test |
| `installer-integrity` | PASS | 1 contract test |

No declared command fails. F-2-2 is still blocking because its test does not
exercise the claimed observable result. Unlisted claims are F-2-8 through
F-2-10.

## Structure, accessibility, links, and identity

- Home, Demo, Privacy, Terms, and 404 have route-appropriate titles,
  descriptions, canonicals, Open Graph/Twitter data, favicons, `lang=en`, one
  `main`, and one h1. The social image is 1200×630 and the touch icon is 180×180.
- Demo, Privacy, Terms, robots, and sitemap deep links return correctly. Back
  and Forward restore demo URL, title, banner, sample visibility, and heading
  focus. Privacy, Terms, and 404 focus their h1 on load.
- All crawled links returned 200 after redirects. The checkout ends at the
  hosted Dodo page. The tested unknown route returns the designed page with
  HTTP 404.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passes. Live axe
  scans at 390 px report zero violations on Home, Demo, Privacy, Terms, and 404.
  There is no horizontal overflow. F-2-3 is a geometric occlusion that axe does
  not detect.
- Site JS is 5,600 bytes raw and CSS is 10,962 bytes raw. The tested pages had
  no console errors except the browser's expected failed-resource message for
  the intentional HTTP 404.
- The warm paper, botanical ink, ruled baselines, specimen tabs, original fern
  art, and restrained sheet shapes match `.factory/design.md`. The page is
  recognizable and is not a generic gradient/card SaaS template.

## Earlier-finding verification

Every finding in `.factory/review-1.md` was checked on the live site and in the
current code. `.factory/polish-1.md` contains repairs rather than additional
findings; each claimed repair is covered below.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | Fixed: Back and Forward restore URL, metadata, banner, sample state, and focus. |
| F-1-2 | Fixed: direct demo writes only `demo:` keys; real sentinels remain unchanged. |
| F-1-3 | Fixed: four captioned desktop-app frames are live and present in code. |
| F-1-4 | Fixed as written: landing copy and a claim now say payment opens on Sociobot. F-2-2 is a newly observed live contradiction beyond that repair. |
| F-1-5 | Fixed: generated-image provenance is no longer visitor copy. |
| F-1-6 | Fixed: `scope-boundaries` exists and passes. |
| F-1-7 | Fixed: `release-trigger` exists and passes. |
| F-1-8 | Fixed: `release-artifacts` exists and passes. |
| F-1-9 | Fixed: `installer-integrity` exists and passes. |
| F-1-10 | Fixed: vague accessibility copy is gone; `free-exports` passes. |
| F-1-11 | Fixed: the false manifest-completeness sentence is gone. New unlisted claims are recorded separately in F-2-8 through F-2-10. |
| F-1-12 | Fixed through the `release-trigger` claim and contract test. |
| F-1-13 | Fixed: the 29-word release sentence is now three short sentences. |
| F-1-14 | Fixed: reader-facing prose uses “receipt text,” not OCR. |
| F-1-15 | Fixed in reader-facing capability copy; spreadsheet and backup file are used consistently. |
| F-1-16 | Fixed: “Useful free tier” is gone. |
| F-1-17 | Fixed: paid copy consistently names the paid version and unlimited receipts. |
| F-1-18 | Fixed: the mode is “demo” and its contents are “demo records.” |
| F-1-19 | Fixed: Demo and static routes have complete route metadata; sitemap includes Demo. |
| F-1-20 | Fixed for navigation: header/footer link sets are stable. F-2-11 is a new footer-version inconsistency. |
| F-1-21 | Fixed: Privacy, Terms, and 404 focus their h1; live checks confirm it. |

The prior handoff's “Known gaps: None” is no longer accurate because this round
found F-2-1 through F-2-16.

## Missed leverage

No additional AI feature is justified. Local receipt reading plus explicit
human review fits the privacy promise; sending household receipts to a model
would weaken it. The app already has multi-image intake, spreadsheet and print
export, backup/restore, and search. Cross-device sync would conflict with the
documented local-first boundary unless it were a separately designed,
encrypted, opt-in feature.

## What would make this perfect

Remove the demo's GitHub request, correct and fully test the payment-party
language, keep the mobile demo heading below its banner, close every unlisted
claim, synchronize the 404 version, and apply the proposed plain-word rewrites.
Then rerun all 23 claim commands, the live request log, link crawl, mobile
geometry assertion, Back/Forward checks, verify-url, and axe. Only a clean run
with zero findings should pass.
