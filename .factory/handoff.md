# Receipt to Room — repair 12 handoff

## Outcome

The release-blocking P1 finding in verifier commit `7c182ac` is repaired for
desktop release `v0.1.17`. The researched receipt workflow, all 25 declared
claims, local-first storage, demo isolation, paid version, artifact class, and
static deployment class are unchanged.

`.factory/brief.json` is absent from this repository. The supplied work order,
product contract, and preserved `.factory/design.md` remain the scope sources.

## Reproduced finding and root cause

Independent verification recorded a cold mobile Lighthouse run at Performance
66 with LCP 3.33 s. The 768 px AVIF illustration was the LCP element. That trace
assigned 1.36 s to image request delay and 1.34 s to render delay. It also loaded
four full-size walkthrough PNGs during the initial path. Evidence remains in
`.factory/evidence-14/lighthouse-mobile-retry.json`.

The root cause was an image-dependent mobile LCP with no document-head preload,
an oversized minimum responsive candidate, asynchronous LCP decoding, and
uncontained below-fold rendering. A cold server or busy renderer could delay
the largest visible element past the 2.5 s budget.

## Repair

- The document head now preloads the same responsive WebP source used by the
  hero `<picture>`, with `fetchpriority="high"`, matching `imagesrcset`, and
  matching `imagesizes`.
- New 384 px and 672 px AVIF/WebP derivatives prevent a phone from fetching the
  768 px minimum candidate. The phone layout uses a 200 px specimen thumbnail,
  making the HTML headline the mobile LCP element.
- The LCP image no longer requests asynchronous decoding.
- The four walkthrough captures now have 480, 720, and 960 px WebP candidates.
  Off-screen sections use `content-visibility: auto` with an intrinsic size.
- Initial mobile transfer fell from 306.9 KB in the failed verifier trace to
  107.7 KB in each final local Lighthouse run.
- npm, Cargo, and Tauri versions moved together to `0.1.17` for new native
  release assets.

The visual thesis now records the intentional mobile specimen-thumbnail
treatment. Original source art and provenance are unchanged.

## Exact regression coverage

- `tests/release-contract.test.ts` checks for a high-priority responsive preload,
  matching phone candidates and sizes, non-async LCP decoding, responsive
  walkthrough sources, and off-screen layout containment.
- `tests/e2e/product.spec.ts` uses a fresh 390×844 context with constrained 4G
  and 4× CPU slowdown. It asserts one 384 px hero request, no 768/1536 px hero
  request, the 200 px phone treatment, the headline as the LCP element, and LCP
  below 2.5 s.

## Clean verification evidence

Evidence is in `.factory/repair-12-evidence/`.

- Clean `npm ci`: 84 packages, zero audit vulnerabilities.
- `npm test`: 21/21 passed.
- `npm run test:release-contract`: 14/14 passed.
- `npx tsc --noEmit`: passed. There is no separate JavaScript lint script.
- `npm run build`: passed and produced `dist/app` plus `dist/site`.
- `npm run test:e2e`: 26/26 passed with Playwright `1.58.2`.
- Every exact command in `.factory/claims.json`: 25/25 passed independently.
- `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, and
  `cargo clippy --locked -- -D warnings`: passed. The thin Rust shell has zero
  unit tests; browser tests exercise its bundled application UI.
- `npm run verify:url -- http://127.0.0.1:4173`: passed with one main and h1,
  `lang=en`, complete alt text, no overflow, and no console or page errors.
- Browser coverage includes desktop and 390 px screenshots, keyboard-only
  focus and routing, designed focus rings, touch targets, reduced-motion
  behavior, 200% browser zoom without overflow, Axe scans with no
  serious/critical findings, demo reset/isolation,
  local OCR, receipt review/edit/search/export/print/remove/undo, error recovery,
  offline work, license caching/throttling/revocation, and request privacy.
- Site bundles are 9.37 KB JavaScript gzip combined and 3.19 KB CSS gzip.

Three clean production Lighthouse mobile runs:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 0.906 s | 1.356 s | 0 ms | 0 | 107,710 B |
| 2 | 100 | 100 | 100 | 100 | 0.911 s | 1.361 s | 0 ms | 0 | 107,710 B |
| 3 | 100 | 100 | 100 | 100 | 0.908 s | 1.358 s | 0 ms | 0 | 107,710 B |

Each run identifies `main#main > section.hero > div.hero-copy > h1` as LCP.
Raw reports and the compact summary are in the evidence directory.

## Release and deployment

Tag `v0.1.17` must point at the final commit containing this handoff. The release
workflow builds `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` packages on the
three platform runners, then publishes `SHA256SUMS` and `latest.json`.

The static deployment command is:

```sh
BUILD_SOURCE_COMMIT="$(git rev-list -n 1 v0.1.17)" npm run build:site
/opt/fleet/lib/deploy-static.sh receipt-to-room dist/site
```

The post-deploy gate is:

```sh
npm run verify:release-candidate -- v0.1.17 "$(git rev-list -n 1 v0.1.17)"
npm run verify:live-release -- "$(git rev-list -n 1 v0.1.17)" https://receipt-to-room.sociobot.in
npm run verify:url -- https://receipt-to-room.sociobot.in
```

## Known gaps and operator action

- Native installers remain intentionally unsigned. Apple notarization needs
  `APPLE_CERTIFICATE`; Windows Authenticode needs `WINDOWS_CERT_PFX`. The
  landing page discloses unsigned releases.
- The app has no updater, so it intentionally ships no updater manifest. Users
  install a newer release from the download page.
