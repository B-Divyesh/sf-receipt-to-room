# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-29 against repository commit
`2779420657f9add5310ea5557245e998378dcb38` and the live v0.1.10 site at
<https://receipt-to-room.sociobot.in/>. `.factory/brief.json` is absent, so the
work order, design, demo, claims, earlier reviews, polish reports, and handoff
were used as the contract. Product code was not changed.

## Verdict

**FAIL.** No blocking defect was found, but nine minor findings remain. One
README behavior is not represented by a claim entry, and the copy and shared
site structure still have plain-language and consistency defects. A pass
requires zero findings and no unlisted claim.

## Cold first read

I opened `/` without stored state in fresh Chromium contexts at 390×844 and
1440×900. I did not scroll before answering:

- **What it does:** turns receipts into purchase records organized by room.
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to click first:** **Try it with sample data**.

The exact text carrying those answers is “Turn receipts into room records,”
“For renters and homeowners who need purchase details after a move, repair, or
insurance question,” and “Try it with sample data,” followed by “See three demo
records right away.” All are visible before scrolling at both sizes. This check
passes. Evidence is in `review-3-evidence/cold-mobile.png` and
`review-3-evidence/cold-desktop.png`.

## Findings

### Minor

#### F-3-1 — The release-candidate rejection promise is absent from `claims.json`

- **Location / exact quote:** README, Deploy: “Tag only the final committed
  candidate, then run the preflight before pushing the tag; it rejects a tag
  that points to a different commit.”
- **Why this fails:** a release operator can rely on the stated rejection
  behavior. An untagged unit test covers it, but no `.factory/claims.json`
  entry owns the promise, and the declared `release-trigger` command selects a
  different tagged test. The manifest therefore cannot prove this sentence.
- **Concrete fix:** add a `release-candidate` claim and tag the existing
  rejection test `@claim:release-candidate`. Use
  `npm run test:release-contract -- -t @claim:release-candidate` as its command.

#### F-3-2 — One README sentence exceeds 22 words

- **Location / exact quote (24 words):** “Tag only the final committed
  candidate, then run the preflight before pushing the tag; it rejects a tag
  that points to a different commit.”
- **Why this fails:** it combines an instruction and failure behavior in one
  sentence, so the deployment rule is slower to scan.
- **Concrete rewrite:** “Tag only the final committed candidate. Run the
  release check before pushing the tag. It rejects a tag that points to another
  commit.”

#### F-3-3 — “Preflight” is unexplained README jargon

- **Location / exact quote:** README, Deploy: “run the preflight.”
- **Why this fails:** the reader must infer that “preflight” means the shown
  release-candidate verification command.
- **Concrete rewrite:** “Run the release check before pushing the tag.”

#### F-3-4 — “Receipt intake” is product jargon and breaks the input terminology

- **Locations / exact quotes:** landing Price: “Pay $29 once for unlimited
  receipt intake and backup files”; README What ships: “$29 once for unlimited
  receipt intake and backup files.”
- **Why this fails:** the rest of the product tells people to “add receipt
  photos” or refers simply to “receipts.” “Intake” introduces an internal term
  for the same action.
- **Concrete rewrite:** “Pay $29 once to add unlimited receipts and use backup
  files.” Use “add receipts” in README and Terms too.

#### F-3-5 — The rate-limit explanation uses undefined service jargon

- **Location / exact quote:** README, Privacy and paid version: “The
  paid-version service allows 30 checks per client in a service window.”
- **Why this fails:** “client” and “service window” do not tell the reader what
  will happen or how the limit affects them.
- **Concrete rewrite:** “The paid-version service allows 30 checks before a
  temporary pause. It then tells the app how long to wait.”

#### F-3-6 — “Redacted spreadsheet” is less clear than the product's established wording

- **Location / exact quote:** landing walkthrough: “Find a record later and
  download a redacted spreadsheet.”
