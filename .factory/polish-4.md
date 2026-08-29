# Polish 4 — complete adversarial repair map

Release candidate: `7ddbd63b0ac262d1f4afcd0292e18beaaca858c9`
(`v0.1.15`). Live URL: <https://receipt-to-room.sociobot.in/>.

Every command in `.factory/claims.json` was run separately from the clean
clone at `/tmp/receipt-to-room-polish4-final-claims.w5C9IN/clone`. All 25
passed. The final live check used cold 390 px contexts on Home, Demo, Privacy,
Terms, and 404, plus a pointer-initiated Home-return matrix.

## Review 1 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo state is URL-derived and history restores state, metadata, scroll, focus, and announcement. | `landing history restores URL, metadata, focus, and demo state`; live `/?demo=1#sample` Back/Forward check. |
| F-1-2 | Demo writes only `demo:` keys and pauses release lookup. | `@claim:sample-demo`; live direct-demo storage/request check. |
| F-1-3 | Four captioned app workflow captures remain on the landing page. | `site/public/assets/walkthrough-*.png`; live Home check. |
| F-1-4 | Checkout wording names the hosted Dodo Payments flow. | `@claim:checkout-operator`; live `/terms/`. |
| F-1-5 | The untestable visitor-facing art provenance statement remains removed. | Live Home copy check; `.factory/design.md` remains the source record. |
| F-1-6 | Product boundaries have the declared `scope-boundaries` contract claim. | `@claim:scope-boundaries`. |
| F-1-7 | Tag/manual native release behavior is declared and tested. | `@claim:release-trigger`; Actions run 33262752611. |
| F-1-8 | Installer, checksum, and manifest release outputs are contract-tested. | `@claim:release-artifacts`; `v0.1.15` release assets. |
| F-1-9 | Both installer paths reject a checksum mismatch before installation. | `@claim:installer-integrity`. |
| F-1-10 | Free spreadsheet and printable export availability is exact and tested. | `@claim:free-exports`. |
| F-1-11 | The false completeness sentence stays absent; manifest coverage is enforced. | `npm test`; 25 clean-clone claim commands. |
| F-1-12 | Native release production is owned by the release-trigger claim. | `@claim:release-trigger`; `.github/workflows/release.yml`. |
| F-1-13 | Public prose remains split into short sentences. | `.factory/copy-audit.md`; live Home and README audit. |
| F-1-14 | Reader copy uses “receipt text,” not OCR jargon. | `.factory/copy-audit.md`; live Home. |
| F-1-15 | Reader copy uses spreadsheet, backup file, and payment-details-removed language. | `@claim:csv-export`, `@claim:backup-restore`, `@claim:redacted-exports`. |
| F-1-16 | The unsupported “useful” free-tier label remains absent. | `@claim:price`; live price section. |
| F-1-17 | The paid action names unlimited receipts and the $29 price. | `@claim:price`; live price section. |
| F-1-18 | The mode is consistently “demo” and its contents “demo records.” | `@claim:sample-demo`; live Demo. |
| F-1-19 | Home, Demo, Privacy, Terms, and 404 expose complete route metadata. | `site routes expose complete metadata, focused headings, shared links, and one build version`; live route crawl. |
| F-1-20 | Header/footer links and identity are shared on every route. | Same route test; live Home, legal, and 404 crawl. |
| F-1-21 | Shared route navigation now marks same-origin transitions, restores Home heading focus on Demo/legal/404/Back paths, announces each route, and paints a designed heading focus ring. | `Home returns focus and announces every same-origin route change`; `cross-page Back and Forward focus and announce the restored route`; `.factory/screenshots/polish-4-live-home-return-mobile.png`; live URL matrix. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Direct demo never requests GitHub or another origin. | `@claim:sample-demo`; live direct-demo request log. |
| F-2-2 | Payment language and the recorded checkout result both identify Dodo Payments. | `@claim:checkout-operator`; live `/terms/`. |
| F-2-3 | Mobile demo focus clears the sticky banner. | `@claim:sample-demo`; `.factory/screenshots/polish-4-live-demo-mobile.png`. |
| F-2-4 | The first action remains “Try it with sample data.” | `@claim:sample-demo`; live Home. |
| F-2-5 | The exit action remains “Leave demo and use my records.” | `@claim:sample-demo`; live Demo. |
| F-2-6 | The price heading remains “Three receipts are free.” | `@claim:price`; live Home. |
| F-2-7 | Decorative “PLATE 01” lore remains absent. | Copy audit; live Home screenshot. |
| F-2-8 | Walkthrough copy describes stages without an unsupported provenance claim. | `.factory/copy-audit.md`; live Home. |
| F-2-9 | No untested download-cache duration is promised. | `@claim:release-api`; README audit. |
| F-2-10 | Unsupported buyer restrictions remain absent; revoked paid-version behavior is tested. | `@claim:refund-revocation`; live `/terms/`. |
| F-2-11 | Every route renders the shared v0.1.15 build disclosure. | Site-routes test; live route crawl. |
| F-2-12 | Reader-facing shipping copy says “Desktop app.” | `.factory/copy-audit.md`; README audit. |
| F-2-13 | README describes OS-aware downloads rather than build folders. | `@claim:release-api`; README audit. |
| F-2-14 | Privacy copy describes paid-code checking without API/token jargon. | `@claim:privacy-boundaries`; live `/privacy/`. |
| F-2-15 | Rate-limit copy explains the temporary pause and recovery plainly. | `@claim:license-rate-policy`; README audit. |
| F-2-16 | Input is consistently “receipt photos” / “add receipts.” | Copy audit; `@claim:image-input`; live Home. |

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | `release-candidate` has one exact tagged contract test. | `@claim:release-candidate`. |
| F-3-2 | Release instructions remain three short sentences. | `.factory/copy-audit.md`; README audit. |
| F-3-3 | “Preflight” remains replaced by “release check.” | `.factory/copy-audit.md`; README audit. |
| F-3-4 | “Receipt intake” remains replaced by “add receipts.” | `@claim:price`; Home, README, and Terms audit. |
| F-3-5 | Rate language says “30 checks before a temporary pause.” | `@claim:license-rate-policy`; README audit. |
| F-3-6 | Reader copy says payment details are removed. | `@claim:redacted-exports`; live walkthrough. |
| F-3-7 | The 404 h1 is “Page not found.” | Site-routes test; live `/404.html`. |
| F-3-8 | External source links identify GitHub as their destination. | Site-routes test; live footer crawl. |
| F-3-9 | Every footer has the linked wordmark, one-liner, links, and build disclosure. | Site-routes test; live route crawl. |

