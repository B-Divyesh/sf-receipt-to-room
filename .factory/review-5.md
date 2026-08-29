# Adversarial first-read review 5 — PASS

Reviewed 2026-08-29 against repository commit
`063bd0e01425fcc2e1914fb1ad828d26f6091828` and the live `v0.1.17` site at
<https://receipt-to-room.sociobot.in/>. `.factory/brief.json` is absent, so the
work order, product contract, design note, demo note, claims manifest, all four
earlier reviews, all four polish reports, and the current handoff were used as
the scope.

Product code was not changed.

## Verdict

**PASS.** There are zero blocking findings, zero minor findings, and zero
untested or unlisted visitor claims. The first screen is clear at both required
sizes, the one-click demo is realistic and isolated, all 25 claim commands pass
from a clean clone, every earlier finding remains fixed, routing and metadata
pass, and the visual identity is distinct.

## Cold first read

I opened `/` in fresh Chromium contexts at 390×844 and 1440×900. I did not
scroll before answering:

- **What it does:** turns receipts into searchable purchase records organized
  by room.
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to click first:** **Try it with sample data**.

The exact first-screen text carrying those answers is “Turn receipts into room
records,” “For renters and homeowners who need purchase details after a move,
repair, or insurance question,” and “Try it with sample data,” beside “See
three demo records right away.” The three short facts about separation, local
text reading, and the $29 price are also visible before scrolling. Neither
viewport has horizontal overflow, a console error, or a page error.

## Copy audit

Counts use whitespace-delimited words, ignore a standalone em dash, and treat
hyphenated terms and URLs as one word. Commands are not prose sentences. The
live landing page matches the checked-in source. No sentence exceeds 22 words,
uses a banned marketing adjective, changes a defined product term, or uses a
mood heading or empty slogan.

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
| Find a record later and download a spreadsheet with payment details removed. | 12 | — |
| Receipt work stays on your computer. | 6 | — |
| The desktop app reads receipt text on your computer. | 9 | — |
| Read the privacy note for storage and paid-version details. | 9 | — |
| Three receipts are free. | 4 | — |
| The free app includes search, spreadsheet download, and printable output. | 10 | — |
| Pay $29 once to add unlimited receipts and use backup files. | 11 | — |
| Payment opens in a hosted checkout. | 6 | — |
| Install Receipt to Room. | 4 | — |
| Choose the installer for your computer. | 6 | — |
| Releases are unsigned. | 3 | — |
| Checking the latest release. | 4 | — |
| Downloads are being published. | 4 | — |
| Check the release page again soon. | 6 | — |
| Installer checks are paused during the demo. | 7 | — |
| A local room record for reviewed receipts. | 7 | — |

The live success status “Version 0.1.17 · unsigned release” has four words.
The repeated “GitHub download” labels have two words. Neither introduces a
copy issue.

### README sentences and statements

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
| Free version for three receipts; $29 once to add unlimited receipts and use backup files | 15 | — |
| Download page that recommends the installer for your computer | 9 | — |
| Open `https://receipt-to-room.sociobot.in/?demo=1` or choose Try it with sample data on the landing page. | 13 | — |
| The demo immediately shows three reviewed room records. | 8 | — |
| In the app, choose Load demo records on the first screen. | 11 | — |
| Demo records use only demo-prefixed storage. | 6 | — |
| They never read or write real inventory. | 7 | — |
| See `.factory/demo.md`. | 2 | — |
| Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from the Tauri 2 prerequisites. | 15 | — |
| The text-reading files come from pinned packages. | 7 | — |
| They are bundled with the app. | 6 | — |
| No files load from outside services at runtime. | 8 | — |
| The site checks GitHub for the latest release. | 8 | — |
| It then shows the installer for your operating system. | 9 | — |
| If details are unavailable, it links to the release page. | 10 | — |
| Builds are unsigned. | 3 | — |
| The install scripts check each download against its published checksum. | 10 | — |
| macOS users may need to right-click the app and choose Open. | 11 | — |
| Windows may show a SmartScreen publisher warning. | 7 | — |
| Inventory lives in local app storage. | 6 | — |
| The app contacts api.sociobot.in only when you check a paid-version code. | 11 | — |
| Its result is saved for one day. | 7 | — |
| Spreadsheet and printable exports remain available in the free version. | 10 | — |
| See `/privacy/` and `/terms/` on the site. | 7 | — |
| The paid-version service allows 30 checks before a temporary pause. | 10 | — |
| It then tells the app how long to wait. | 9 | — |
| The app always shows a wait of at least one second before the next attempt. | 15 | — |
| Deploy the contents of dist/site as a static site. | 9 | — |
| Do not deploy dist/app. | 4 | — |
| GitHub Actions builds native bundles after a version tag or manual dispatch. | 12 | — |
| A native release publishes installers, checksums, and a release manifest. | 10 | — |
| Tag only the final committed candidate. | 6 | — |
| Run the release check before pushing the tag. | 8 | — |
| It rejects a tag that points to another commit. | 9 | — |
| MIT — see LICENSE. | 4 | — |

