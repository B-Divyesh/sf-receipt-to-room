# Receipt to Room

Turn receipts into room records. Receipt to Room is for renters and homeowners
who need purchase details after a move, repair, or insurance question. The
desktop app reads receipt text on your computer. Each line has its own room,
category, and warranty date. Saved items remain editable.

The app does not scrape retailers. It does not estimate current value. It does
not file insurance claims. Keep original receipts where another party requires
them.

## What ships

- Tauri 2 desktop app for Windows, macOS, and Linux
- Reads English receipt text on your computer, including several photos in a queue
- Manual entry with per-line room, category, warranty, and saved-item editing
- Spreadsheet download with payment details removed, printable output, and five-second undo
- Free version for three receipts; $29 once for unlimited receipt intake and backup files
- Static, operating-system-aware download site in `dist/site`

## Try the demo

Open `https://receipt-to-room.sociobot.in/?demo=1` or choose **Try the demo**
on the landing page. The demo immediately shows three reviewed room records.
In the app, choose **Load demo records** on the first screen. Demo records use
only `demo:receipt-to-room:*` storage. They never read or write real inventory.
See [.factory/demo.md](.factory/demo.md).

## Develop

Requirements: Node.js 22+, npm, Rust stable, and the platform dependencies from
the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev          # desktop UI in a browser
npm run tauri dev    # native desktop shell
```

The text-reading files come from pinned packages. They are bundled with the
app. No files load from outside services at runtime.

## Test and build

```sh
npm test
npm run build        # app -> dist/app, landing site -> dist/site
npm run build:site   # deployment command; index.html -> dist/site/index.html
npm run test:e2e     # Chromium accessibility + end-to-end checks
npm run verify:url -- https://receipt-to-room.sociobot.in
cargo check --manifest-path src-tauri/Cargo.toml
```

## Install

The site checks GitHub for the latest release. It saves those details for one
hour. It then shows the installer for your operating system. If details are
unavailable, it links to the release page. Builds are unsigned.

```sh
curl -fsSL https://receipt-to-room.sociobot.in/install.sh | sh
```

```powershell
irm https://receipt-to-room.sociobot.in/install.ps1 | iex
```

The install scripts check each download against its published checksum. macOS
users may need to right-click the app and choose **Open**. Windows may show a
SmartScreen publisher warning.

## Privacy and paid version

Inventory lives in local app storage. The only product API call checks an
optional paid-version token at `api.sociobot.in`. Its result is saved for one
day. Spreadsheet and printable exports remain available in the free version.
See `/privacy/` and `/terms/` on the site.

The token service allows 30 checks per client in a service window. Further
checks return `429` with `Retry-After`. The app always shows a wait of at least
one second before the next attempt.

## Deploy

Deploy the contents of `dist/site` as a static site. Do not deploy `dist/app`.
GitHub Actions builds native bundles after a `v*` tag or manual dispatch. A
native release publishes installers, checksums, and a release manifest.

## License

MIT — see [LICENSE](LICENSE).
