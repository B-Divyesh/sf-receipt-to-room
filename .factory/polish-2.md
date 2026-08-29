# Polish 2 — cumulative adversarial repair map

Release checked: `v0.1.8` from `3f448f94d31c3b8ac7f29125dbc1703503cff6d8`.
Live URL: <https://receipt-to-room.sociobot.in/>.

## Earlier findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo state is derived from the URL. Back and Forward restore visibility, metadata, scroll, and heading focus. | `landing history restores URL, metadata, focus, and demo state`; live Back/Forward check on `/?demo=1`. |
| F-1-2 | Direct demo entry writes only `demo:receipt-to-room:sample:v1`; release discovery is completely paused in demo mode. | `@claim:sample-demo`; live cold request log: zero cross-origin requests. |
| F-1-3 | The landing page includes four original desktop-app frames for load, review, room assignment, and export. | `site/public/assets/walkthrough-*.png`; live landing check. |
| F-1-4 | Payment copy now says hosted checkout. Terms name Dodo Payments, and the test follows a recorded Sociobot redirect to a Dodo checkout disclosure. | `@claim:checkout-operator`; `npm run verify:live-release`; live `/terms/`. |
| F-1-5 | Removed the visitor-facing generated-image provenance claim; source provenance stays in `.factory/design.md`. | Landing copy audit and live landing check. |
| F-1-6 | Scope limits are stated plainly and have their own contract claim. | `@claim:scope-boundaries`. |
| F-1-7 | Tag-triggered release behavior is declared and tested. | `@claim:release-trigger`; successful `v0.1.8` workflow run 33235079144. |
| F-1-8 | The release matrix and native artifact set are tested. | `@claim:release-artifacts`; live `v0.1.8` release assets. |
| F-1-9 | Shell and PowerShell installers must verify published checksums before installing. | `@claim:installer-integrity`; fresh v0.1.8 DEB download matched `SHA256SUMS`. |
| F-1-10 | Replaced the broad accessibility/paywall statement with the exact free spreadsheet and print export behavior. | `@claim:free-exports`. |
| F-1-11 | Removed the false completeness statement and enforce one manifest entry plus one tagged test for every claimed capability. | `lists every documented product capability with exactly one claim test`; all 24 claim commands passed from a fresh clone. |
| F-1-12 | Native release production is covered by the release-trigger claim rather than left as an unlisted statement. | `@claim:release-trigger`; release workflow run 33235079144. |
| F-1-13 | Split long README prose; every audited landing sentence is 22 words or fewer. | `.factory/copy-audit.md`. |
| F-1-14 | Visitor copy says receipt text is read locally; technical OCR wording is confined to developer context. | `.factory/copy-audit.md`; live first screen. |
| F-1-15 | Replaced file-format and network jargon in visitor guidance with spreadsheet, backup, download, and checksum outcomes. | README copy audit; `@claim:csv-export`, `@claim:backup-restore`, and `@claim:installer-integrity`. |
| F-1-16 | Removed “Useful free tier”; the page states the measurable free limit. | Live heading “Three receipts are free.”; `@claim:price`. |
| F-1-17 | Replaced “Buy the field kit” with “Buy unlimited receipts — $29.” | `@claim:price`; live pricing section. |
| F-1-18 | Standardized the try-out as demo records/sample data, including the exact persistent banner. | `@claim:sample-demo`; live screenshot `.factory/screenshots/polish-2-live-demo-mobile.png`. |
| F-1-19 | Demo, Privacy, Terms, and 404 have route-specific titles, descriptions, canonical/social metadata, and sitemap entries. | `site routes expose complete metadata, focused headings, shared links, and one build version`; live route check. |
| F-1-20 | Landing, legal, and 404 pages share the same useful navigation and footer links. | Site-routes Playwright test; live `/privacy/`, `/terms/`, and `/404.html`. |
| F-1-21 | Legal and 404 loads move focus to their h1; demo history changes restore the relevant heading focus. | Site-routes and landing-history Playwright tests; live focus check. |

## Round 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | `loadDownloads()` is not called in demo mode; the sample uses only its demo-prefixed key. | `@claim:sample-demo`; live cold `/?demo=1` request log recorded zero cross-origin requests. |
| F-2-2 | Landing copy says hosted checkout, Privacy identifies Dodo checkout, Terms names Dodo as merchant of record, and the claim test asserts the final checkout host and disclosure. | `@claim:checkout-operator`; `npm run verify:live-release`; live `/terms/`. |
| F-2-3 | Added responsive scroll clearance for the sticky banner and geometry assertions for direct, click, Back, and Forward entry at 390 px. | `@claim:sample-demo`; `.factory/screenshots/polish-2-local-demo-mobile.png`; live screenshot `.factory/screenshots/polish-2-live-demo-mobile.png`. |
| F-2-4 | Changed the first action to “Try it with sample data.” | `@claim:sample-demo`; live first screen. |
| F-2-5 | Changed the exit action to “Leave demo and use my records” in both web and desktop demos. | `@claim:sample-demo`; live demo banner. |
| F-2-6 | Changed the pricing heading to “Three receipts are free.” | `@claim:price`; live pricing section. |
| F-2-7 | Removed the decorative “PLATE 01” label while retaining the botanical field-guide art. | Live landing check asserted no matching text; live screenshot. |
| F-2-8 | Replaced the provenance assertion with a factual description of the four walkthrough stages. | Live walkthrough copy; `.factory/copy-audit.md`. |
| F-2-9 | Removed the one-hour cache promise from README and added boundary coverage for cache behavior. | `@claim:release-api`; Playwright timestamps just below and above 60 minutes. |
| F-2-10 | Removed unverified one-person/subscription terms. Added real revoked-license behavior: paid backup turns off while core records and exports remain. | `@claim:refund-revocation`; live Dodo refund sentence in `/terms/`. |
| F-2-11 | Every static route renders the package version from one shared module. | Site-routes and release-contract tests; live Home/Privacy/Terms/404 all show v0.1.8. |
| F-2-12 | README’s user-facing list now says “Desktop app for Windows, macOS, and Linux”; Tauri stays in development instructions. | README copy audit. |
| F-2-13 | README now describes a download page that recommends the installer for the visitor’s computer. | README copy audit; live detected-platform download points to v0.1.8. |
| F-2-14 | Rewrote the privacy sentence around the user action and the paid-version code sent. | README copy audit; `@claim:privacy-boundaries`. |
| F-2-15 | Replaced status/header jargon with the plain recovery behavior after 30 checks. | README copy audit; `@claim:license-rate-policy`; live verification reports allowance 30 and retry interval 4. |
| F-2-16 | Standardized the input term as “receipt photos” across landing, app, README, and claims. | `.factory/copy-audit.md`; live “Choose receipt photos in the desktop app.” |

## Final evidence

- Fresh clone: `/tmp/receipt-to-room-final-claims.ox7q51`; all 24 manifest
  commands passed individually.
- Local: `npm test` 14/14, `npm run test:e2e` 21/21, `npm run build`,
  `cargo check`, and `cargo test` passed.
- Accessibility/privacy/offline: zero serious or critical Axe findings; demo
  made zero cross-origin requests; offline-work claim passed.
- Live link crawl: internal routes, checkout, source/release pages, and all four
  platform download links returned 200 after redirects.
- Live Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 100 ms, CLS 0.
- Live release: <https://github.com/B-Divyesh/sf-receipt-to-room/releases/tag/v0.1.8>.
- Live screenshot: `.factory/screenshots/polish-2-live-demo-mobile.png`.

Every F-1 and F-2 finding is closed. No reviewed finding remains deferred.
