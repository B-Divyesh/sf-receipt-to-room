# Polish 3 — cumulative adversarial repair map

Release candidate: `bb83b4096ab30d46eb04d82fdb67dea89c571ea0`
(`v0.1.12`). Live URL: <https://receipt-to-room.sociobot.in/>.

All 25 claim commands passed individually from clean clone
`/tmp/receipt-to-room-polish3-final.wGIaGf/clone`. The full 18-test unit and
contract suite and 21-test Playwright suite also passed there.

## Review 1 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo state remains derived from the URL; Back and Forward restore URL, metadata, sample visibility, scroll, and heading focus. | `landing history restores URL, metadata, focus, and demo state`; live `/?demo=1#sample` Back/Forward check; `.factory/screenshots/polish-3-live-demo-mobile.png`. |
| F-1-2 | Demo writes only demo-prefixed state and pauses release discovery. | `@claim:sample-demo`; live direct-demo request/storage check; `.factory/screenshots/polish-3-live-demo-mobile.png`. |
| F-1-3 | Four original, captioned desktop frames show load, review, assignment, and export. | `site/public/assets/walkthrough-*.png`; live `/` crawl; `.factory/screenshots/polish-3-live-home-mobile.png`. |
| F-1-4 | Payment copy says hosted checkout and the test follows the recorded redirect to Dodo Payments. | `@claim:checkout-operator`; live `/terms/`; `npm run verify:live-release`. |
| F-1-5 | The unsupported visitor-facing provenance claim remains removed; source provenance stays in the design record. | `.factory/design.md`; live `/` copy crawl. |
| F-1-6 | Scope limits remain explicit and declared. | `@claim:scope-boundaries`; clean-clone claim run. |
| F-1-7 | Version-tag and manual release triggers remain declared and tested. | `@claim:release-trigger`; GitHub Actions run 33254132199. |
| F-1-8 | Native installers, checksums, and manifest remain required release outputs. | `@claim:release-artifacts`; `v0.1.12` release and checksum check. |
| F-1-9 | Both installer scripts reject a mismatch before install or launch. | `@claim:installer-integrity`; release-contract test; live `SHA256SUMS` verification. |
| F-1-10 | Copy makes the exact free spreadsheet and print-export promise. | `@claim:free-exports`; clean-clone browser run. |
| F-1-11 | The false manifest-completeness sentence remains absent; every claim has one tagged test. | `lists every documented product capability with exactly one claim test`; 25/25 clean-clone claim commands. |
| F-1-12 | Native release production is owned by the release-trigger claim. | `@claim:release-trigger`; `.github/workflows/release.yml`; run 33254132199. |
| F-1-13 | Long prose remains split; the new release instructions are three short sentences. | `round-three public copy uses short, consistent plain words`; `.factory/copy-audit.md`; live `/`. |
| F-1-14 | Reader-facing copy says receipt text, not OCR. | `round-three public copy uses short, consistent plain words`; live first screen screenshot. |
| F-1-15 | Reader copy uses spreadsheet, backup file, download, and payment details removed. | `.factory/copy-audit.md`; `@claim:csv-export`, `@claim:backup-restore`, `@claim:redacted-exports`. |
| F-1-16 | The unsupported “Useful free tier” label remains removed; the exact three-receipt limit is shown. | `@claim:price`; live `/` pricing section. |
| F-1-17 | The purchase action names unlimited receipts and the $29 price. | `@claim:price`; live `/` pricing action. |
| F-1-18 | The mode is “demo” and its contents are “demo records” everywhere. | `@claim:sample-demo`; `.factory/copy-audit.md`; live demo screenshot. |
| F-1-19 | Demo, Privacy, Terms, and 404 expose route-specific title, description, canonical, and social metadata. | `site routes expose complete metadata, focused headings, shared links, and one build version`; live route crawl. |
| F-1-20 | Every route carries the same header and footer navigation. | Site-routes Playwright test; live Home/Privacy/Terms/404 crawl. |
| F-1-21 | Full-page routes focus their h1, and history navigation restores relevant focus. | Site-routes and landing-history Playwright tests; live 404 focus check; `.factory/screenshots/polish-3-live-404-mobile.png`. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | A direct demo visit does not request GitHub or any other origin. | `@claim:sample-demo`; live direct `/?demo=1` request log: zero cross-origin requests. |
| F-2-2 | Landing and legal copy identify hosted checkout and Dodo Payments as merchant of record. | `@claim:checkout-operator`; live `/terms/`; live release gate. |
| F-2-3 | The mobile demo heading clears the sticky banner. | `@claim:sample-demo`; live geometry: banner bottom 104.19 px, heading top 267.73 px; live demo screenshot. |
| F-2-4 | The first action remains “Try it with sample data.” | `@claim:sample-demo`; live first-screen screenshot. |
| F-2-5 | The exit action remains “Leave demo and use my records.” | `@claim:sample-demo`; live demo screenshot and exit check. |
| F-2-6 | The price heading remains “Three receipts are free.” | `@claim:price`; live `/`. |
| F-2-7 | Decorative “PLATE 01” lore remains absent. | `round-three public copy uses short, consistent plain words`; live home screenshot. |
| F-2-8 | Walkthrough copy describes the four stages without an unsupported provenance claim. | `.factory/copy-audit.md`; live `/` walkthrough. |
| F-2-9 | README does not promise an untested release-cache duration. | `@claim:release-api`; clean-clone browser run. |
| F-2-10 | Unsupported buyer restrictions remain absent; refunded-license behavior is explicit and tested. | `@claim:refund-revocation`; live `/terms/`. |
| F-2-11 | All routes render version 0.1.12 from the shared version module. | Site-routes Playwright test; live Home/Privacy/Terms/404 crawl. |
| F-2-12 | User-facing shipping copy says “Desktop app,” keeping Tauri in developer instructions. | `.factory/copy-audit.md`; README check. |
| F-2-13 | README describes an operating-system-aware download result, not a build directory. | `@claim:release-api`; README check. |
| F-2-14 | Privacy copy explains checking a paid-version code without API/token jargon. | `@claim:privacy-boundaries`; README and live `/privacy/`. |
| F-2-15 | Reader copy explains the temporary pause and recovery without HTTP/header jargon. | `@claim:license-rate-policy`; `round-three public copy uses short, consistent plain words`. |
| F-2-16 | Receipt input is consistently called “receipt photos” or the action “add receipts.” | `round-three public copy uses short, consistent plain words`; `.factory/copy-audit.md`. |

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Added `release-candidate` to the claims manifest and tagged the production-helper test exactly once. | `npm run test:release-contract -- -t @claim:release-candidate`; clean-clone 25/25 claim run. |
| F-3-2 | Split the 24-word release instruction into three sentences of 6, 8, and 9 words. | `round-three public copy uses short, consistent plain words`; `.factory/copy-audit.md`. |
| F-3-3 | Replaced “preflight” with “release check.” | Same copy contract test; README Deploy section. |
| F-3-4 | Replaced “receipt intake” with “add receipts” across landing, README, Terms, claims, and desktop UI. | Same copy contract test; `@claim:price`; live `/` and `/terms/`. |
| F-3-5 | Replaced “per client in a service window” with “30 checks before a temporary pause.” | Same copy contract test; `@claim:license-rate-policy`; README. |
| F-3-6 | Replaced reader-facing “redacted” wording and export markers with “payment details removed.” | `@claim:redacted-exports`; `removes payment details` unit test; live walkthrough. |
| F-3-7 | The error-page h1 now says “Page not found.” | Site-routes Playwright test; live unknown route returned HTTP 404 with focused h1; `.factory/screenshots/polish-3-live-404-mobile.png`. |
| F-3-8 | Every footer link now says “Source on GitHub (external).” | Site-routes Playwright test; live route crawl; live 404 screenshot. |
| F-3-9 | Every route now uses the same linked icon-and-name wordmark, one-liner, links, and version disclosure. | Site-routes Playwright test; live route crawl; live Privacy and 404 screenshots. |

