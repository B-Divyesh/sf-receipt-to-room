# Receipt to Room review 4 handoff

## Outcome

**FAIL** on 2026-08-29 UTC for repository base `7c98355` and live product build
`7683c0d` (`v0.1.13`). Product code was not modified.

The first read, demo, copy, claims, privacy, links, metadata, accessibility
scan, build, and test gates pass. One blocking regression remains: navigation
back to Home leaves focus on `<body>` and provides no route announcement. This
reopens F-1-21; full evidence and the required fix are in
`.factory/review-4.md`.

## What was done

- Opened production cold in fresh 390×844 and 1440×900 Chromium contexts.
- Exercised one-click demo entry, search, Reset, exit, storage sentinels,
  requests, cookies, and Home/Demo history.
- Audited every landing and README sentence, heading, action, term, and public
  claim.
- Read and rechecked every finding from reviews 1–3 and every polish report.
- Checked titles, descriptions, canonicals, social metadata, icons, h1/main,
  designed 404, headers/footers, deep links, Back/Forward, focus, links, mobile
  overflow, live Axe results, security headers, and design identity.
- Assessed AI, import/export, and sync leverage; no missing feature was found.

## Verification

From fresh clone `/tmp/receipt-review4-claims.lXnwUy/clone`:

```sh
npm ci
# Every test command in .factory/claims.json, separately: 25/25 passed
npm test                 # 19/19 passed
npm run build            # produced dist/app and dist/site
npm run test:e2e         # 22/22 passed
npm run verify:url -- https://receipt-to-room.sociobot.in
```

Independent live Playwright checks found zero Axe violations on Home, Demo,
Privacy, Terms, and 404; no dead actionable links; zero cross-origin requests
or cookies on direct demo entry; and unchanged real-storage sentinels.

## Remaining work

Implement the F-1-21 fix without changing cold-load skip-link behavior. Add
tests for Demo/Privacy/Terms/404 → Home and cross-page Back/Forward that require
Home’s h1 to receive focus and a polite route announcement. Re-run review 5 from
scratch; do not pass based only on the repair test.