- **Why this fails:** another section already explains the result as “payment
  details removed.” Switching to “redacted” adds avoidable legal/document
  jargon and weakens terminology consistency.
- **Concrete rewrite:** “Find a record later and download a spreadsheet with
  payment details removed.”

#### F-3-7 — The 404 h1 is a product-themed metaphor

- **Location / exact quote:** live unknown route and `site/404.html`: “That
  record is not here.”
- **Why this fails:** the heading does not name the page state without the
  product's record metaphor. A heading list should say what happened directly.
- **Concrete rewrite:** “Page not found.” Keep the existing explanatory
  sentence and **Return home** action.

#### F-3-8 — The external source link does not identify its destination

- **Location / exact quote:** every footer: “Source,” linking to GitHub.
- **Why this fails:** the site-structure rule requires external links to say
  so. “Source” does not tell a visitor that the link leaves the product site.
- **Concrete rewrite:** “Source on GitHub (external).” Keep the current GitHub
  URL.

#### F-3-9 — The footer's product/home treatment changes across routes

- **Location / exact state:** Home has a linked icon-and-name wordmark before
  “A local room record for reviewed receipts.” Privacy, Terms, and 404 omit the
  wordmark and show only the one-liner.
- **Why this fails:** the header and navigation links remain stable, but the
  shared footer is not actually the same component. A visitor reaching a legal
  or error route loses the footer's branded home affordance.
- **Concrete fix:** render the same linked wordmark, one-liner, navigation, and
  build disclosure in every footer.

## Copy audit

Counts use whitespace-delimited words, ignore a standalone dash, and count a
hyphenated term or URL as one word. Code blocks are not prose sentences.
Landing prose averages 6.6 words; README prose and bullet statements average
9.2 words. No banned marketing adjective appears.

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
| Demo — sample data, nothing is saved. | 6 | — |
| Three reviewed purchases are ready to search. | 7 | — |
| These demo records never read or change your real records. | 10 | — |
| No sample records match that search. | 6 | — |
| Sample reset. | 2 | — |
| Read, check, and file each receipt. | 6 | — |
| Choose receipt photos in the desktop app. | 7 | — |
| Correct item names, prices, rooms, and warranty dates before saving. | 10 | — |
| Search by room or item. | 5 | — |
| Download a spreadsheet with payment details removed. | 7 | — |
| See the receipt workflow before installing. | 6 | — |
| The four frames show loading, review, room assignment, and export. | 10 | — |
| Open three reviewed records without touching your own. | 8 | — |
| Check names, prices, and which lines to save. | 8 | — |
| Give every line its room, category, and warranty date. | 9 | — |
| Find a record later and download a redacted spreadsheet. | 9 | F-3-6 |
| Receipt work stays on your computer. | 6 | — |
| The desktop app reads receipt text on your computer. | 9 | — |
| Read the privacy note for storage and paid-version details. | 9 | — |
| Three receipts are free. | 4 | — |
| The free app includes search, spreadsheet download, and printable output. | 10 | — |
| Pay $29 once for unlimited receipt intake and backup files. | 10 | F-3-4 |
| Payment opens in a hosted checkout. | 6 | — |
| Install Receipt to Room. | 4 | — |
| Choose the installer for your computer. | 6 | — |
| Releases are unsigned. | 3 | — |
| Checking the latest release. | 4 | — |
| Downloads are being published. | 4 | — |
| Check the release page again soon. | 6 | — |
| Installer checks are paused during the demo. | 7 | — |
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
| Desktop app for Windows, macOS, and Linux | 7 | — |
| Reads English receipt text on your computer, including several photos in a queue | 13 | — |
| Manual entry with per-line room, category, warranty, and saved-item editing | 10 | — |
| Spreadsheet download with payment details removed, printable output, and five-second undo | 11 | — |
| Free version for three receipts; $29 once for unlimited receipt intake and backup files | 14 | F-3-4 |
| Download page that recommends the installer for your computer | 9 | — |
| Open `https://receipt-to-room.sociobot.in/?demo=1` or choose Try it with sample data on the landing page. | 13 | — |
| The demo immediately shows three reviewed room records. | 8 | — |
| In the app, choose Load demo records on the first screen. | 11 | — |
| Demo records use only `demo:receipt-to-room:*` storage. | 6 | — |
| They never read or write real inventory. | 7 | — |
| See `.factory/demo.md`. | 2 | — |
| Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from the Tauri 2 prerequisites. | 15 | Developer requirements |
| The text-reading files come from pinned packages. | 7 | — |
| They are bundled with the app. | 6 | — |
| No files load from outside services at runtime. | 8 | Developer context |
| The site checks GitHub for the latest release. | 8 | — |
| It then shows the installer for your operating system. | 9 | — |
| If details are unavailable, it links to the release page. | 10 | — |
| Builds are unsigned. | 3 | — |
| The install scripts check each download against its published checksum. | 10 | — |
| macOS users may need to right-click the app and choose Open. | 11 | — |
| Windows may show a SmartScreen publisher warning. | 7 | — |
| Inventory lives in local app storage. | 6 | — |
| The app contacts `api.sociobot.in` only when you check a paid-version code. | 11 | — |
| Its result is saved for one day. | 7 | — |
| Spreadsheet and printable exports remain available in the free version. | 10 | — |
| See `/privacy/` and `/terms/` on the site. | 7 | — |
| The paid-version service allows 30 checks per client in a service window. | 12 | F-3-5 |
| After 30 checks, it pauses new checks and tells the app how long to wait. | 15 | — |
| The app always shows a wait of at least one second before the next attempt. | 15 | — |
| Deploy the contents of `dist/site` as a static site. | 9 | — |
| Do not deploy `dist/app`. | 4 | — |
| GitHub Actions builds native bundles after a `v*` tag or manual dispatch. | 12 | — |
| A native release publishes installers, checksums, and a release manifest. | 10 | — |
| Tag only the final committed candidate, then run the preflight before pushing the tag; it rejects a tag that points to a different commit. | 24 | F-3-1, F-3-2, F-3-3 |
| MIT — see LICENSE. | 3 | — |

