import "./styles.css";
import { confidenceLabel, inferDate, inferMerchant, inventoryToCsv, parseReceiptText, redactPayment, totalValue, type InventoryItem, type ParsedLine } from "./lib";

type View = "intake" | "inventory" | "license";
interface Draft { receiptId: string; receiptName: string; merchant: string; purchaseDate: string; room: string; category: string; warrantyDate: string; lines: ParsedLine[]; }
interface LicenseCache { valid: boolean; checkedAt: number; }

const STORAGE_KEY = "receipt-to-room:inventory:v1";
const LICENSE_KEY = "sb_license:receipt-to-room";
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const CHECKOUT = "https://api.sociobot.in/api/v1/products/receipt-to-room/checkout";
const VERIFY = "https://api.sociobot.in/api/v1/products/receipt-to-room/verify";
const FREE_RECEIPTS = 3;
const rooms = ["Kitchen", "Living room", "Bedroom", "Bathroom", "Office", "Garage", "Other"];
const categories = ["Appliance", "Electronics", "Furniture", "Kitchenware", "Home supply", "Tool", "Decor", "Other"];

let items = loadItems();
let view: View = "intake";
let draft: Draft | null = null;
let busy = false;
let progress = 0;
let status = "Ready for a receipt.";
let error = "";
let deleted: { item: InventoryItem; index: number; timeout: number } | null = null;
let licenseValid = readLicenseCache()?.valid === true && Boolean(localStorage.getItem(LICENSE_KEY));
let fileQueue: File[] = [];

const app = document.querySelector<HTMLDivElement>("#app")!;
consumeLicenseFromUrl();
render();
void refreshLicense();

function loadItems(): InventoryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as InventoryItem[]; }
  catch { return []; }
}

function saveItems(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function receiptCount(): number { return new Set(items.map((item) => item.receiptId)).size; }
function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}
function money(value: number): string { return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value); }

function render(): void {
  app.innerHTML = `
    <header class="app-header">
      <a class="wordmark" href="#intake" data-view="intake" aria-label="Receipt to Room, new receipt">
        <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M25 4C14 5 7 12 7 24m0 0c4-7 9-10 16-12M7 24c6 1 11-1 15-6"/><path d="M7 24v5"/></svg>
        <span>Receipt to Room<small>Household field notes</small></span>
      </a>
      <nav aria-label="Workspace">
        <button class="nav-button ${view === "intake" ? "active" : ""}" data-view="intake">Add receipt</button>
        <button class="nav-button ${view === "inventory" ? "active" : ""}" data-view="inventory">Inventory <span class="count">${items.length}</span></button>
        <button class="nav-button ${view === "license" ? "active" : ""}" data-view="license">${licenseValid ? "Field kit unlocked" : "Unlock"}</button>
      </nav>
    </header>
    ${navigator.onLine ? "" : '<div class="offline" role="status">Offline — OCR, editing, and exports still work. License checks will resume when connected.</div>'}
    <main id="main" tabindex="-1">${viewContent()}</main>
    <div class="sr-only" aria-live="polite" id="live-status">${escapeHtml(status)}</div>
  `;
  bindCommon();
  if (view === "intake") bindIntake();
  if (view === "inventory") bindInventory();
  if (view === "license") bindLicense();
}

function viewContent(): string {
  if (view === "inventory") return inventoryView();
  if (view === "license") return licenseView();
  return intakeView();
}

function intakeView(): string {
  const limitNote = licenseValid ? "Unlimited receipt intake is active." : `${receiptCount()} of ${FREE_RECEIPTS} free receipts used.`;
  return `
    <section class="page-head">
      <div><p class="eyebrow">Field intake · ${escapeHtml(limitNote)}</p><h1>Turn a receipt into room records.</h1><p>Choose clear photos. Recognition happens on this device; images are discarded after review.</p></div>
      <button class="text-button" data-view="inventory">View inventory →</button>
    </section>
    ${busy ? processingView() : draft ? reviewView() : uploadView()}
  `;
}