## Final visual and live evidence

- Local: `.factory/screenshots/polish-3-local-home-mobile.png`,
  `.factory/screenshots/polish-3-local-demo-mobile.png`,
  `.factory/screenshots/polish-3-local-privacy-mobile.png`, and
  `.factory/screenshots/polish-3-local-404-mobile.png`.
- Live: `.factory/screenshots/polish-3-live-home-mobile.png`,
  `.factory/screenshots/polish-3-live-demo-mobile.png`,
  `.factory/screenshots/polish-3-live-privacy-mobile.png`, and
  `.factory/screenshots/polish-3-live-404-mobile.png`.
- Live mobile Axe scans found zero serious or critical issues on Home, Demo,
  Privacy, Terms, and 404. `npm run verify:url` passed.
- The four desktop walkthrough images were recaptured from the 0.1.12 app
  after the final terminology pass; their visible labels match the live copy.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 30 ms, CLS 0.
- GitHub Actions run 33254132199 passed all six jobs. The published 91,392,504
  byte AppImage matched SHA-256
  `d7804e8a2d0bf004404cded737803f518ed33821ce314fed0590215a2503bb95`.
- Azure Static Web Apps deployment
  `32bf68df-4a01-4319-bae7-2a6d32254ce4` serves the exact candidate SHA in
  its `build-commit` metadata.
- `npm run verify:live-release -- bb83b40…` passed against production: release
  and deployment provenance matched, hosted checkout returned 200, the first
  30 paid-version checks returned 200, request 31 returned 429 with
  `Retry-After: 4`, hashed assets were immutable, and the unknown route was
  404.

No F-1, F-2, or F-3 finding remains unresolved.
