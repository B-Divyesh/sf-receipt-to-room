# Independent verification — FAIL

**Candidate:** `ee669f28e6cae54bf7618c2eb81651a5b7f92398`  
**Live URL:** <https://receipt-to-room.sociobot.in/>  
**Verified:** 2026-08-28 (fresh clone; no product-source changes made)

## Release decision

**FAIL.** The static landing deployment is byte-for-byte the candidate build,
but the actual installable desktop release is not the candidate, and the paid
checkout that the product advertises is unavailable.

### Release-blocking defects

1. **P0 — Native desktop download is an older build, not this candidate.**
   The live landing page offers `v0.1.0`, whose GitHub Release API reports
   `target_commitish` `ee7821ddcd559a55ef15f1de82e61106559cc052`. That is
   before this candidate; `git diff --stat ee7821d..ee669f2` contains 21 files,
   including `app/main.ts`, landing files, demo/claims, and tests. A user who
   clicks the live Linux download receives the old desktop binary, not the
   tested candidate. The downloaded AppImage SHA-256 did match that old
   release's `latest.json`, so the problem is release identity, not checksum
   corruption.

2. **P0 — The advertised purchase path is broken.**
   `GET https://api.sociobot.in/api/v1/products/receipt-to-room/checkout`
   returned **HTTP 404** on 2026-08-28. The visible “Buy the field kit” button
   leads there while promising a one-time $29 unlimited-intake/JSON-backup
   unlock. A buyer cannot purchase the advertised paid feature.

3. **P1 — The required server allowance cannot be confirmed.**
   No documented rate allowance appears in the repository or public copy. A
   single client made 30 distinct invalid-license verification requests in
   roughly two seconds to
   `/api/v1/products/receipt-to-room/verify`; all returned **200**, with no
   `429` and no `Retry-After` header. The required allowance enforcement is
   therefore unverified/absent for the factory product-unlock endpoint.

4. **P1 — Live hashed assets are not immutably cached.**
   The live JS, CSS, and AVIF response headers all say
   `Cache-Control: public, must-revalidate, max-age=30`; they lack
   `immutable` and a long lifetime despite hash-named files. This misses the
   declared caching policy.

5. **P1 — Unknown live routes are 200 landing pages, not the required 404.**
   `GET /not-a-real-route` returned **200** and the landing page. The deployed
   navigation fallback prevents the provided `404.html` from being served as a
   real not-found response.

## Mandatory claim tests — PASS

Installed with `npm ci` from the clean checkout, then ran every command in
`.factory/claims.json` exactly as listed. All passed against the shipped local
demo entry point:

| Claim | Command | Result |
| --- | --- | --- |
| Sample data stays separate | `npm run test:e2e -- --grep @claim:sample-demo` | PASS (1) |
| Receipt OCR runs on your computer | `npm run test:e2e -- --grep @claim:local-ocr` | PASS (1) |
| Free search and CSV export | `npm run test:e2e -- --grep @claim:csv-export` | PASS (1) |
| $29 one-time price/copy | `npm run test:e2e -- --grep @claim:price` | PASS (1) |
| OS-specific installer selection | `npm run test:e2e -- --grep @claim:release-api` | PASS (1) |

The claims file exists. Note that the `price` test asserts the link/copy, not
that its external checkout works; live verification found the 404 above.

## First-read result — PASS

Cold-opening the live page answered the three required questions in plain
words. It says it **turns receipts into room records**, names **renters and
homeowners** dealing with moves, repairs, or insurance questions, and presents
**“Try it with sample data”** with “See three room records right away.” One
click opens `?demo=1`, shows three realistic records, and displays the persistent
“Demo — sample data, nothing is saved to your real records” banner with Reset
demo and Start for real.

## Local build and product exercise

- `npm test`: **PASS**, 5/5 Vitest tests.
- `npm run build`: **PASS**; produced `dist/app` and `dist/site`; TypeScript
  checking is included in `build:app`.
- `npm run test:e2e`: **PASS**, 6/6 Playwright tests.
- `cargo test --manifest-path src-tauri/Cargo.toml`: **PASS** after installing
  the exact documented Linux Tauri dependencies; no Rust tests are defined.
- Native release attempted with `CI=true npm run tauri build`: compiled the
  release executable and created DEB/RPM bundles, but the local AppImage step
  failed with `failed to run linuxdeploy`. The unmodified command also rejects
  this container's `CI=1` (`invalid value '1' for '--ci'`; the CLI only accepts
  `true`/`false`). These are environment/tooling observations, not used as the
  release decision; the stale released binary is independently decisive.

Independent browser exercise of the desktop UI succeeded for normal and
recovery paths: typed two-item receipt, room/warranty review, search, CSV
download, deletion and Undo; blank text gave “Paste at least one item and
price, then try again.” OCR of the shipped receipt produced `DESK LAMP` locally.
The CSV had its expected header and did not contain the supplied payment digits.
Boundary quantity 1000 remained on review and reported “Value must be less
than or equal to 999.”

## Browser, privacy, accessibility, and deployment evidence

- Live desktop and 390px mobile: no horizontal overflow; demo has three records;
  no console errors or page errors; visible keyboard focus is a solid 3px ring.
- Axe (`@axe-core/playwright`) on the live desktop/mobile landing/demo and local
  desktop workflow: **0 serious/critical violations**.
- Reduced motion: app transition duration became `1e-05s` under
  `prefers-reduced-motion: reduce`.
- Local OCR workflow sent no HTTP(S) request outside the local origin. The only
  non-origin entry was its generated `blob:` CSV URL. The live landing made
  same-origin requests plus the disclosed GitHub Releases API request; no
  analytics/tracking request was observed.
- Live headers include HSTS, `nosniff`, Referrer-Policy, Permissions-Policy,
  and a CSP matching the GitHub API and Sociobot license origin. Privacy and
  terms routes returned 200. The cache and 404 defects are listed above.
- Candidate/live static identity: local and live `index.html`,
  `assets/main-DvkpMI9S.js`, and `assets/styles-C31zv3Tz.css` had identical
  SHA-256 values (`a162…8405`, `23a8…7bb2`, and `6ceb…69ab` respectively).
  This confirms the site, but not the native release, is candidate-equivalent.
- Static landing bundle budget passes: JS 2.13 KB gzip, CSS 2.96 KB gzip, and
  mobile hero AVIF 27 KB. The desktop OCR runtime is bundled with the native
  app and is not a static-site initial-load budget.

## Required next steps

1. Register/fix the Sociobot billing product so checkout is a successful hosted
   purchase flow, then verify a purchase/restore path.
2. Tag and publish a new native release from `ee669f2` (new version), with
   current DMG/MSI/EXE/AppImage/DEB assets, `SHA256SUMS`, and `latest.json`.
   Recheck one downloaded artifact against its manifest.
3. Document and enforce a per-client product-unlock allowance with `429` and a
   `Retry-After` header.
4. Configure immutable long-lived caching for hashed assets and a true HTTP 404
   route in the static deployment, then rerun live verification.