function uploadView(): string {
  return `
    <section class="intake-grid" aria-labelledby="intake-title">
      <div class="drop-plot" id="drop-zone">
        <span class="folio">Plot 01 · local intake</span>
        <svg class="drop-leaf" aria-hidden="true" viewBox="0 0 100 100"><path d="M83 11C39 13 17 39 17 84c20-31 38-46 59-56M17 84c22 2 46-12 66-73"/></svg>
        <h2 id="intake-title">Lay down your receipt</h2>
        <p>JPG, PNG, or WebP · up to 10 MB each · select several after a large shop</p>
        <label class="button primary" for="receipt-files">Choose receipt photos</label>
        <input id="receipt-files" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        <p class="drop-hint">or drag images onto this plot</p>
      </div>
      <aside class="field-note" aria-labelledby="privacy-note">
        <span class="pin" aria-hidden="true"></span><h2 id="privacy-note">Your private worktable</h2>
        <ul><li>No account required</li><li>No receipt images uploaded</li><li>Payment fragments redacted from exports</li><li>Everything remains editable</li></ul>
        <details><summary>OCR missed something?</summary><p>Use “Paste receipt text” to add a typed or copied receipt without a photo.</p></details>
        <button class="button secondary" id="show-manual">Paste receipt text</button>
      </aside>
    </section>
    <section id="manual-entry" class="manual-entry" hidden aria-labelledby="manual-title">
      <h2 id="manual-title">Paste receipt text</h2><label for="manual-text">One purchased item and price per line</label>
      <textarea id="manual-text" rows="7" placeholder="Desk lamp 39.00&#10;Storage box 12.50"></textarea>
      <button class="button primary" id="parse-manual">Review these lines</button>
    </section>
    ${error ? `<p class="error-message" role="alert">${escapeHtml(error)}</p>` : ""}
  `;
}

function processingView(): string {
  return `<section class="processing" aria-labelledby="processing-title">
    <div class="specimen-spinner" aria-hidden="true"><span></span></div>
    <p class="eyebrow">Local recognition</p><h2 id="processing-title">Reading your receipt…</h2>
    <p>${escapeHtml(status)}</p><progress max="100" value="${progress}">${progress}%</progress>
    <p class="muted">The first run may take a little longer while the local language model opens.</p>
  </section>`;
}

function reviewView(): string {
  if (!draft) return "";
  return `<form id="review-form" class="review-sheet">
    <div class="review-heading"><div><p class="eyebrow">Specimen ${escapeHtml(draft.receiptName)}</p><h2>Check the useful lines</h2><p>Edit pale-confidence lines before planting them in a room.</p></div><button type="button" class="text-button danger" id="discard-draft">Discard receipt</button></div>
    <div class="metadata-grid">
      <label>Retailer<input name="merchant" value="${escapeHtml(draft.merchant)}" required /></label>
      <label>Purchase date<input name="purchaseDate" type="date" value="${draft.purchaseDate}" required /></label>
      <label>Room<select name="room">${options(rooms, draft.room)}</select></label>
      <label>Category<select name="category">${options(categories, draft.category)}</select></label>
      <label>Warranty until <span class="optional">optional</span><input name="warrantyDate" type="date" value="${draft.warrantyDate}" /></label>
    </div>
    <fieldset class="line-fieldset"><legend>Receipt lines</legend>
      ${draft.lines.length ? draft.lines.map((line, index) => reviewLine(line, index)).join("") : `<div class="empty-inline"><strong>No priced lines were found.</strong><p>Add the important purchase manually.</p></div>`}
      <button type="button" class="button secondary" id="add-line">+ Add a line</button>
    </fieldset>
    ${error ? `<p class="error-message" role="alert">${escapeHtml(error)}</p>` : ""}
    <div class="form-actions"><p>${draft.lines.filter((line) => line.included).length} lines selected</p><button class="button primary" type="submit">Add to room inventory</button></div>
  </form>`;
}

function reviewLine(line: ParsedLine, index: number): string {
  const label = line.confidenceLabel === "good" ? "Good" : line.confidenceLabel === "check" ? "Check" : "Low";
  return `<div class="review-line confidence-${line.confidenceLabel}">
    <label class="include-check"><input type="checkbox" name="included-${index}" ${line.included ? "checked" : ""}/><span>Include line ${index + 1}</span></label>
    <label class="item-name">Item<input name="name-${index}" value="${escapeHtml(line.name)}" /></label>
    <label>Qty<input name="quantity-${index}" type="number" min="1" max="999" step="1" value="${line.quantity}" /></label>
    <label>Paid<input name="price-${index}" type="number" min="0" step="0.01" value="${line.price.toFixed(2)}" /></label>
    <span class="confidence"><span aria-hidden="true"></span>${label} · ${line.confidence}%</span>
  </div>`;
}

