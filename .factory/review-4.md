# Adversarial first-read review 4 — FAIL

Reviewed 2026-08-29 against repository base
`7c98355b890d248bdf75162b1e5a8b52020bff1a` and live build
`7683c0dc9f3b3fc17c42cfbf7067097c35af1f3b` (`v0.1.13`) at
<https://receipt-to-room.sociobot.in/>. `.factory/brief.json` is absent, so the
work order, design, demo, claims, prior reviews, polish reports, and handoff were
used as the contract. Product code was not changed.

## Verdict

**FAIL.** One blocking routing/accessibility finding remains. Every declared
claim passes, the first screen and demo pass, the copy audit has no flag, and no
minor finding remains. A pass requires zero findings.

## Blocking finding

### F-1-21 (reopened; round-four index F-4-1) — Returning Home loses route focus and is not announced

- **Exact location and evidence:** On the live site, activate **Leave demo and
  use my records** from `/?demo=1#sample`; activate **Return home** from
  `/privacy/`, `/terms/`, or a 404; or use browser Back from `/privacy/` to `/`.
  Each route reaches the correct Home URL, but `document.activeElement` is
  `<body>`, not the h1 “Turn receipts into room records.” No shared polite live
  region announces the route. By contrast, direct Privacy, Terms, and 404 loads focus
  their h1, and in-page Home ↔ Demo history does too.
- **Code evidence:** `site/index.html` does not load `site/route-focus.ts`.
  `#start-real` calls `leaveDemo(false)` and then performs a full navigation.
  The route test in `tests/e2e/product.spec.ts` explicitly skips its focus
  assertion when `path === "/"` and does not test Return Home or cross-page
  Back. There is no route-announcement live region.
- **Why this blocks:** F-1-21 required every full-page route change to focus the
  new h1. The repair covered routes away from Home but not routes back to Home,
  so the earlier finding was only partially fixed. Keyboard and screen-reader
  users receive no reliable new-page position or route announcement. The work
  order makes an unfixed or half-fixed earlier finding blocking again under its
  original ID.
- **Concrete fix:** use one shared navigation-focus mechanism on every route.
  Preserve cold-load skip-link behavior, but focus Home’s h1 after same-origin
  Return Home, demo exit, and Back/Forward navigation; announce the new route in
  an `aria-live="polite"` region. Prevent the demo-exit link’s default reload
  and use the existing History API path, or carry a same-origin navigation
  marker into Home. Add 390 px Playwright cases for Demo → Home, Privacy → Home,
  Terms → Home, 404 → Home, and Back/Forward, asserting URL, h1 focus, visible
  focus, and the announcement.

## Cold first read

Fresh Chromium contexts opened `/` at 390×844 and 1440×900 without scrolling.

- **What it does:** turns receipts into household purchase records organized
  by room.
- **For whom:** renters and homeowners who need purchase details after a move,
  repair, or insurance question.
- **What to click first:** **Try it with sample data**.

The exact first-screen text was “Turn receipts into room records,” “For renters
and homeowners who need purchase details after a move, repair, or insurance
question,” and “Try it with sample data,” beside “See three demo records right
away.” All three answers, all three plain facts, and the action were visible at
both sizes. There was no horizontal overflow or load error. This check passes.

## Copy audit

Counts use whitespace-delimited words, ignore a standalone em dash, and treat a
URL or hyphenated term as one word. Code blocks are commands rather than
sentences. No sentence exceeds 22 words. No banned marketing word, unexplained
reader-facing jargon, inconsistent product term, mood heading, or empty slogan
was found.

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
| Demo records use only `demo:receipt-to-room:*` storage. | 6 | — |
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
| The app contacts `api.sociobot.in` only when you check a paid-version code. | 11 | — |
| Its result is saved for one day. | 7 | — |
| Spreadsheet and printable exports remain available in the free version. | 10 | — |
| See `/privacy/` and `/terms/` on the site. | 7 | — |
| The paid-version service allows 30 checks before a temporary pause. | 10 | — |
| It then tells the app how long to wait. | 9 | — |
| The app always shows a wait of at least one second before the next attempt. | 15 | — |
| Deploy the contents of `dist/site` as a static site. | 9 | — |
| Do not deploy `dist/app`. | 4 | — |
| GitHub Actions builds native bundles after a `v*` tag or manual dispatch. | 12 | — |
| A native release publishes installers, checksums, and a release manifest. | 10 | — |
| Tag only the final committed candidate. | 6 | — |
| Run the release check before pushing the tag. | 8 | — |
| It rejects a tag that points to another commit. | 9 | — |
| MIT — see LICENSE. | 3 | — |