### Headings, labels, actions, and terms

The landing headings identify their sections and steps. The landing actions
are **Try it with sample data**, **Reset demo**, **Leave demo and use my
records**, **Read the privacy note**, **Buy unlimited receipts — $29**,
**Download [platform]**, **View release page**, and **See all downloads**. Each
uses a result-naming verb. README headings also identify their sections. The
404 heading is the exception in F-3-7.

Terminology is otherwise consistent: “demo” is the mode, “demo records” are
its contents, “receipt photos” are the input, “paid version” is the purchase,
“spreadsheet” is the table download, and “backup file” is the restore file.
F-3-4, F-3-5, and F-3-6 record the remaining exceptions.

## Demo and sandbox evidence

- One click at 390 px changes the URL to `/?demo=1#sample`, focuses “Your room
  inventory,” and immediately shows Cedar kettle / Kitchen / Appliance /
  $42.00, Reading lamp / Office / Decor / $39.00, and Linen storage box /
  Bedroom / Home supply / $12.50.
- The persistent banner says “Demo — sample data, nothing is saved” and offers
  **Reset demo** and **Leave demo and use my records**. Searching for `lamp`
  leaves only Reading lamp. Reset clears the search and restores all three
  rows.
- A seeded `receipt-to-room:inventory:v1` value remained byte-for-byte
  unchanged. Direct demo entry added only
  `demo:receipt-to-room:sample:v1`; existing normal inventory and release-cache
  sentinels were unchanged.
- Direct demo entry requested only the product origin. No cookies or
  third-party request appeared. The app privacy, local OCR, and offline claim
  tests also passed from clean browser state.
- At 390 px the demo banner ended at y=104 and the focused heading began at
  y=268, so the earlier overlap is gone. Evidence is in
  `review-3-evidence/demo-first-screen-mobile.png`.