function inventoryView(): string {
  const query = new URLSearchParams(location.hash.split("?")[1] ?? "").get("q") ?? "";
  const lowered = query.toLowerCase();
  const filtered = items.filter((item) => !lowered || [item.name, item.room, item.category, item.merchant].some((v) => v.toLowerCase().includes(lowered)));
  return `<section class="page-head inventory-head"><div><p class="eyebrow">Household index</p><h1>Your room inventory</h1><p>${items.length} items · ${money(totalValue(items))} recorded purchase total, not a valuation.</p></div><button class="button primary" data-view="intake">Add receipt</button></section>
    <section class="inventory-tools" aria-label="Inventory tools">
      <form id="search-form" role="search"><label for="search">Search items, rooms, categories, or retailers</label><div><input id="search" name="q" value="${escapeHtml(query)}" type="search"/><button class="button secondary">Search</button></div></form>
      <div class="export-actions"><button class="button secondary" id="export-csv" ${items.length ? "" : "disabled"}>Export CSV</button><button class="button secondary" id="export-pdf" ${items.length ? "" : "disabled"}>Print / save PDF</button></div>
    </section>
    ${items.length ? (filtered.length ? `<div class="inventory-table-wrap"><table><caption class="sr-only">Reviewed household inventory</caption><thead><tr><th>Item</th><th>Room</th><th>Category</th><th>Purchased</th><th class="number">Paid</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${filtered.map(itemRow).join("")}</tbody></table></div>` : `<div class="empty-state"><h2>No specimens match “${escapeHtml(query)}”</h2><p>Try a room name, retailer, or broader item word.</p><button class="button secondary" id="clear-search">Clear search</button></div>`) : `<div class="empty-state"><svg aria-hidden="true" viewBox="0 0 100 100"><path d="M50 88V28m0 37C31 62 20 50 17 31 35 31 47 39 50 54m0-12c9-15 21-22 36-22-1 18-13 31-36 36"/></svg><h2>The index is waiting for its first item.</h2><p>Add a receipt photo, review the useful lines, and choose their room.</p><button class="button primary" data-view="intake">Add your first receipt</button></div>`}
    ${deleted ? `<div class="undo-toast" role="status">Removed ${escapeHtml(deleted.item.name)}. <button id="undo-delete">Undo</button></div>` : ""}`;
}

function itemRow(item: InventoryItem): string {
  return `<tr><td data-label="Item"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.merchant)} · ${escapeHtml(item.receiptName)}</small></td><td data-label="Room"><span class="room-tab room-${slug(item.room)}">${escapeHtml(item.room)}</span></td><td data-label="Category">${escapeHtml(item.category)}</td><td data-label="Purchased">${escapeHtml(item.purchaseDate)}${item.warrantyDate ? `<small>Warranty to ${escapeHtml(item.warrantyDate)}</small>` : ""}</td><td data-label="Paid" class="number">${money(item.price * item.quantity)}${item.quantity > 1 ? `<small>${item.quantity} × ${money(item.price)}</small>` : ""}</td><td class="row-action"><button class="icon-button danger" data-delete="${item.id}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button></td></tr>`;
}

function licenseView(): string {
  return `<section class="license-layout">
    <div class="license-copy"><p class="eyebrow">Permanent field kit</p><h1>${licenseValid ? "Your full field kit is unlocked." : "Keep every room record, for good."}</h1><p>Receipt to Room is useful free for three receipts. A one-time $29 purchase supports local-first development and removes intake limits.</p>
      <ul class="feature-list"><li>Unlimited receipt intake</li><li>Permanent local inventory records</li><li>JSON backup and restore between devices</li><li>All future v1 updates</li></ul>
      ${licenseValid ? `<p class="success-note">✓ License verified on this device.</p><button class="button secondary" id="backup-json">Download JSON backup</button><label class="button secondary file-button" for="restore-json">Restore JSON backup</label><input id="restore-json" type="file" accept="application/json"/>` : `<a class="button primary" href="${CHECKOUT}">Buy once for $29</a>`}
      <p class="legal-line">Secure checkout is hosted by Sociobot/Dodo, the merchant of record. Refunds are handled there and revoke the license. <a href="https://receipt-to-room.sociobot.in/privacy">Privacy</a> · <a href="https://receipt-to-room.sociobot.in/terms">Terms</a></p>
    </div>
    <aside class="license-card"><span class="folio">Restore a purchase</span><h2>Have a license?</h2><p>Paste the token from your receipt. It is stored only on this device.</p><form id="license-form"><label for="license-token">License token</label><input id="license-token" autocomplete="off" spellcheck="false" required/><button class="button secondary">Verify license</button></form><p class="form-note" id="license-note" role="status">${escapeHtml(status)}</p></aside>
  </section>`;
}

