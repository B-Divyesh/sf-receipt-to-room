# Receipt to Room — polish 4 handoff

## Outcome

**PASS** on 2026-08-29 UTC. The released source is
`7ddbd63b0ac262d1f4afcd0292e18beaaca858c9` (`v0.1.15`), and production serves
that exact SHA at <https://receipt-to-room.sociobot.in/>.

This round closes F-4-1 / reopened F-1-21 completely. Same-origin navigation
now uses one shared mechanism for intent markers, history restoration, h1/h2
focus, visible focus treatment, and polite route announcements. The landing
page deliberately keeps its cold-load skip-link behavior; Home receives focus
only after Demo exit, a same-origin return, or browser Back/Forward.

## What changed

- Added `site/route-navigation.ts`, used by both the landing and static-route
  focus modules.
- Prevented the demo exit link from doing a full reload. It now changes the
  URL through History API, clears only demo storage, focuses Home’s h1, and
  announces “Home.”
- Added the shared `#route-announcement` polite live region to Home, Privacy,
  Terms, and 404.
- Added a designed focus ring for route headings that remains visible after
  pointer-triggered returns, not just keyboard-triggered ones.
- Added 390 px Playwright coverage for Demo → Home, Privacy/Terms/404 → Home,
  and cross-page Back/Forward. It asserts URL, focused heading, visible ring,
  and announcement.
- Bumped the aligned desktop/site release identity to `0.1.15`.
- Updated the catalog sentence: “Turn receipt photos into room records you can
  search on your computer.”

## Verification

From clean clone `/tmp/receipt-to-room-polish4-final-claims.w5C9IN/clone` at
the final main branch:

```sh
npm ci
# each .factory/claims.json command separately: 25/25 passed
npm test                 # 19/19 passed
npm run build            # produced dist/app and dist/site
npm run test:e2e         # 24/24 passed
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

The final 390 px Axe sweep found zero serious or critical findings, no console
errors, and no horizontal overflow on `/`, `/?demo=1#sample`, `/privacy/`,
`/terms/`, and `/404.html`. `npm run verify:url -- https://receipt-to-room.sociobot.in/`
passed after deployment.

Live checks also confirmed direct demo creates only `demo:` storage, makes no
cross-origin request, and returns Home with a focused, visibly outlined h1 and
the “Home.” announcement. Demo → Home, all legal/404 → Home links, and
Privacy Back/Forward were rechecked in fresh 390 px contexts.

Evidence screenshots:

- `.factory/screenshots/polish-4-live-home-mobile.png`
- `.factory/screenshots/polish-4-live-demo-mobile.png`
- `.factory/screenshots/polish-4-live-home-return-mobile.png`

Release workflow [33262752611](https://github.com/B-Divyesh/sf-receipt-to-room/actions/runs/33262752611)
completed all six jobs. The v0.1.15 release has macOS ARM/Intel DMGs, Windows
MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`. Its target
commit and manifest `sourceCommit` are both `7ddbd63`. Downloaded
`Receipt.to.Room_0.1.15_amd64.deb` SHA-256
`4a2951bbbee7d2d97aec6d0c86c729781efeaad776d1f97088673628460a49e3`
matches the published checksum.

Static deployment used `/opt/fleet/lib/deploy-static.sh receipt-to-room
dist/site`; Azure deployment ID `6c01d12b-0592-4cf8-bffc-b4e65eae3e50`
completed successfully. Live Home has build-commit `7ddbd63`.

## Run locally

```sh
npm ci
npm run dev:site
npm run dev
npm test
npm run test:e2e
npm run build
```

Try the website demo with `/?demo=1#sample`. In the desktop app, choose **Load
demo records** on its first screen.

## Known gaps and operator action

No review finding or product defect remains open. Native bundles are unsigned,
as stated on the site and in the README. No signing secrets are configured in
the workflow; if signing is later required, the owner must add the relevant
Apple certificate/notarization and Windows Authenticode secrets before changing
the release workflow.