## Claims gate

Every `test` command in `.factory/claims.json` was invoked individually from
clean clone `/tmp/receipt-review3-claims.qnJzVv/clone` at commit `2779420`.

| Claim ID | Result |
| --- | --- |
| `sample-demo` | PASS — 1 Playwright test |
| `local-ocr` | PASS — 1 Playwright test |
| `csv-export` | PASS — 1 Playwright test |
| `price` | PASS — 1 Playwright test |
| `release-api` | PASS — 1 Playwright test |
| `receipt-workflow` | PASS — 1 Playwright test |
| `editable-records` | PASS — 1 Playwright test |
| `bulk-queue` | PASS — 1 Playwright test |
| `image-input` | PASS — 1 Playwright test |
| `print-undo` | PASS — 1 Playwright test |
| `local-storage` | PASS — 1 Playwright test |
| `backup-restore` | PASS — 1 Playwright test |
| `redacted-exports` | PASS — 1 Playwright test |
| `privacy-boundaries` | PASS — 1 Playwright test |
| `license-cache` | PASS — 1 Playwright test |
| `license-rate-policy` | PASS — 1 Playwright test |
| `offline-work` | PASS — 1 Playwright test |
| `checkout-operator` | PASS — 1 Playwright test |
| `free-exports` | PASS — 1 Playwright test |
| `scope-boundaries` | PASS — 1 contract test |
| `release-trigger` | PASS — 1 contract test |
| `release-artifacts` | PASS — 1 contract test |
| `installer-integrity` | PASS — 1 contract test |
| `refund-revocation` | PASS — 1 Playwright test |

No declared command failed. F-3-1 remains because the release-candidate
rejection sentence has no manifest entry or tagged claim command.

## Structure, accessibility, links, and identity

- Home, Demo, Privacy, Terms, and 404 have route-appropriate titles,
  descriptions, canonicals, Open Graph/Twitter data, favicons, `lang=en`, one
  `main`, and one h1. The social image is 1200×630 and the touch icon is
  180×180.
- Unknown routes return the designed 404 with HTTP 404. F-3-7 concerns only
  the metaphorical h1.
- Back and Forward restore the home/demo URL, title, banner, sample visibility,
  scroll, and relevant heading focus. Privacy, Terms, and 404 focus their h1.
- Every crawled internal link and external document/download link returned 200
  after redirects. The intentional unknown-route self-link returned 404. The
  checkout ended at `checkout.dodopayments.com`; all four current release
  downloads returned 200 to HEAD requests. F-3-8 concerns labeling, not health.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passed. Live
  Playwright Axe scans at 390 px found zero WCAG 2 A/AA violations on Home,
  Demo, Privacy, Terms, and 404. No route overflowed, lacked alt text, or had a
  visible target below 44 px.
- Security headers include CSP `frame-ancestors 'none'`, HSTS, `nosniff`,
  Referrer-Policy, Permissions-Policy, and `X-Frame-Options: DENY`.
- `npm test` passed 17/17, `npm run build` produced `dist/app` and `dist/site`,
  and the full Playwright suite passed 21/21 in the clean clone. Landing JS is
  3.2 kB gzip across its two initial modules.
- The paper, botanical ink, fern illustration, room tabs, ruled baselines, and
  restrained sheet shapes match `.factory/design.md`. The visual identity is
  product-specific rather than a generic SaaS template.

## Earlier-finding verification