“See `.factory/demo.md`” and “See `/privacy/` and `/terms/` on the site” are
document-navigation instructions, not product claims. Developer terms such as
Node.js, Rust, native bundle, and release manifest appear only in the sections
where a developer needs them.

### Headings, actions, and terms

The headings name the job, demo inventory, process, walkthrough, privacy,
price, and download sections. README headings name contents, demo,
development, testing, installation, privacy, deployment, and license. None is
a metaphor or mood line.

Checked actions are **Try it with sample data**, **Reset demo**, **Leave demo
and use my records**, **Read the privacy note**, **Buy unlimited receipts —
$29**, **Download Linux AppImage**, **See all downloads**, and **View release
page**. Each names an observable result. Navigation nouns are links rather
than command buttons.

Terminology is consistent: “demo” is the mode, “demo records” are its sample
contents, “receipt photos” are inputs, “receipt text” is extracted text, “paid
version” is the purchase, “spreadsheet” is the tabular export, “payment details
removed” describes export filtering, and “backup file” is the restore file.

## Demo and sandbox

- One click at 390 px changes the URL to `/?demo=1#sample`, focuses **Your room
  inventory**, and immediately shows Cedar kettle / Kitchen / Appliance /
  $42.00, Reading lamp / Office / Decor / $39.00, and Linen storage box /
  Bedroom / Home supply / $12.50.
- The persistent banner says “Demo — sample data, nothing is saved” and offers
  **Reset demo** and **Leave demo and use my records**. Searching for `lamp`
  leaves one realistic row. Reset clears the search, restores all three rows,
  and announces “Sample reset.”
- Seeded `receipt-to-room:inventory:v1` and
  `receipt-to-room:release-metadata:v2` sentinels remained byte-for-byte
  unchanged. Direct demo entry added only
  `demo:receipt-to-room:sample:v1`. Reset and exit removed that demo key; no
  demo record was copied into a real namespace.
- The direct demo made only same-origin requests and set no cookies. Its banner
  ended at 104.19 CSS px and its focused heading began at 267.73 CSS px.
- The desktop claim path uses only the two documented `demo:` app keys. The
  tests edit and reset sample records, perform local receipt reading, search,
  spreadsheet/print export, deletion/undo, and leave demo without changing
  real inventory.
- The landing page contains four captioned product frames for loading, review,
  room assignment, and export. The installed app's first screen provides
  **Load demo records**.

The demo passes the one-click, immediate-value, reset, storage-isolation,
offline/privacy-request, and desktop walkthrough requirements.

## Claims gate

