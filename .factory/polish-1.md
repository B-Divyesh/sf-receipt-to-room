# Polish 1 — adversarial review repair map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | URL-derived demo state now handles `popstate`, restores title, visibility, scroll, and focus. | `landing history restores URL, metadata, focus, and demo state` Playwright test |
| F-1-2 | Release metadata uses a `demo:` key in demo mode; direct demo regression checks normal keys stay untouched. | `@claim:sample-demo` |
| F-1-3 | Added four original captures of real desktop demo, review, placement, and export states. | `site/public/assets/walkthrough-*.png`; landing walkthrough |
| F-1-4 | Replaced merchant claim with the testable “Payment opens on Sociobot.” | `@claim:checkout-operator` |
| F-1-5 | Removed visitor-facing generated-imagery assertion; source provenance remains in design documentation. | `.factory/design.md` |
| F-1-6 | Added exact scope boundary claim and contract test. | `@claim:scope-boundaries` |
| F-1-7 / F-1-12 | Added release trigger claim coverage. | `@claim:release-trigger` |
| F-1-8 | Added native release artifact claim coverage. | `@claim:release-artifacts` |
| F-1-9 | Added installer checksum claim coverage for shell and PowerShell paths. | `@claim:installer-integrity` |
| F-1-10 | Replaced vague accessibility promise with free spreadsheet/print export promise. | `@claim:free-exports` |
| F-1-11 | Removed the false manifest-completeness statement and added the missing claim entries. | `npm test` claim inventory contract |
| F-1-13 to F-1-18 | Rewrote README and landing copy in plain words; standardized demo records and paid version. | `.factory/copy-audit.md` |
| F-1-19 | Demo updates canonical, description, Open Graph, and Twitter metadata; sitemap lists demo; all static routes have complete metadata. | landing history test; `npm run build` |
| F-1-20 | Made legal/404 header and footer link sets consistent with the landing page. | Playwright accessibility crawl |
| F-1-21 | Added focus-on-load module for legal and 404 pages. | route focus module; Playwright accessibility crawl |

## Screenshots

- `site/public/assets/walkthrough-load.png`
- `site/public/assets/walkthrough-review.png`
- `site/public/assets/walkthrough-assign.png`
- `site/public/assets/walkthrough-export.png`

## Live recheck

Deployed `dist/site` to `sf-receipt-to-room` production. Cold checks at
`https://receipt-to-room.sociobot.in/` and `?demo=1` passed on 2026-08-29:

- `/tmp/receipt-live-demo.png` shows the 390 px live demo state.
- Live Back returned to `/` with the home title, hidden banner, and focused h1.
- Live Forward restored `?demo=1#sample`, demo title/banner, and `#sample-title`
  focus.
- Playwright Axe found zero serious or critical issues on Home, Demo, Privacy,
  Terms, and 404. `verify-url.sh` passed for Home.