## Review 4 finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 / reopened F-1-21 | Added `route-navigation.ts` for same-origin route markers, history restoration, focus, and polite announcements; Home preserves the cold-load skip link but receives a visible focus ring after every route return. | `Home returns focus and announces every same-origin route change`; `cross-page Back and Forward focus and announce the restored route`; `.factory/screenshots/polish-4-live-home-return-mobile.png`; live Home return matrix. |

## Final evidence

- Clean clone: all 25 declared claim commands passed separately from
  `/tmp/receipt-to-room-polish4-final-claims.w5C9IN/clone`.
- Local: `npm test` (19 tests), `npm run build`, `npm run test:e2e` (24 tests),
  `cargo check`, and `cargo test` passed.
- Accessibility: Axe found zero serious/critical violations on the five 390 px
  routes; the same sweep found no console errors or horizontal overflow.
- Live screenshots: `.factory/screenshots/polish-4-live-home-mobile.png`,
  `.factory/screenshots/polish-4-live-demo-mobile.png`, and
  `.factory/screenshots/polish-4-live-home-return-mobile.png`.
- Release: `v0.1.15` is bound to `7ddbd63`; its `latest.json`, checksums, and
  macOS, Windows, and Linux assets are checked after the release workflow.

No review finding remains unresolved.
