# Receipt to Room adversarial review 2 handoff

## Delivered

- Added `.factory/review-2.md` with a fresh phone/desktop cold read, complete
  landing/README copy audit, demo and storage checks, all-claims gate, live
  routing/link/accessibility checks, prior-finding verification, missed-leverage
  assessment, and a FAIL verdict.
- No product code was changed.

## Verification

- Installed the locked dependencies with `npm ci`.
- Ran every command in `.factory/claims.json` individually: all 23 passed.
- `npm run verify:url -- https://receipt-to-room.sociobot.in`: passed.
- Live axe scans at 390 px: zero violations on Home, Demo, Privacy, Terms, and
  the designed 404.
- Live link crawl: all linked documents, downloads, source, and checkout paths
  returned 200 after redirects; an unknown route returned the designed 404.
- Live demo: realistic rows, search, Reset, Back/Forward, focus, and demo-only
  storage were exercised with seeded real-storage sentinels.

## Known gaps

The review records three blockers and thirteen minor findings. Most important:
the demo calls GitHub, payment copy contradicts the checkout's merchant-of-
record disclosure, and the mobile demo banner clips the focused heading. See
`.factory/review-2.md` for exact evidence and fixes.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run verify:url -- https://receipt-to-room.sociobot.in
```

Run each `.factory/claims.json` `test` command separately for the claims gate.