function options(values: string[], selected: string): string { return values.map((v) => `<option ${v === selected ? "selected" : ""}>${v}</option>`).join(""); }
function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

function bindCommon(): void {
  document.querySelectorAll<HTMLElement>("[data-view]").forEach((node) => node.addEventListener("click", (event) => {
    event.preventDefault(); view = node.dataset.view as View; location.hash = view; render();
  }));
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((link) => link.addEventListener("click", (event) => {
    if (!("__TAURI_INTERNALS__" in window)) return;
    event.preventDefault(); void import("@tauri-apps/plugin-opener").then(({ openUrl }) => openUrl(link.href));
  }));
}

function bindIntake(): void {
  document.querySelector<HTMLInputElement>("#receipt-files")?.addEventListener("change", (e) => void processFiles(Array.from((e.target as HTMLInputElement).files ?? [])));
  const zone = document.querySelector<HTMLElement>("#drop-zone");
  zone?.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragging"); });
  zone?.addEventListener("dragleave", () => zone.classList.remove("dragging"));
  zone?.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("dragging"); void processFiles(Array.from(e.dataTransfer?.files ?? [])); });
  document.querySelector("#show-manual")?.addEventListener("click", () => { document.querySelector<HTMLElement>("#manual-entry")!.hidden = false; document.querySelector<HTMLTextAreaElement>("#manual-text")!.focus(); });
  document.querySelector("#parse-manual")?.addEventListener("click", () => {
    const text = document.querySelector<HTMLTextAreaElement>("#manual-text")!.value;
    if (!text.trim()) { error = "Paste at least one item and price, then try again."; render(); return; }
    createDraft("Typed receipt", text, 100); render();
  });
  document.querySelector("#discard-draft")?.addEventListener("click", () => { draft = null; error = ""; status = "Receipt discarded."; render(); if (fileQueue.length) void processNextFile(); });
  document.querySelector("#add-line")?.addEventListener("click", () => {
    syncDraftFromForm(); draft?.lines.push({ id: crypto.randomUUID(), name: "", quantity: 1, price: 0, confidence: 100, confidenceLabel: "good", included: true }); render();
    const names = document.querySelectorAll<HTMLInputElement>('[name^="name-"]'); names[names.length - 1]?.focus();
  });
  document.querySelector<HTMLFormElement>("#review-form")?.addEventListener("submit", acceptDraft);
}

async function processFiles(files: File[]): Promise<void> {
  error = "";
  if (!files.length) return;
  const invalid = files.find((file) => !file.type.match(/^image\/(jpeg|png|webp)$/) || file.size > 10 * 1024 * 1024);
  const valid = files.filter((file) => file.type.match(/^image\/(jpeg|png|webp)$/) && file.size <= 10 * 1024 * 1024);
  if (invalid) error = `${invalid.name} was skipped. Use a JPG, PNG, or WebP no larger than 10 MB.`;
  const allowance = licenseValid ? valid.length : Math.max(0, FREE_RECEIPTS - receiptCount());
  fileQueue.push(...valid.slice(0, allowance));
  if (!licenseValid && valid.length > allowance) status = `Queued ${allowance} receipt${allowance === 1 ? "" : "s"}; the free edition keeps up to ${FREE_RECEIPTS}.`;
  if (!fileQueue.length) { if (allowance === 0) { view = "license"; status = "The free receipt allowance is used. Existing records and exports stay available."; } render(); return; }
  await processNextFile();
}

async function processNextFile(): Promise<void> {
  const file = fileQueue.shift();
  if (!file) return;
  busy = true; progress = 2; status = `Opening ${file.name}…`; render();
  try {
    const { createWorker, OEM } = await import("tesseract.js");
    const worker = await createWorker("eng", OEM.LSTM_ONLY, {
      workerPath: "/ocr/worker.min.js", langPath: "/ocr/tessdata", corePath: "/ocr/",
      logger: (message) => { if (message.progress) { progress = Math.round(message.progress * 100); status = humanOcrStatus(message.status); render(); } }
    });
    const result = await worker.recognize(file, {}, { blocks: true });
    await worker.terminate();
    const ocrLines = result.data.blocks?.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines.map((line) => ({ text: line.text, confidence: line.confidence }))));
    createDraft(file.name, result.data.text, result.data.confidence, ocrLines);
    status = `Read ${draft?.lines.length ?? 0} likely purchase lines from ${file.name}.`;
  } catch (caught) {
    console.error("Local OCR failed", caught);
    error = "This image could not be read locally. Try a sharper, upright photo or use “Paste receipt text” below.";
  } finally { busy = false; render(); }
}

