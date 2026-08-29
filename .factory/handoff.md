# Receipt to Room review 3 handoff

## Outcome

**FAIL** for commit `2779420657f9add5310ea5557245e998378dcb38` and the
live v0.1.10 site. Product code was not changed.

The full adversarial report is in `.factory/review-3.md`. It records no
blocking defect and nine minor findings: one unlisted release-candidate claim,
one sentence over 22 words, four plain-language/terminology issues, a
metaphorical 404 h1, an external source link without an external label, and an
inconsistent footer treatment.

## What was verified

- Cold first read at 390×844 and 1440×900.
- One-click demo content, banner, Reset, exit path, storage isolation, request
  log, and focused mobile layout.
- All 24 commands in `.factory/claims.json`, invoked individually from a clean
  clone; all passed.
- `npm test` (17/17), `npm run build`, and `npm run test:e2e` (21/21) from the
  clean clone.
- Live Home, Demo, Privacy, Terms, and 404 metadata, semantics, focus, 390 px
  layout, touch targets, console, request behavior, and WCAG A/AA axe scans.
- Back/Forward demo state, internal/external link health, Dodo checkout
  redirect, current downloads, security headers, assets, and visual identity.
- Every F-1 and F-2 finding against both the live site and current source.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run verify:url -- https://receipt-to-room.sociobot.in
```

Run each command named in `.factory/claims.json` individually from a clean
clone. Direct demo verification uses
`https://receipt-to-room.sociobot.in/?demo=1#sample` in a fresh browser context.

## Evidence

- `.factory/review-3.md`
- `.factory/review-3-evidence/cold-mobile.png`
- `.factory/review-3-evidence/cold-desktop.png`
- `.factory/review-3-evidence/demo-first-screen-mobile.png`

## Work left

Resolve F-3-1 through F-3-9, then repeat the complete review. A passing round
requires zero findings and no unlisted claim. `.factory/brief.json` remains
absent. Native packages remain intentionally unsigned and disclose that fact;
this is not a review defect.