### Headings, actions, and terminology

The landing headings name the job, demo inventory, process, walkthrough,
privacy, price, and download section. README headings identify their sections.
The actions **Try it with sample data**, **Reset demo**, **Leave demo and use my
records**, **Read the privacy note**, **Buy unlimited receipts — $29**,
**Download [platform]**, **View release page**, and **See all downloads** use
result-naming verbs. No copy finding is raised.

Terminology is consistent: “demo” is the mode, “demo records” are its contents,
“receipt photos” are the input, “receipt text” is the extracted text, “paid
version” is the purchase, “spreadsheet” is the table download, “payment details
removed” describes export filtering, and “backup file” is the restore file.

## Demo and sandbox

- One click at 390 px opened `/?demo=1#sample`, focused **Your room
  inventory**, and showed Cedar kettle / Kitchen / Appliance / $42.00, Reading
  lamp / Office / Decor / $39.00, and Linen storage box / Bedroom / Home supply
  / $12.50 in the first post-click viewport.
- The persistent banner says “Demo — sample data, nothing is saved” and offers
  **Reset demo** and **Leave demo and use my records**. Searching for `lamp`
  left one row. Reset cleared the search, restored all three rows, and announced
  “Sample reset.” Leaving removed the demo key instead of copying data.
- Real inventory and release-cache sentinels remained byte-for-byte unchanged.
  Direct demo entry created only `demo:receipt-to-room:sample:v1`, set no cookie,
  and made zero cross-origin requests. Banner bottom was 104.19 CSS px and the
  focused heading top was 267.73 px.
- The desktop claim flow used only the two documented `demo:` app keys. It
  exercised local receipt reading, review, edit, search, spreadsheet/print,
  deletion/undo, reset, and exit without writing real inventory.
- The landing page includes four captioned app frames for load, line review,
  room assignment, and export. The installed app exposes **Load demo records**
  on its first screen.

The demo itself passes. The Home focus failure after leaving it is F-1-21.

## Claims gate

Every `test` command in `.factory/claims.json` ran separately after `npm ci` in
fresh clone `/tmp/receipt-review4-claims.lXnwUy/clone` at `7c98355`.

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
| `release-candidate` | PASS — 1 contract test |
| `installer-integrity` | PASS — 1 contract test |
| `refund-revocation` | PASS — 1 Playwright test |

No command failed and no claim was left untested. A sentence-by-sentence check
of Home, Privacy, Terms, and README found no claim-like sentence without an
applicable manifest entry.

## Structure, links, accessibility, and identity

- Home, Demo, Privacy, Terms, and 404 have route-appropriate titles,
  descriptions, canonicals, Open Graph/Twitter data, SVG and 180 px touch icons,
  `lang=en`, one main, and one h1. The social image is 1200×630.
- The direct Demo, Privacy, Terms, sitemap, robots, and unknown-route deep links
  work. Unknown routes return the designed 404 with HTTP 404. In-page Home ↔
  Demo Back/Forward restores URL, metadata, visibility, scroll, and focus.
  Cross-page Home return focus fails as recorded in F-1-21.
- The live crawl found no dead actionable link. Internal routes, source,
  checkout, and four platform downloads returned 200 after redirects. Checkout
  ended at Dodo Payments. Mail links were inspected but not sent.
- Fresh live Axe scans found zero WCAG 2 A/AA violations on Home, Demo, Privacy,
  Terms, and 404 at 390 px. Pages did not overflow. Focus styling, 44 px targets,
  alt text, reduced-motion rules, security headers, and the skip link are
  present. The deliberate 404 produces only Chromium’s expected failed-document
  console line.
- `npm test` passed 19/19. `npm run build` produced `dist/app` and `dist/site`.
  The full Playwright suite passed 22/22. `npm run verify:url` passed. Landing
  JavaScript is 3.20 kB gzip, below the budget.
- The paper surface, botanical ink, original fern/receipt art, room tabs,
  ruled rhythm, serif/interface pairing, and restrained shapes follow
  `.factory/design.md`. The product is visually distinct from a generic SaaS
  template.

## Earlier-finding verification

Every earlier review and polish report was read. Each finding was checked in
the live product and current code; passing tests alone were not treated as
proof.