function humanOcrStatus(value: string): string {
  const map: Record<string, string> = { "loading tesseract core": "Opening the local reading engine…", "initializing tesseract": "Preparing local recognition…", "loading language traineddata": "Opening the English receipt model…", "recognizing text": "Identifying receipt lines…" };
  return map[value] ?? "Reading locally…";
}

function createDraft(name: string, text: string, confidence: number, ocrLines?: Array<{ text: string; confidence: number }>): void {
  const lines = ocrLines?.length ? ocrLines.flatMap((line) => parseReceiptText(line.text, line.confidence)) : parseReceiptText(text, confidence);
  draft = { receiptId: crypto.randomUUID(), receiptName: name, merchant: inferMerchant(text), purchaseDate: inferDate(text), room: "Kitchen", category: "Home supply", warrantyDate: "", lines };
}

function syncDraftFromForm(): void {
  if (!draft) return;
  const form = document.querySelector<HTMLFormElement>("#review-form"); if (!form) return;
  const data = new FormData(form);
  draft.merchant = String(data.get("merchant") ?? ""); draft.purchaseDate = String(data.get("purchaseDate") ?? ""); draft.room = String(data.get("room") ?? "Other"); draft.category = String(data.get("category") ?? "Other"); draft.warrantyDate = String(data.get("warrantyDate") ?? "");
  draft.lines.forEach((line, i) => { line.included = data.has(`included-${i}`); line.name = String(data.get(`name-${i}`) ?? "").trim(); line.quantity = Number(data.get(`quantity-${i}`) ?? 1); line.price = Number(data.get(`price-${i}`) ?? 0); });
}

function acceptDraft(event: SubmitEvent): void {
  event.preventDefault(); syncDraftFromForm(); if (!draft) return;
  const chosen = draft.lines.filter((line) => line.included);
  if (!chosen.length) { error = "Select at least one receipt line, or discard this receipt."; render(); return; }
  if (chosen.some((line) => !line.name || line.quantity < 1 || line.price < 0)) { error = "Each selected line needs a name, quantity of at least 1, and a non-negative price."; render(); return; }
  const now = new Date().toISOString();
  items.push(...chosen.map((line) => ({ ...line, receiptId: draft!.receiptId, receiptName: draft!.receiptName, merchant: draft!.merchant, room: draft!.room, category: draft!.category, purchaseDate: draft!.purchaseDate, warrantyDate: draft!.warrantyDate, createdAt: now })));
  saveItems(); status = `${chosen.length} items added to ${draft.room}.`; draft = null; error = "";
  if (fileQueue.length) { view = "intake"; location.hash = "intake"; render(); setTimeout(() => void processNextFile(), 0); }
  else { view = "inventory"; location.hash = "inventory"; render(); }
}

function bindInventory(): void {
  document.querySelector<HTMLFormElement>("#search-form")?.addEventListener("submit", (e) => { e.preventDefault(); const q = new FormData(e.currentTarget as HTMLFormElement).get("q"); location.hash = `inventory?q=${encodeURIComponent(String(q ?? ""))}`; render(); });
  document.querySelector("#clear-search")?.addEventListener("click", () => { location.hash = "inventory"; render(); });
  document.querySelector("#export-csv")?.addEventListener("click", () => download("receipt-to-room-inventory.csv", inventoryToCsv(items), "text/csv;charset=utf-8"));
  document.querySelector("#export-pdf")?.addEventListener("click", printInventory);
  document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((button) => button.addEventListener("click", () => removeItem(button.dataset.delete!)));
  document.querySelector("#undo-delete")?.addEventListener("click", undoDelete);
}

function removeItem(id: string): void {
  const index = items.findIndex((item) => item.id === id); if (index < 0) return;
  if (deleted) clearTimeout(deleted.timeout);
  const [item] = items.splice(index, 1); saveItems();
  const timeout = window.setTimeout(() => { deleted = null; render(); }, 5000);
  deleted = { item, index, timeout }; status = `${item.name} removed. Undo is available for five seconds.`; render();
}
function undoDelete(): void { if (!deleted) return; clearTimeout(deleted.timeout); items.splice(deleted.index, 0, deleted.item); saveItems(); status = `${deleted.item.name} restored.`; deleted = null; render(); }

