# Demo sandbox

Open `https://receipt-to-room.sociobot.in/?demo=1` or choose **Try it with
sample data** on the landing page. The demo starts with three reviewed records:
Cedar kettle in Kitchen, Reading lamp in Office, and Linen storage box in
Bedroom.

The landing action scrolls and focuses the sample inventory immediately. Its
state uses only `demo:receipt-to-room:sample:v1`; **Reset demo** restores all
three rows and **Start for real** returns to the normal landing page.

The desktop app has the same sample project. Choose **Load sample project** on
its first screen or open the browser development entry point at
`http://127.0.0.1:1420/?demo=1#inventory`. The app demo supports intake, OCR,
per-line review, saved-record editing, search, removal with undo, CSV, and
printable output. It stores records and receipt usage only under:

- `demo:receipt-to-room:inventory:v1`
- `demo:receipt-to-room:receipt-usage:v1`

The real `receipt-to-room:inventory:v1` and receipt-usage keys are never read or
written while the demo banner is shown. **Reset demo** reseeds the three shipped
records. **Start for real** leaves demo mode without copying sample data.