| Earlier ID | Round-four result |
| --- | --- |
| F-1-1 | Fixed: in-page Home/Demo Back and Forward restore URL-derived state, metadata, scroll, and focus. |
| F-1-2 | Fixed: direct demo adds only its `demo:` key and changes no real sentinel. |
| F-1-3 | Fixed: four captioned desktop workflow frames remain live and in source. |
| F-1-4 | Fixed: checkout copy is accurate; the live link ends at Dodo Payments. |
| F-1-5 | Fixed: visitor copy no longer makes the unsupported provenance claim. |
| F-1-6 | Fixed: `scope-boundaries` exists and passes. |
| F-1-7 | Fixed: `release-trigger` exists and passes. |
| F-1-8 | Fixed: `release-artifacts` exists and passes. |
| F-1-9 | Fixed: `installer-integrity` exists and passes. |
| F-1-10 | Fixed: vague paywall copy is absent; `free-exports` passes. |
| F-1-11 | Fixed: the false completeness sentence is absent; all public claims are listed. |
| F-1-12 | Fixed: release production is covered by `release-trigger`. |
| F-1-13 | Fixed: no landing or README sentence exceeds 22 words. |
| F-1-14 | Fixed: reader copy says receipt text rather than OCR. |
| F-1-15 | Fixed: reader copy uses spreadsheet, backup file, download, and payment details removed. |
| F-1-16 | Fixed: “Useful free tier” is absent; the three-receipt limit is exact. |
| F-1-17 | Fixed: the purchase action names unlimited receipts and $29. |
| F-1-18 | Fixed: demo/demo-record terms are consistent. |
| F-1-19 | Fixed: all routes expose complete, route-specific metadata; Demo is in the sitemap. |
| F-1-20 | Fixed: every route uses the same header/footer navigation and footer identity. |
| **F-1-21** | **BLOCKING regression/partial fix:** routes away from Home focus their h1, but Demo/Privacy/Terms/404 → Home and cross-page Back leave focus on `<body>`; no route announcement exists. |
| F-2-1 | Fixed: direct demo makes zero cross-origin requests. |
| F-2-2 | Fixed: Dodo merchant wording and redirect behavior agree and are tested. |
| F-2-3 | Fixed: the demo heading clears the mobile banner by 163.55 CSS px. |
| F-2-4 | Fixed: the primary action says “Try it with sample data.” |
| F-2-5 | Fixed: exit says “Leave demo and use my records.” |
| F-2-6 | Fixed: price heading says “Three receipts are free.” |
| F-2-7 | Fixed: “PLATE 01” is absent. |
| F-2-8 | Fixed: walkthrough copy describes stages without an unsupported provenance claim. |
| F-2-9 | Fixed: README makes no untested one-hour cache promise. |
| F-2-10 | Fixed: unsupported buyer restrictions are absent; refund revocation is declared and tested. |
| F-2-11 | Fixed: all live routes render v0.1.13 from shared code. |
| F-2-12 | Fixed: user-facing copy says “Desktop app”; Tauri remains developer context. |
| F-2-13 | Fixed: README describes the download result, not a build directory. |
| F-2-14 | Fixed: privacy copy describes checking a paid-version code in plain words. |
| F-2-15 | Fixed: rate-limit copy describes the pause and recovery without protocol jargon. |
| F-2-16 | Fixed: receipt input is consistently “receipt photos” or “add receipts.” |
| F-3-1 | Fixed: `release-candidate` exists and has exactly one tagged passing test. |
| F-3-2 | Fixed: the deployment instruction is three sentences of 6, 8, and 9 words. |
| F-3-3 | Fixed: “preflight” is replaced with “release check.” |
| F-3-4 | Fixed: “receipt intake” is replaced with “add receipts.” |
| F-3-5 | Fixed: rate copy says “30 checks before a temporary pause.” |
| F-3-6 | Fixed: reader copy says “payment details removed.” |
| F-3-7 | Fixed: the 404 h1 is “Page not found.” |
| F-3-8 | Fixed: footer links say “Source on GitHub (external).” |
| F-3-9 | Fixed: every route has the linked wordmark, one-liner, links, and v0.1.13 disclosure. |

## Missed leverage

No additional AI feature is justified. The core job benefits from local text
reading plus explicit human correction; sending household receipts to a model
would weaken the stated privacy boundary. Multi-photo input, manual fallback,
search, edit, spreadsheet/print export, undo, and backup/restore cover the
obvious import/export needs. Sync is not implied by this local-first product.

## What would make this perfect

Close F-1-21 completely: make every same-origin route transition back to Home
focus its h1 and announce the route without breaking the cold-load skip link.
Add regression coverage for Demo, Privacy, Terms, 404, Back, and Forward. Then
rerun all 25 claim commands, the full route-focus matrix, live request and link
checks, Axe, unit tests, build, and Playwright. Nothing else remains in this
review.