function download(name: string, body: string, type: string): void {
  const url = URL.createObjectURL(new Blob([body], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); status = `${name} saved.`;
}

function printInventory(): void {
  const printable = document.createElement("iframe"); printable.title = "Printable room inventory"; printable.className = "print-frame"; document.body.append(printable);
  const doc = printable.contentDocument!;
  const groups = new Map<string, InventoryItem[]>();
  for (const item of items) groups.set(item.room, [...(groups.get(item.room) ?? []), item]);
  doc.open(); doc.write(`<!doctype html><html lang="en"><head><title>Receipt to Room inventory</title><style>body{font:14px system-ui;color:#19332b;margin:36px}h1,h2{font-family:Georgia,serif}header{border-bottom:2px solid #1f6349;margin-bottom:28px}table{width:100%;border-collapse:collapse;margin-bottom:28px}th,td{text-align:left;padding:8px;border-bottom:1px solid #ccc}td:last-child,th:last-child{text-align:right}.note{color:#53645c;font-size:12px}</style></head><body><header><h1>Household room inventory</h1><p>Prepared ${new Date().toLocaleDateString()} · ${items.length} reviewed items</p><p class="note">Purchase totals are user-reviewed records, not valuations or proof of insurance coverage. Payment fragments are redacted.</p></header>${Array.from(groups).map(([room, roomItems]) => `<section><h2>${escapeHtml(room)}</h2><table><thead><tr><th>Item</th><th>Category</th><th>Purchased</th><th>Warranty</th><th>Paid</th></tr></thead><tbody>${roomItems.map((item) => `<tr><td>${escapeHtml(redactPayment(item.name))}<div class="note">${escapeHtml(redactPayment(item.merchant))}</div></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.purchaseDate)}</td><td>${escapeHtml(item.warrantyDate || "—")}</td><td>${escapeHtml(money(item.price * item.quantity))}</td></tr>`).join("")}</tbody></table></section>`).join("")}</body></html>`); doc.close();
  setTimeout(() => { printable.contentWindow?.focus(); printable.contentWindow?.print(); setTimeout(() => printable.remove(), 1000); }, 150);
}

function consumeLicenseFromUrl(): void {
  const url = new URL(location.href); const token = url.searchParams.get("license"); if (!token) return;
  localStorage.setItem(LICENSE_KEY, token); url.searchParams.delete("license"); history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`); status = "License received. Verifying in the background…";
}
function readLicenseCache(): LicenseCache | null { try { return JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) ?? "null") as LicenseCache | null; } catch { return null; } }
async function refreshLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(LICENSE_KEY); if (!token) return false;
  const cache = readLicenseCache(); if (!force && cache && Date.now() - cache.checkedAt < 86_400_000) return cache.valid;
  try {
    const response = await fetch(`${VERIFY}?license=${encodeURIComponent(token)}`); if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const verdict = await response.json() as { valid: boolean; reason?: string };
    licenseValid = verdict.valid; localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    status = verdict.valid ? "License verified. Unlimited intake is active." : "License no longer active. You can keep using and exporting existing records."; render(); return verdict.valid;
  } catch { status = navigator.onLine ? "Could not verify the license just now. Try again shortly." : "Offline. The last license result remains in use."; render(); return licenseValid; }
}

function bindLicense(): void {
  document.querySelector<HTMLFormElement>("#license-form")?.addEventListener("submit", async (e) => { e.preventDefault(); const token = document.querySelector<HTMLInputElement>("#license-token")!.value.trim(); if (!token) return; localStorage.setItem(LICENSE_KEY, token); status = "Verifying license…"; render(); await refreshLicense(true); });
  document.querySelector("#backup-json")?.addEventListener("click", () => download("receipt-to-room-backup.json", JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), items }, null, 2), "application/json"));
  document.querySelector<HTMLInputElement>("#restore-json")?.addEventListener("change", async (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()) as { items?: InventoryItem[] }; if (!Array.isArray(parsed.items)) throw new Error(); items = parsed.items; saveItems(); status = `Restored ${items.length} items.`; view = "inventory"; render(); } catch { status = "That file is not a Receipt to Room backup."; render(); } });
}

window.addEventListener("online", () => { status = "Back online."; render(); void refreshLicense(); });
window.addEventListener("offline", () => { status = "Offline. Local work remains available."; render(); });
window.addEventListener("hashchange", () => { const next = location.hash.slice(1).split("?")[0]; if (["intake", "inventory", "license"].includes(next)) view = next as View; render(); });
