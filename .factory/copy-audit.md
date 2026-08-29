# Copy audit — polish 3

Counts use whitespace-delimited words and ignore a standalone dash. Every
reader-facing landing and README sentence is at most 22 words. No banned
marketing word appears.

## First screen

| Sentence | Words | Purpose |
| --- | ---: | --- |
| Turn receipts into room records. | 5 | Job headline |
| For renters and homeowners who need purchase details after a move, repair, or insurance question. | 15 | Audience and situation |
| See three demo records right away. | 6 | Action result |
| Demo records stay separate. | 4 | Privacy fact |
| Receipt text is read on your computer. | 7 | Processing fact |
| $29 once for unlimited receipts. | 5 | Price fact |
| Identify the line. | 3 | Illustration caption |
| Check the detail. | 3 | Illustration caption |
| Place it in a room. | 5 | Illustration caption |

Primary action: **Try it with sample data**. It names the result and remains
visible at 390×844 without scrolling.

## Remaining landing sentences

| Sentence | Words |
| --- | ---: |
| Demo — sample data, nothing is saved. | 6 |
| Three reviewed purchases are ready to search. | 7 |
| These demo records never read or change your real records. | 10 |
| No sample records match that search. | 6 |
| Sample reset. | 2 |
| Read, check, and file each receipt. | 6 |
| Choose receipt photos in the desktop app. | 7 |
| Correct item names, prices, rooms, and warranty dates before saving. | 10 |
| Search by room or item. | 5 |
| Download a spreadsheet with payment details removed. | 7 |
| See the receipt workflow before installing. | 6 |
| The four frames show loading, review, room assignment, and export. | 10 |
| Open three reviewed records without touching your own. | 8 |
| Check names, prices, and which lines to save. | 8 |
| Give every line its room, category, and warranty date. | 9 |
| Find a record later and download a spreadsheet with payment details removed. | 12 |
| Receipt work stays on your computer. | 6 |
| The desktop app reads receipt text on your computer. | 9 |
| Read the privacy note for storage and paid-version details. | 9 |
| Three receipts are free. | 4 |
| The free app includes search, spreadsheet download, and printable output. | 10 |
| Pay $29 once to add unlimited receipts and use backup files. | 11 |
| Payment opens in a hosted checkout. | 6 |
| Install Receipt to Room. | 4 |
| Choose the installer for your computer. | 6 |
| Releases are unsigned. | 3 |
| Checking the latest release. | 4 |
| Downloads are being published. | 4 |
| Check the release page again soon. | 6 |
| Installer checks are paused during the demo. | 7 |
| A local room record for reviewed receipts. | 7 |

## README sentences and statements

| Sentence or statement | Words |
| --- | ---: |
| Turn receipts into room records. | 5 |
| Receipt to Room is for renters and homeowners who need purchase details after a move, repair, or insurance question. | 19 |
| The desktop app reads receipt text on your computer. | 9 |
| Each line has its own room, category, and warranty date. | 10 |
| Saved items remain editable. | 4 |
| The app does not scrape retailers. | 6 |
| It does not estimate current value. | 6 |
| It does not file insurance claims. | 6 |
| Keep original receipts where another party requires them. | 8 |
| Desktop app for Windows, macOS, and Linux | 7 |
| Reads English receipt text on your computer, including several photos in a queue | 13 |
| Manual entry with per-line room, category, warranty, and saved-item editing | 10 |
| Spreadsheet download with payment details removed, printable output, and five-second undo | 11 |
| Free version for three receipts; $29 once to add unlimited receipts and use backup files | 15 |
| Download page that recommends the installer for your computer | 9 |
| Open the demo URL or choose Try it with sample data on the landing page. | 14 |
| The demo immediately shows three reviewed room records. | 8 |
| In the app, choose Load demo records on the first screen. | 11 |
| Demo records use only demo-prefixed storage. | 6 |
| They never read or write real inventory. | 7 |
| The text-reading files come from pinned packages. | 7 |
| They are bundled with the app. | 6 |
| No files load from outside services at runtime. | 8 |
| The site checks GitHub for the latest release. | 8 |
| It then shows the installer for your operating system. | 9 |
| If details are unavailable, it links to the release page. | 10 |
| Builds are unsigned. | 3 |
| The install scripts check each download against its published checksum. | 10 |
| macOS users may need to right-click the app and choose Open. | 11 |
| Windows may show a SmartScreen publisher warning. | 7 |
| Inventory lives in local app storage. | 6 |
| The app contacts api.sociobot.in only when you check a paid-version code. | 11 |
| Its result is saved for one day. | 7 |
| Spreadsheet and printable exports remain available in the free version. | 10 |
| The paid-version service allows 30 checks before a temporary pause. | 10 |
| It then tells the app how long to wait. | 9 |
| The app always shows a wait of at least one second before the next attempt. | 15 |
| Deploy the contents of dist/site as a static site. | 9 |
| Do not deploy dist/app. | 4 |
| GitHub Actions builds native bundles after a version tag or manual dispatch. | 12 |
| A native release publishes installers, checksums, and a release manifest. | 10 |
| Tag only the final committed candidate. | 6 |
| Run the release check before pushing the tag. | 8 |
| It rejects a tag that points to another commit. | 9 |

Developer requirement lines and code commands are excluded from reader-facing
wording checks. Their terms are necessary to run, test, and deploy the project.

## Terminology

| Concept | One reader-facing term |
| --- | --- |
| Isolated try-out | demo |
| Records inside it | demo records |
| Receipt input | receipt photos / add receipts |
| Receipt extraction | receipt text reading |
| Purchase beyond the free version | paid version |
| Downloaded table | spreadsheet |
| Removed card information | payment details removed |
| Downloaded restore file | backup file |
| Payment destination | hosted checkout |

The 404 heading is **Page not found**. Every source link is **Source on GitHub
(external)**. The decorative “Plate 01,” “preflight,” “receipt intake,”
“service window,” and reader-facing “redacted” wording are absent.