I cloned the assigned tree locally into
`/tmp/receipt-review5-claims.5ha5T1/clone`, confirmed HEAD `063bd0e`, ran
`npm ci`, and invoked every manifest command separately. Results:

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `sample-demo` | `npm run test:e2e -- --grep @claim:sample-demo` | PASS |
| `local-ocr` | `npm run test:e2e -- --grep @claim:local-ocr` | PASS |
| `csv-export` | `npm run test:e2e -- --grep @claim:csv-export` | PASS |
| `price` | `npm run test:e2e -- --grep @claim:price` | PASS |
| `release-api` | `npm run test:e2e -- --grep @claim:release-api` | PASS |
| `receipt-workflow` | `npm run test:e2e -- --grep @claim:receipt-workflow` | PASS |
| `editable-records` | `npm run test:e2e -- --grep @claim:editable-records` | PASS |
| `bulk-queue` | `npm run test:e2e -- --grep @claim:bulk-queue` | PASS |
| `image-input` | `npm run test:e2e -- --grep @claim:image-input` | PASS |
| `print-undo` | `npm run test:e2e -- --grep @claim:print-undo` | PASS |
| `local-storage` | `npm run test:e2e -- --grep @claim:local-storage` | PASS |
| `backup-restore` | `npm run test:e2e -- --grep @claim:backup-restore` | PASS |
| `redacted-exports` | `npm run test:e2e -- --grep @claim:redacted-exports` | PASS |
| `privacy-boundaries` | `npm run test:e2e -- --grep @claim:privacy-boundaries` | PASS |
| `license-cache` | `npm run test:e2e -- --grep @claim:license-cache` | PASS |
| `license-rate-policy` | `npm run test:e2e -- --grep @claim:license-rate-policy` | PASS |
| `offline-work` | `npm run test:e2e -- --grep @claim:offline-work` | PASS |
| `checkout-operator` | `npm run test:e2e -- --grep @claim:checkout-operator` | PASS |
| `free-exports` | `npm run test:e2e -- --grep @claim:free-exports` | PASS |
| `scope-boundaries` | `npm run test:release-contract -- -t @claim:scope-boundaries` | PASS |
| `release-trigger` | `npm run test:release-contract -- -t @claim:release-trigger` | PASS |
| `release-artifacts` | `npm run test:release-contract -- -t @claim:release-artifacts` | PASS |
| `release-candidate` | `npm run test:release-contract -- -t @claim:release-candidate` | PASS |
| `installer-integrity` | `npm run test:release-contract -- -t @claim:installer-integrity` | PASS |
| `refund-revocation` | `npm run test:e2e -- --grep @claim:refund-revocation` | PASS |

Each claim tag occurs in the expected executable test. The landing, Privacy,
Terms, app copy, and README were cross-checked against the manifest. No
claim-like sentence lacks an applicable entry, and no claim remains untested.

## Structure, accessibility, links, and identity

- Home, Demo, Privacy, Terms, and 404 have route-specific titles,
  descriptions, canonicals, Open Graph/Twitter metadata, SVG and 180 px touch
  icons, `lang=en`, one `main`, and one h1. The Home title follows “Product —
  what it does”; the other titles follow the required route pattern.
- The direct Demo, Privacy, Terms, sitemap, robots, installer-script, and
  unknown-route deep links work. Unknown paths return the designed 404 with
  HTTP 404. Home ↔ Demo Back/Forward restores the URL, metadata, state, scroll,
  focus, and announcement.
- Demo exit focuses the Home h1. Privacy, Terms, and 404 focus their h1 after a
  route change. A cold Home load leaves focus on the document so its skip link
  remains first in the keyboard order.
- Every crawled actionable link returned 200 after redirects. The checkout
  ended on Dodo Payments. All four platform downloads, the source repository,
  `robots.txt`, `sitemap.xml`, `install.sh`, and `install.ps1` resolved.
- Fresh 390 px Axe scans found no violations on Home, Demo, Privacy, Terms, or
  404. No route overflowed or exposed a visible target smaller than 44 px. The
  only console line was Chromium's expected failed-document message for the
  intentional HTTP 404.
- `npm run verify:url -- https://receipt-to-room.sociobot.in` passed. The full
  local Playwright suite passed 26/26; `npm test` passed 21/21; `npm run build`
  produced `dist/app` and `dist/site`.
- Initial site JavaScript totals about 9.1 kB raw and 3.9 kB gzip. Reduced
  motion is respected, images reserve dimensions, and the site uses no CDN
  fonts or scripts.
- Warm paper, botanical ink, room tabs, ruled baselines, restrained sheet
  shapes, editorial type, and original receipt/fern art implement the design
  note. The result is recognizable from a thumbnail and is not a generic SaaS
  template.

## Earlier-finding verification

Every finding in reviews 1–4 and every claimed polish repair was checked in
the current source and live product. Passing tests were used with direct live
inspection, not as a substitute for it.