Every finding in `.factory/review-1.md` and `.factory/review-2.md` was checked
against the live site and current code. Both polish reports and the current
handoff were read as supporting evidence.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | Fixed: Back/Forward restore URL-derived demo state, metadata, scroll, and focus. |
| F-1-2 | Fixed: direct demo adds only the `demo:` sample key; normal sentinels remain unchanged. |
| F-1-3 | Fixed: four captioned app walkthrough frames remain live and in source. |
| F-1-4 | Fixed: copy says hosted checkout; live redirect and Dodo disclosure were confirmed. |
| F-1-5 | Fixed: visitor copy no longer makes the generated-image provenance claim. |
| F-1-6 | Fixed: `scope-boundaries` exists and passes. |
| F-1-7 | Fixed: `release-trigger` exists and passes. |
| F-1-8 | Fixed: `release-artifacts` exists and passes. |
| F-1-9 | Fixed: `installer-integrity` exists and passes. |
| F-1-10 | Fixed: vague accessibility/paywall copy is gone; `free-exports` passes. |
| F-1-11 | Fixed as originally reported: the false completeness sentence is gone. F-3-1 is a new unlisted sentence. |
| F-1-12 | Fixed: release production is covered by `release-trigger`. |
| F-1-13 | Fixed for the original 29-word sentence. F-3-2 is a different later sentence. |
| F-1-14 | Fixed: visitor capability copy says receipt text, not OCR. |
| F-1-15 | Fixed for CSV/JSON/CDN/CORS/SHA256 wording. F-3-6 records a remaining “redacted” instance. |
| F-1-16 | Fixed: “Useful free tier” is absent. |
| F-1-17 | Fixed: the purchase action names unlimited receipts and its price. |
| F-1-18 | Fixed: the mode is demo and its content is demo records. |
| F-1-19 | Fixed: Demo and static routes expose complete metadata and sitemap entries. |
| F-1-20 | Fixed as reported: header and footer navigation link sets are stable. F-3-9 records a separate footer branding mismatch. |
| F-1-21 | Fixed: full-page Privacy, Terms, and 404 loads focus their h1. |
| F-2-1 | Fixed: direct demo entry makes no cross-origin request. |
| F-2-2 | Fixed: landing and legal copy identify hosted Dodo checkout, and the claim follows the redirect. |
| F-2-3 | Fixed: the mobile demo heading clears the banner by 164 CSS px. |
| F-2-4 | Fixed: the first action is “Try it with sample data.” |
| F-2-5 | Fixed: the exit action is “Leave demo and use my records.” |
| F-2-6 | Fixed: the price heading is “Three receipts are free.” |
| F-2-7 | Fixed: “PLATE 01” is absent. |
| F-2-8 | Fixed: walkthrough copy describes the four stages without a provenance claim. |
| F-2-9 | Fixed: the README no longer promises a one-hour cache duration. |
| F-2-10 | Fixed: unverified buyer restrictions are absent; refund revocation has a passing claim. |
| F-2-11 | Fixed: Home, Privacy, Terms, and 404 all report v0.1.10. |
| F-2-12 | Fixed: What ships says “Desktop app,” not “Tauri 2 desktop app.” |
| F-2-13 | Fixed: What ships describes the download result rather than `dist/site`. |
| F-2-14 | Fixed: privacy copy describes checking a paid-version code. |
| F-2-15 | Fixed for HTTP status/header jargon. F-3-5 records the remaining vague rate-window wording. |
| F-2-16 | Fixed: receipt input is consistently called “receipt photos.” |

The handoff's signed-package limitation remains accurately disclosed and is
not a review defect. Its claim of no remaining implementation or release
blocker is consistent with this round; the remaining defects are copy,
manifest coverage, and shared presentation.

## Missed leverage

No additional AI feature is justified. Local receipt reading and explicit
human review fit the privacy promise; sending household receipts to a model
would weaken it. The app already has multi-photo intake, manual entry, search,
saved-record editing, spreadsheet/print export, undo, and backup/restore. Sync
is not implied by the local-first contract.

## What would make this perfect

Add the missing release-candidate claim, split and simplify the long deployment
instruction, replace the remaining intake/rate/redaction jargon, use “Page not
found” for the 404 h1, label GitHub as external, and share one complete footer
across routes. Then rerun all 24 manifest commands, the copy inventory, live
route/link/request checks, axe, Back/Forward focus, and the clean build. Only a
zero-finding rerun should pass.
