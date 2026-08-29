# Receipt to Room adversarial review 1 handoff — FAIL

## What was done

- Wrote `.factory/review-1.md` with the cold mobile/desktop first read, complete
  landing/README sentence counts, demo and storage checks, claim results,
  routing/metadata/link/accessibility checks, history verification, missed
  leverage, and concrete fixes.
- Reviewed the live `v0.1.5` site against repository commit
  `05e94e78ce796b54fc057031d87db3eb37874494`.
- Made no product-code changes.

## Result

**FAIL:** 3 blocking findings, 9 claim-coverage findings, and 9
copy/structure findings.

The blocking issues are broken Back behavior after entering the landing demo,
a direct demo visit writing release metadata to a non-demo storage key, and the
missing 3–5 frame desktop-app walkthrough. Full details and exact fixes are in
`.factory/review-1.md`.

## Verification performed

- Every one of the 17 commands in `.factory/claims.json` passed individually
  from clean clone `/tmp/receipt-claims-clean.O7VwK3`.
- `npm test`: 12/12 passed.
- `npm run build`: passed; `dist/app` and `dist/site` produced.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: passed.
- `npm run verify:live-release -- 1cab44ef8befe26a157548195bcc0bb8b87ec150 https://receipt-to-room.sociobot.in`:
  passed.
- Fresh Playwright checks at 390×844 and 1440×900 covered first view, demo,
  Reset, real-record sentinel isolation, direct-demo storage, Back, metadata,
  focus, request logs, 404, and link crawling.
- Axe reported no serious or critical violations on Home, Demo, Privacy,
  Terms, or 404 at 390 px.

## What remains

Address F-1-1 through F-1-21, add the missing regression/claim tests, deploy a
new candidate, and rerun the complete review. PASS requires zero findings.