| Earlier ID | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: Back/Forward restores URL-derived demo state, metadata, scroll, focus, and announcement. |
| F-1-2 | Fixed: a direct demo changes only its `demo:` key; real sentinels remain unchanged. |
| F-1-3 | Fixed: four captioned desktop-app workflow frames remain live and in source. |
| F-1-4 | Fixed: payment copy says hosted checkout; the link ends at Dodo Payments. |
| F-1-5 | Fixed: no visitor-facing generated-art provenance claim remains; provenance stays in the design record. |
| F-1-6 | Fixed: `scope-boundaries` is declared and passes. |
| F-1-7 | Fixed: `release-trigger` is declared and passes. |
| F-1-8 | Fixed: `release-artifacts` is declared and passes. |
| F-1-9 | Fixed: `installer-integrity` covers both installer paths and passes. |
| F-1-10 | Fixed: the vague accessibility/paywall statement is absent; `free-exports` passes. |
| F-1-11 | Fixed: the false completeness statement is absent; the current claim inventory is complete. |
| F-1-12 | Fixed: native release production is covered by `release-trigger`. |
| F-1-13 | Fixed: no landing or README sentence exceeds 22 words. |
| F-1-14 | Fixed: reader copy says receipt text, not OCR. |
| F-1-15 | Fixed: reader copy uses spreadsheet, backup file, download, and payment-details-removed wording. |
| F-1-16 | Fixed: “Useful free tier” is absent; the exact three-receipt limit is shown. |
| F-1-17 | Fixed: the purchase action names unlimited receipts and the $29 price. |
| F-1-18 | Fixed: demo and demo-record terminology is consistent. |
| F-1-19 | Fixed: Demo and static routes expose complete, route-specific metadata; Demo is in the sitemap. |
| F-1-20 | Fixed: all routes use the same header/footer links and footer identity. |
| F-1-21 | Fixed: all tested same-origin route changes, including returns to Home, focus and announce the route heading. |
| F-2-1 | Fixed: direct demo entry makes no cross-origin request. |
| F-2-2 | Fixed: Dodo merchant wording, redirect behavior, and claim test agree. |
| F-2-3 | Fixed: the focused demo heading clears the mobile banner by more than 163 CSS px. |
| F-2-4 | Fixed: the primary action is “Try it with sample data.” |
| F-2-5 | Fixed: the exit action is “Leave demo and use my records.” |
| F-2-6 | Fixed: the price heading is “Three receipts are free.” |
| F-2-7 | Fixed: decorative “PLATE 01” lore is absent. |
| F-2-8 | Fixed: walkthrough copy describes its four stages without an unsupported provenance claim. |
| F-2-9 | Fixed: README makes no untested one-hour cache promise. |
| F-2-10 | Fixed: unsupported buyer restrictions are absent; refund revocation is declared and tested. |
| F-2-11 | Fixed: every live route reports v0.1.17 from the shared version module. |
| F-2-12 | Fixed: user copy says “Desktop app”; Tauri appears only in developer instructions. |
| F-2-13 | Fixed: README describes the installer result rather than a build directory. |
| F-2-14 | Fixed: privacy copy explains checking a paid-version code without API/token jargon. |
| F-2-15 | Fixed: rate-limit copy describes the pause and recovery without HTTP jargon. |
| F-2-16 | Fixed: receipt input is consistently “receipt photos” or “add receipts.” |
| F-3-1 | Fixed: `release-candidate` has one tagged passing contract test. |
| F-3-2 | Fixed: the deployment instruction is split into short sentences. |
| F-3-3 | Fixed: “preflight” is replaced by “release check.” |
| F-3-4 | Fixed: “receipt intake” is replaced by “add receipts.” |
| F-3-5 | Fixed: rate copy says “30 checks before a temporary pause.” |
| F-3-6 | Fixed: reader copy says “payment details removed.” |
| F-3-7 | Fixed: the error-page h1 is “Page not found.” |
| F-3-8 | Fixed: footer links say “Source on GitHub (external).” |
| F-3-9 | Fixed: every route has the linked wordmark, one-liner, links, and current version. |
| F-4-1 / F-1-21 | Fixed: Demo, Privacy, Terms, 404, Back, and Forward returns to Home focus its h1 and update the polite announcement. |

No earlier finding is unfixed, half-fixed, or regressed.

## Missed leverage

No missing AI, import/export, or sync feature is implied strongly enough to be
a finding. Local receipt reading plus explicit line review is the core job and
supports the privacy promise. An automatic model-based room choice would be
ambiguous for items such as lamps and storage boxes, and would send household
purchase text off-device unless the user opted in. It is not needed to finish
the job. The product already supplies multi-photo input, typed fallback,
search, saved-record editing, spreadsheet and print export, undo, and validated
backup/restore. Cross-device sync would contradict the stated local-first
boundary unless separately designed as encrypted and opt-in.

## What would make this perfect

Nothing remains within the supplied product contract or this checklist. Do not
add AI or sync merely to expand the feature list; reconsider either only after
user evidence shows that local review or manual backup is the limiting step.
