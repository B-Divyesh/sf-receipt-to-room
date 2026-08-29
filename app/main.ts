import "./styles.css";
import {
  inferCurrency,
  inferDate,
  inferMerchant,
  inventoryFromBackup,
  inventoryToCsv,
  isInventoryItem,
  parseReceiptText,
  redactPayment,
  type DraftLine,
  type InventoryItem,
} from "./lib";

type View = "intake" | "inventory" | "license";
interface Draft {
  receiptId: string;
  receiptName: string;
  merchant: string;
  purchaseDate: string;
  currency: string;
  lines: DraftLine[];
}
interface LicenseCache {
  valid: boolean;
  checkedAt: number;
}

const REAL_STORAGE_KEY = "receipt-to-room:inventory:v1";
const REAL_RECEIPT_USAGE_KEY = "receipt-to-room:receipt-usage:v1";
const DEMO_STORAGE_KEY = "demo:receipt-to-room:inventory:v1";
const DEMO_RECEIPT_USAGE_KEY = "demo:receipt-to-room:receipt-usage:v1";
const LICENSE_KEY = "sb_license:receipt-to-room";
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const CHECKOUT =
  "https://api.sociobot.in/api/v1/products/receipt-to-room/checkout";
const VERIFY = "https://api.sociobot.in/api/v1/products/receipt-to-room/verify";
const FREE_RECEIPTS = 3;
const rooms = [
  "Kitchen",
  "Living room",
  "Bedroom",
  "Bathroom",
  "Office",
  "Garage",
  "Other",
];
const categories = [
  "Appliance",
  "Electronics",
  "Furniture",
  "Kitchenware",
  "Home supply",
  "Tool",
  "Decor",
  "Other",
];
const demoMode = new URL(location.href).searchParams.get("demo") === "1";
const STORAGE_KEY = demoMode ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;
const RECEIPT_USAGE_KEY = demoMode
  ? DEMO_RECEIPT_USAGE_KEY
  : REAL_RECEIPT_USAGE_KEY;
const demoItems: InventoryItem[] = [
  {
    id: "demo-kettle",
    receiptId: "demo-home-shop",
    receiptName: "home-shop.jpg",
    name: "Cedar kettle",
    quantity: 1,
    price: 42,
    currency: "USD",
    confidence: 96,
    confidenceLabel: "good",
    included: true,
    merchant: "Home Store",
    room: "Kitchen",
    category: "Appliance",
    purchaseDate: "2026-08-21",
    warrantyDate: "2028-08-21",
    createdAt: "2026-08-21T10:00:00.000Z",
  },
  {
    id: "demo-lamp",
    receiptId: "demo-home-shop",
    receiptName: "home-shop.jpg",
    name: "Reading lamp",
    quantity: 1,
    price: 39,
    currency: "USD",
    confidence: 91,
    confidenceLabel: "good",
    included: true,
    merchant: "Home Store",
    room: "Office",
    category: "Decor",
    purchaseDate: "2026-08-21",
    warrantyDate: "",
    createdAt: "2026-08-21T10:00:00.000Z",
  },
  {
    id: "demo-box",
    receiptId: "demo-linen-shop",
    receiptName: "linen-shop.jpg",
    name: "Linen storage box",
    quantity: 1,
    price: 12.5,
    currency: "USD",
    confidence: 88,
    confidenceLabel: "good",
    included: true,
    merchant: "Linen Shop",
    room: "Bedroom",
    category: "Home supply",
    purchaseDate: "2026-08-24",
    warrantyDate: "",
    createdAt: "2026-08-24T11:00:00.000Z",
  },
];

let items = loadItems();
let receiptUsage = loadReceiptUsage(items);
let view: View = viewFromLocation();
let draft: Draft | null = null;
let busy = false;
let progress = 0;
let status = "Ready for a receipt.";
let error = "";
let manualEntryOpen = false;
let manualEntryInvalid = false;
let deleted: { item: InventoryItem; index: number; timeout: number } | null =
  null;
let editingItemId: string | null = null;
let licenseValid =
  !demoMode &&
  readLicenseCache()?.valid === true &&
  Boolean(localStorage.getItem(LICENSE_KEY));
let fileQueue: File[] = [];

const app = document.querySelector<HTMLDivElement>("#app")!;
consumeLicenseFromUrl();
render();
void refreshLicense();

function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw && demoMode) {
      const seeded = demoItems.map((item) => ({ ...item }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isInventoryItem))
      throw new Error("Invalid stored inventory");
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return demoMode ? demoItems.map((item) => ({ ...item })) : [];
  }
}

function saveItems(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadReceiptUsage(currentItems: InventoryItem[]): number {
  const recorded = Number(localStorage.getItem(RECEIPT_USAGE_KEY));
  const migrated = new Set(currentItems.map((item) => item.receiptId)).size;
  if (Number.isSafeInteger(recorded) && recorded >= migrated) return recorded;
  localStorage.setItem(RECEIPT_USAGE_KEY, String(migrated));
  return migrated;
}
function saveReceiptUsage(): void {
  localStorage.setItem(RECEIPT_USAGE_KEY, String(receiptUsage));
}
function receiptCount(): number {
  return receiptUsage;
}
function freeLimitReached(): boolean {
  return !demoMode && !licenseValid && receiptCount() >= FREE_RECEIPTS;
}
function showLimit(): void {
  draft = null;
  manualEntryOpen = false;
  error = "";
  status = `The free ${FREE_RECEIPTS}-receipt allowance is used. Existing records and exports stay available.`;
  navigateTo("license");
}
function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ]!,
  );
}
function money(value: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}
function inventoryTotalLabel(): string {
  const totals = new Map<string, number>();
  for (const item of items)
    totals.set(
      item.currency || "USD",
      (totals.get(item.currency || "USD") ?? 0) + item.price * item.quantity,
    );
  return (
    Array.from(totals)
      .map(([currency, value]) => money(value, currency))
      .join(" + ") || money(0)
  );
}

function viewFromLocation(): View {
  const route = location.hash.slice(1).split("?")[0];
  return route === "inventory" || route === "license" ? route : "intake";
}

function focusScreen(selector = "main h1"): void {
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>(selector);
    if (!heading) return;
    heading.tabIndex = -1;
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    heading.scrollIntoView({ block: "start" });
    heading.focus({ preventScroll: true });
    document.documentElement.style.scrollBehavior = scrollBehavior;
  });
}

function render(focusSelector?: string): void {
  document.title =
    view === "inventory"
      ? "Inventory — Receipt to Room"
      : view === "license"
        ? "License — Receipt to Room"
        : "Add receipt — Receipt to Room";
  app.innerHTML = `
    <header class="app-header">
      <a class="wordmark" href="#intake" data-view="intake" aria-label="Receipt to Room, new receipt">
        <svg aria-hidden="true" viewBox="0 0 32 32"><path d="M25 4C14 5 7 12 7 24m0 0c4-7 9-10 16-12M7 24c6 1 11-1 15-6"/><path d="M7 24v5"/></svg>
        <span>Receipt to Room<small>Local purchase records</small></span>
      </a>
      <nav aria-label="Workspace">
        <button class="nav-button ${view === "intake" ? "active" : ""}" data-view="intake">Add receipt</button>
        <button class="nav-button ${view === "inventory" ? "active" : ""}" data-view="inventory">Inventory <span class="count">${items.length}</span></button>
        <button class="nav-button ${view === "license" ? "active" : ""}" data-view="license">${licenseValid ? "Paid version active" : "Paid version"}</button>
      </nav>
    </header>
    ${demoMode ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved.</span><span><button id="reset-demo" type="button">Reset demo</button><button id="start-real" type="button">Leave demo and use my records</button></span><span class="sr-only" id="demo-reset-note" aria-live="polite"></span></aside>` : ""}
    ${navigator.onLine ? "" : '<div class="offline" role="status">Offline — text reading, editing, and exports still work. Paid-version checks resume when connected.</div>'}
    <main id="main" tabindex="-1">${viewContent()}</main>
    <div class="sr-only" aria-live="polite" id="live-status">${escapeHtml(status)}</div>
  `;
  bindCommon();
  if (view === "intake") bindIntake();
  if (view === "inventory") bindInventory();
  if (view === "license") bindLicense();
  if (focusSelector) focusScreen(focusSelector);
}

function navigateTo(next: View): void {
  if (view === next && viewFromLocation() === next) {
    render("main h1");
    return;
  }
  location.hash = next;
}

function viewContent(): string {
  if (view === "inventory") return inventoryView();
  if (view === "license") return licenseView();
  return intakeView();
}

function intakeView(): string {
  const limitNote = demoMode
    ? "Demo records"
    : licenseValid
      ? "You can add unlimited receipts."
      : `${receiptCount()} of ${FREE_RECEIPTS} free receipts used.`;
  return `
    <section class="page-head">
      <div><p class="eyebrow">New receipt · ${escapeHtml(limitNote)}</p><h1>Turn a receipt into room records.</h1><p>Choose clear receipt photos. Text reading happens on this device; photos are discarded after review.</p></div>
      <button class="text-button" data-view="inventory">View inventory →</button>
    </section>
    ${busy ? processingView() : draft ? reviewView() : uploadView()}
  `;
}

function uploadView(): string {
  return `
    <section class="intake-grid" aria-labelledby="intake-title">
      <div class="drop-plot" id="drop-zone">
        <span class="folio">Receipt photo · stays on this device</span>
        <svg class="drop-leaf" aria-hidden="true" viewBox="0 0 100 100"><path d="M83 11C39 13 17 39 17 84c20-31 38-46 59-56M17 84c22 2 46-12 66-73"/></svg>
        <h2 id="intake-title">Add a receipt photo</h2>
        <p>JPG, PNG, or WebP · up to 10 MB each · select several after a large shop</p>
        <label class="button primary" for="receipt-files">Choose receipt photos</label>
        <input id="receipt-files" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        <p class="drop-hint">or drag receipt photos here</p>
      </div>
      <aside class="field-note" aria-labelledby="privacy-note">
        <span class="pin" aria-hidden="true"></span><h2 id="privacy-note">Your records stay private</h2>
        <ul><li>No account required</li><li>No receipt photos uploaded</li><li>Payment details removed from exports</li><li>Saved item details remain editable</li></ul>
        <details><summary>Text reading missed something?</summary><p>Use “Paste receipt text” to add a typed or copied receipt without a photo.</p></details>
        <button class="button secondary" id="show-manual">Paste receipt text</button>
        ${!demoMode && items.length === 0 ? `<button class="button secondary" id="load-demo">Load demo records</button>` : ""}
      </aside>
    </section>
    <section id="manual-entry" class="manual-entry" ${manualEntryOpen ? "" : "hidden"} aria-labelledby="manual-title">
      <h2 id="manual-title">Paste receipt text</h2><label for="manual-text">One purchased item and price per line</label>
      <textarea id="manual-text" rows="7" placeholder="Desk lamp 39.00&#10;Storage box 12.50" ${manualEntryInvalid ? 'aria-describedby="manual-error" aria-invalid="true"' : ""}></textarea>
      <button class="button primary" id="parse-manual">Review these lines</button>
    </section>
    ${error ? `<p class="error-message" id="manual-error" role="alert">${escapeHtml(error)}</p>` : ""}
  `;
}

function processingView(): string {
  return `<section class="processing" aria-labelledby="processing-title">
    <div class="specimen-spinner" aria-hidden="true"><span></span></div>
    <p class="eyebrow">Reading on this device</p><h2 id="processing-title">Reading your receipt…</h2>
    <p>${escapeHtml(status)}</p><progress max="100" value="${progress}">${progress}%</progress>
    <p class="muted">The first run may take a little longer while the local text reader opens.</p>
  </section>`;
}

function reviewView(): string {
  if (!draft) return "";
  return `<form id="review-form" class="review-sheet">
    <div class="review-heading"><div><p class="eyebrow">Receipt ${escapeHtml(draft.receiptName)}</p><h2 id="review-title">Check the useful lines</h2><p>Edit each line and place it in the right room before saving.</p></div><button type="button" class="text-button danger" id="discard-draft">Discard receipt</button></div>
    <div class="metadata-grid">
      <label>Retailer<input name="merchant" value="${escapeHtml(draft.merchant)}" required /></label>
      <label>Purchase date<input name="purchaseDate" type="date" value="${draft.purchaseDate}" required /></label>
      <label>Currency<select name="currency">${options(["USD", "INR", "EUR", "GBP", "CAD", "AUD"], draft.currency)}</select></label>
    </div>
    <fieldset class="line-fieldset"><legend>Receipt lines</legend>
      ${draft.lines.length ? draft.lines.map((line, index) => reviewLine(line, index)).join("") : `<div class="empty-inline"><strong>No priced lines were found.</strong><p>Add the important purchase manually.</p></div>`}
      <button type="button" class="button secondary" id="add-line">+ Add a line</button>
    </fieldset>
    ${error ? `<p class="error-message" role="alert">${escapeHtml(error)}</p>` : ""}
    <div class="form-actions"><p>${draft.lines.filter((line) => line.included).length} lines selected</p><button class="button primary" type="submit">Add to room inventory</button></div>
  </form>`;
}

function reviewLine(line: DraftLine, index: number): string {
  const label =
    line.confidenceLabel === "good"
      ? "Good"
      : line.confidenceLabel === "check"
        ? "Check"
        : "Low";
  return `<div class="review-line confidence-${line.confidenceLabel}">
    <label class="include-check"><input type="checkbox" name="included-${index}" ${line.included ? "checked" : ""}/><span>Include line ${index + 1}</span></label>
    <label class="item-name">Item<input name="name-${index}" value="${escapeHtml(line.name)}" /></label>
    <label>Qty<input name="quantity-${index}" type="number" min="1" max="999" step="1" value="${line.quantity}" /></label>
    <label>Paid<input name="price-${index}" type="number" min="0" step="0.01" value="${line.price.toFixed(2)}" /></label>
    <label>Room<select name="room-${index}">${options(rooms, line.room)}</select></label>
    <label>Category<select name="category-${index}">${options(categories, line.category)}</select></label>
    <label>Warranty until <span class="optional">optional</span><input name="warrantyDate-${index}" type="date" value="${line.warrantyDate}" /></label>
    <span class="confidence"><span aria-hidden="true"></span>${label} · ${line.confidence}%</span>
  </div>`;
}

function inventoryView(): string {
  const query =
    new URLSearchParams(location.hash.split("?")[1] ?? "").get("q") ?? "";
  const lowered = query.toLowerCase();
  const filtered = items.filter(
    (item) =>
      !lowered ||
      [item.name, item.room, item.category, item.merchant].some((v) =>
        v.toLowerCase().includes(lowered),
      ),
  );
  const editingItem = editingItemId
    ? items.find((item) => item.id === editingItemId)
    : undefined;
  return `<section class="page-head inventory-head"><div><p class="eyebrow">Room records</p><h1>Your room inventory</h1><p>${items.length} items · ${inventoryTotalLabel()} recorded purchase total, not a valuation.</p></div><button class="button primary" data-view="intake">Add receipt</button></section>
    <section class="inventory-tools" aria-label="Inventory tools">
      <form id="search-form" role="search"><label for="search">Search items, rooms, categories, or retailers</label><div><input id="search" name="q" value="${escapeHtml(query)}" type="search"/><button class="button secondary">Search</button></div></form>
      <div class="export-actions"><button class="button secondary" id="export-csv" ${items.length ? "" : "disabled"}>Download spreadsheet</button><button class="button secondary" id="export-pdf" ${items.length ? "" : "disabled"}>Print inventory</button></div>
    </section>
    ${editingItem ? editItemForm(editingItem) : ""}
    ${items.length ? (filtered.length ? `<div class="inventory-table-wrap"><table><caption class="sr-only">Reviewed household inventory</caption><thead><tr><th>Item</th><th>Room</th><th>Category</th><th>Purchased</th><th class="number">Paid</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${filtered.map(itemRow).join("")}</tbody></table></div>` : `<div class="empty-state"><h2>No records match “${escapeHtml(query)}”</h2><p>Try a room name, retailer, or broader item word.</p><button class="button secondary" id="clear-search">Clear search</button></div>`) : `<div class="empty-state"><svg aria-hidden="true" viewBox="0 0 100 100"><path d="M50 88V28m0 37C31 62 20 50 17 31 35 31 47 39 50 54m0-12c9-15 21-22 36-22-1 18-13 31-36 36"/></svg><h2>No room records yet.</h2><p>Add a receipt photo, review the useful lines, and choose their room.</p><button class="button primary" data-view="intake">Add your first receipt</button></div>`}
    ${deleted ? `<div class="undo-toast" role="status">Removed ${escapeHtml(deleted.item.name)}. <button id="undo-delete">Undo</button></div>` : ""}`;
}

function itemRow(item: InventoryItem): string {
  return `<tr><td data-label="Item"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.merchant)} · ${escapeHtml(item.receiptName)}</small></td><td data-label="Room"><span class="room-tab room-${slug(item.room)}">${escapeHtml(item.room)}</span></td><td data-label="Category">${escapeHtml(item.category)}</td><td data-label="Purchased">${escapeHtml(item.purchaseDate)}${item.warrantyDate ? `<small>Warranty to ${escapeHtml(item.warrantyDate)}</small>` : ""}</td><td data-label="Paid" class="number">${money(item.price * item.quantity, item.currency)}${item.quantity > 1 ? `<small>${item.quantity} × ${money(item.price, item.currency)}</small>` : ""}</td><td class="row-action"><button class="icon-button" data-edit="${item.id}" aria-label="Edit ${escapeHtml(item.name)}">Edit</button><button class="icon-button danger" data-delete="${item.id}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button></td></tr>`;
}

function editItemForm(item: InventoryItem): string {
  return `<form id="edit-item-form" class="edit-sheet" aria-labelledby="edit-item-title">
    <div class="review-heading"><div><p class="eyebrow">Saved record</p><h2 id="edit-item-title">Edit ${escapeHtml(item.name)}</h2></div><button type="button" class="text-button" id="cancel-edit">Cancel editing</button></div>
    <div class="edit-grid">
      <label>Item<input name="name" value="${escapeHtml(item.name)}" required /></label>
      <label>Quantity<input name="quantity" type="number" min="1" max="999" step="1" value="${item.quantity}" required /></label>
      <label>Paid<input name="price" type="number" min="0" step="0.01" value="${item.price.toFixed(2)}" required /></label>
      <label>Currency<select name="currency">${options(["USD", "INR", "EUR", "GBP", "CAD", "AUD"], item.currency)}</select></label>
      <label>Room<select name="room">${options(rooms, item.room)}</select></label>
      <label>Category<select name="category">${options(categories, item.category)}</select></label>
      <label>Purchase date<input name="purchaseDate" type="date" value="${item.purchaseDate}" required /></label>
      <label>Warranty until <span class="optional">optional</span><input name="warrantyDate" type="date" value="${item.warrantyDate}" /></label>
      <label>Retailer<input name="merchant" value="${escapeHtml(item.merchant)}" required /></label>
    </div>
    <div class="form-actions"><button class="button primary" type="submit">Save changes</button></div>
  </form>`;
}

function licenseView(): string {
  return `<section class="license-layout">
    <div class="license-copy"><p class="eyebrow">Paid version</p><h1>${licenseValid ? "Your paid version is active." : "Add receipts without a limit."}</h1><p>The free version includes three receipts. Pay $29 once to add unlimited receipts.</p>
      <ul class="feature-list"><li>Add unlimited receipts</li><li>Local inventory records</li><li>Backup and restore between devices</li><li>Spreadsheet and printable exports</li></ul>
      ${licenseValid ? `<p class="success-note">✓ Paid version checked on this device.</p><button class="button secondary" id="backup-json">Download backup file</button><label class="button secondary file-button" for="restore-json">Restore backup file</label><input id="restore-json" type="file" accept="application/json"/>` : `<a class="button primary" href="${CHECKOUT}">Buy unlimited receipts — $29</a>`}
      <p class="legal-line">Payment opens in a hosted checkout run by Dodo Payments. A refunded purchase stops the paid version. <a href="https://receipt-to-room.sociobot.in/privacy">Privacy</a> · <a href="https://receipt-to-room.sociobot.in/terms">Terms</a></p>
    </div>
    <aside class="license-card"><span class="folio">Restore a purchase</span><h2>Have a paid-version token?</h2><p>Paste the token from your receipt. It is stored only on this device.</p><form id="license-form"><label for="license-token">Paid-version token</label><input id="license-token" autocomplete="off" spellcheck="false" required/><button class="button secondary">Verify paid version</button></form><p class="form-note" id="license-note" role="status">${escapeHtml(status)}</p></aside>
  </section>`;
}

function options(values: string[], selected: string): string {
  return values
    .map((v) => `<option ${v === selected ? "selected" : ""}>${v}</option>`)
    .join("");
}
function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function bindCommon(): void {
  document.querySelectorAll<HTMLElement>("[data-view]").forEach((node) =>
    node.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(node.dataset.view as View);
    }),
  );
  document.querySelector("#reset-demo")?.addEventListener("click", () => {
    items = demoItems.map((item) => ({ ...item }));
    receiptUsage = new Set(items.map((item) => item.receiptId)).size;
    editingItemId = null;
    saveItems();
    saveReceiptUsage();
    status = "Sample project reset.";
    view = "inventory";
    location.hash = "inventory";
    render("main h1");
  });
  document.querySelector("#start-real")?.addEventListener("click", () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(DEMO_RECEIPT_USAGE_KEY);
    const url = new URL(location.href);
    url.searchParams.delete("demo");
    location.href = `${url.pathname}${url.search}#intake`;
  });
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="http"]')
    .forEach((link) =>
      link.addEventListener("click", (event) => {
        if (!("__TAURI_INTERNALS__" in window)) return;
        event.preventDefault();
        void import("@tauri-apps/plugin-opener").then(({ openUrl }) =>
          openUrl(link.href),
        );
      }),
    );
}

function bindIntake(): void {
  document
    .querySelector<HTMLInputElement>("#receipt-files")
    ?.addEventListener(
      "change",
      (e) =>
        void processFiles(
          Array.from((e.target as HTMLInputElement).files ?? []),
        ),
    );
  const zone = document.querySelector<HTMLElement>("#drop-zone");
  zone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragging");
  });
  zone?.addEventListener("dragleave", () => zone.classList.remove("dragging"));
  zone?.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragging");
    void processFiles(Array.from(e.dataTransfer?.files ?? []));
  });
  document.querySelector("#show-manual")?.addEventListener("click", () => {
    if (freeLimitReached()) {
      showLimit();
      return;
    }
    manualEntryOpen = true;
    manualEntryInvalid = false;
    render();
    document.querySelector<HTMLTextAreaElement>("#manual-text")?.focus();
  });
  document.querySelector("#load-demo")?.addEventListener("click", () => {
    const url = new URL(location.href);
    url.searchParams.set("demo", "1");
    location.href = `${url.pathname}${url.search}#inventory`;
  });
  document.querySelector("#parse-manual")?.addEventListener("click", () => {
    const text =
      document.querySelector<HTMLTextAreaElement>("#manual-text")!.value;
    if (!text.trim()) {
      error = "Paste at least one item and price, then try again.";
      manualEntryOpen = true;
      manualEntryInvalid = true;
      render();
      document.querySelector<HTMLTextAreaElement>("#manual-text")?.focus();
      return;
    }
    if (freeLimitReached()) {
      showLimit();
      return;
    }
    manualEntryOpen = false;
    manualEntryInvalid = false;
    createDraft("Typed receipt", text, 100);
    render("#review-title");
  });
  document.querySelector("#discard-draft")?.addEventListener("click", () => {
    draft = null;
    error = "";
    status = "Receipt discarded.";
    render();
    if (fileQueue.length) void processNextFile();
  });
  document.querySelector("#add-line")?.addEventListener("click", () => {
    syncDraftFromForm();
    draft?.lines.push({
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      price: 0,
      confidence: 100,
      confidenceLabel: "good",
      included: true,
      room: "Kitchen",
      category: "Home supply",
      warrantyDate: "",
    });
    render();
    const names =
      document.querySelectorAll<HTMLInputElement>('[name^="name-"]');
    names[names.length - 1]?.focus();
  });
  document
    .querySelector<HTMLFormElement>("#review-form")
    ?.addEventListener("submit", acceptDraft);
}

async function processFiles(files: File[]): Promise<void> {
  error = "";
  if (!files.length) return;
  const invalid = files.find(
    (file) =>
      !file.type.match(/^image\/(jpeg|png|webp)$/) ||
      file.size > 10 * 1024 * 1024,
  );
  const valid = files.filter(
    (file) =>
      file.type.match(/^image\/(jpeg|png|webp)$/) &&
      file.size <= 10 * 1024 * 1024,
  );
  if (invalid)
    error = `${invalid.name} was skipped. Use a JPG, PNG, or WebP no larger than 10 MB.`;
  if (!valid.length) {
    render();
    return;
  }
  const allowance =
    demoMode || licenseValid
      ? valid.length
      : Math.max(0, FREE_RECEIPTS - receiptCount());
  fileQueue.push(...valid.slice(0, allowance));
  if (!licenseValid && valid.length > allowance)
    status = `Queued ${allowance} receipt${allowance === 1 ? "" : "s"}; the free edition keeps up to ${FREE_RECEIPTS}.`;
  if (!fileQueue.length) {
    if (allowance === 0) {
      view = "license";
      status =
        "The free receipt allowance is used. Existing records and exports stay available.";
    }
    render();
    return;
  }
  await processNextFile();
}

async function processNextFile(): Promise<void> {
  const file = fileQueue.shift();
  if (!file) return;
  busy = true;
  progress = 2;
  status = `Opening ${file.name}…`;
  render();
  try {
    const { createWorker, OEM } = await import("tesseract.js");
    const worker = await createWorker("eng", OEM.LSTM_ONLY, {
      workerPath: "/ocr/worker.min.js",
      langPath: "/ocr/tessdata",
      corePath: "/ocr/",
      logger: (message) => {
        if (message.progress) {
          progress = Math.round(message.progress * 100);
          status = humanOcrStatus(message.status);
          render();
        }
      },
    });
    const result = await worker.recognize(file, {}, { blocks: true });
    await worker.terminate();
    const ocrLines = result.data.blocks?.flatMap((block) =>
      block.paragraphs.flatMap((paragraph) =>
        paragraph.lines.map((line) => ({
          text: line.text,
          confidence: line.confidence,
        })),
      ),
    );
    createDraft(file.name, result.data.text, result.data.confidence, ocrLines);
    status = `Read ${draft?.lines.length ?? 0} likely purchase lines from ${file.name}.`;
  } catch {
    error =
      "This photo could not be read locally. Try a sharper, upright photo or use “Paste receipt text” below.";
  } finally {
    busy = false;
    render(draft ? "#review-title" : undefined);
  }
}

function humanOcrStatus(value: string): string {
  const map: Record<string, string> = {
    "loading tesseract core": "Opening the local reading engine…",
    "initializing tesseract": "Preparing the local text reader…",
    "loading language traineddata": "Opening the English receipt model…",
    "recognizing text": "Identifying receipt lines…",
  };
  return map[value] ?? "Reading locally…";
}

function createDraft(
  name: string,
  text: string,
  confidence: number,
  ocrLines?: Array<{ text: string; confidence: number }>,
): void {
  if (freeLimitReached()) {
    showLimit();
    return;
  }
  const parsed = ocrLines?.length
    ? ocrLines.flatMap((line) => parseReceiptText(line.text, line.confidence))
    : parseReceiptText(text, confidence);
  const lines = parsed.map((line) => ({
    ...line,
    room: "Kitchen",
    category: "Home supply",
    warrantyDate: "",
  }));
  draft = {
    receiptId: crypto.randomUUID(),
    receiptName: name,
    merchant: inferMerchant(text),
    purchaseDate: inferDate(text),
    currency: inferCurrency(text),
    lines,
  };
}

function syncDraftFromForm(): void {
  if (!draft) return;
  const form = document.querySelector<HTMLFormElement>("#review-form");
  if (!form) return;
  const data = new FormData(form);
  draft.merchant = String(data.get("merchant") ?? "");
  draft.purchaseDate = String(data.get("purchaseDate") ?? "");
  draft.currency = String(data.get("currency") ?? "USD");
  draft.lines.forEach((line, i) => {
    line.included = data.has(`included-${i}`);
    line.name = String(data.get(`name-${i}`) ?? "").trim();
    line.quantity = Number(data.get(`quantity-${i}`) ?? 1);
    line.price = Number(data.get(`price-${i}`) ?? 0);
    line.room = String(data.get(`room-${i}`) ?? "Other");
    line.category = String(data.get(`category-${i}`) ?? "Other");
    line.warrantyDate = String(data.get(`warrantyDate-${i}`) ?? "");
  });
}

function acceptDraft(event: SubmitEvent): void {
  event.preventDefault();
  syncDraftFromForm();
  if (!draft) return;
  if (freeLimitReached()) {
    showLimit();
    return;
  }
  const chosen = draft.lines.filter((line) => line.included);
  if (!chosen.length) {
    error = "Select at least one receipt line, or discard this receipt.";
    render();
    return;
  }
  if (
    chosen.some((line) => !line.name || line.quantity < 1 || line.price < 0)
  ) {
    error =
      "Each selected line needs a name, quantity of at least 1, and a non-negative price.";
    render();
    return;
  }
  const now = new Date().toISOString();
  items.push(
    ...chosen.map((line) => ({
      ...line,
      receiptId: draft!.receiptId,
      receiptName: draft!.receiptName,
      merchant: draft!.merchant,
      currency: draft!.currency,
      purchaseDate: draft!.purchaseDate,
      createdAt: now,
    })),
  );
  receiptUsage += 1;
  saveReceiptUsage();
  saveItems();
  status = `${chosen.length} item${chosen.length === 1 ? "" : "s"} added to the room inventory.`;
  draft = null;
  error = "";
  if (fileQueue.length) {
    view = "intake";
    location.hash = "intake";
    render();
    setTimeout(() => void processNextFile(), 0);
  } else navigateTo("inventory");
}

function bindInventory(): void {
  document
    .querySelector<HTMLFormElement>("#search-form")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(e.currentTarget as HTMLFormElement).get("q");
      location.hash = `inventory?q=${encodeURIComponent(String(q ?? ""))}`;
      render();
    });
  document.querySelector("#clear-search")?.addEventListener("click", () => {
    location.hash = "inventory";
    render();
  });
  document
    .querySelector("#export-csv")
    ?.addEventListener("click", () =>
      download(
        "receipt-to-room-inventory.csv",
        inventoryToCsv(items),
        "text/csv;charset=utf-8",
      ),
    );
  document
    .querySelector("#export-pdf")
    ?.addEventListener("click", printInventory);
  document
    .querySelectorAll<HTMLButtonElement>("[data-edit]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        editingItemId = button.dataset.edit!;
        render("#edit-item-title");
      }),
    );
  document
    .querySelectorAll<HTMLButtonElement>("[data-delete]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        removeItem(button.dataset.delete!),
      ),
    );
  document.querySelector("#undo-delete")?.addEventListener("click", undoDelete);
  document.querySelector("#cancel-edit")?.addEventListener("click", () => {
    editingItemId = null;
    render("main h1");
  });
  document
    .querySelector<HTMLFormElement>("#edit-item-form")
    ?.addEventListener("submit", saveEditedItem);
}

function saveEditedItem(event: SubmitEvent): void {
  event.preventDefault();
  const index = items.findIndex((item) => item.id === editingItemId);
  if (index < 0) return;
  const data = new FormData(event.currentTarget as HTMLFormElement);
  const name = String(data.get("name") ?? "").trim();
  const quantity = Number(data.get("quantity"));
  const price = Number(data.get("price"));
  if (
    !name ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 999 ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    status =
      "Enter a name, a quantity from 1 to 999, and a non-negative price.";
    return;
  }
  items[index] = {
    ...items[index],
    name,
    quantity,
    price,
    currency: String(data.get("currency")),
    room: String(data.get("room")),
    category: String(data.get("category")),
    purchaseDate: String(data.get("purchaseDate")),
    warrantyDate: String(data.get("warrantyDate")),
    merchant: String(data.get("merchant")).trim(),
  };
  saveItems();
  editingItemId = null;
  status = `${name} updated.`;
  render("main h1");
}

function removeItem(id: string): void {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return;
  if (deleted) clearTimeout(deleted.timeout);
  const [item] = items.splice(index, 1);
  saveItems();
  const timeout = window.setTimeout(() => {
    deleted = null;
    render();
  }, 5000);
  deleted = { item, index, timeout };
  status = `${item.name} removed. Undo is available for five seconds.`;
  render();
}
function undoDelete(): void {
  if (!deleted) return;
  clearTimeout(deleted.timeout);
  items.splice(deleted.index, 0, deleted.item);
  saveItems();
  status = `${deleted.item.name} restored.`;
  deleted = null;
  render();
}

function download(name: string, body: string, type: string): void {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status = `${name} saved.`;
}

function printInventory(): void {
  const printable = document.createElement("iframe");
  printable.title = "Printable room inventory";
  printable.className = "print-frame";
  document.body.append(printable);
  const doc = printable.contentDocument!;
  const groups = new Map<string, InventoryItem[]>();
  for (const item of items)
    groups.set(item.room, [...(groups.get(item.room) ?? []), item]);
  doc.open();
  doc.write(
    `<!doctype html><html lang="en"><head><title>Receipt to Room inventory</title><style>body{font:14px system-ui;color:#19332b;margin:36px}h1,h2{font-family:Georgia,serif}header{border-bottom:2px solid #1f6349;margin-bottom:28px}table{width:100%;border-collapse:collapse;margin-bottom:28px}th,td{text-align:left;padding:8px;border-bottom:1px solid #ccc}td:last-child,th:last-child{text-align:right}.note{color:#53645c;font-size:12px}</style></head><body><header><h1>Household room inventory</h1><p>Prepared ${new Date().toLocaleDateString()} · ${items.length} reviewed items</p><p class="note">Purchase totals are user-reviewed records, not valuations or proof of insurance coverage. Payment details have been removed.</p></header>${Array.from(
      groups,
    )
      .map(
        ([room, roomItems]) =>
          `<section><h2>${escapeHtml(room)}</h2><table><thead><tr><th>Item</th><th>Category</th><th>Purchased</th><th>Warranty</th><th>Paid</th></tr></thead><tbody>${roomItems.map((item) => `<tr><td>${escapeHtml(redactPayment(item.name))}<div class="note">${escapeHtml(redactPayment(item.merchant))}</div></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.purchaseDate)}</td><td>${escapeHtml(item.warrantyDate || "—")}</td><td>${escapeHtml(money(item.price * item.quantity, item.currency))}</td></tr>`).join("")}</tbody></table></section>`,
      )
      .join("")}</body></html>`,
  );
  doc.close();
  setTimeout(() => {
    printable.contentWindow?.focus();
    printable.contentWindow?.print();
    setTimeout(() => printable.remove(), 1000);
  }, 150);
}

function consumeLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  status = "License received. Verifying in the background…";
}
function readLicenseCache(): LicenseCache | null {
  try {
    return JSON.parse(
      localStorage.getItem(LICENSE_CACHE_KEY) ?? "null",
    ) as LicenseCache | null;
  } catch {
    return null;
  }
}
async function refreshLicense(force = false): Promise<boolean> {
  if (demoMode) return false;
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return false;
  const cache = readLicenseCache();
  if (!force && cache && Date.now() - cache.checkedAt < 86_400_000)
    return cache.valid;
  try {
    const response = await fetch(
      `${VERIFY}?license=${encodeURIComponent(token)}`,
    );
    if (response.status === 429) {
      const retrySeconds = Math.max(
        1,
        Math.ceil(Number(response.headers.get("Retry-After")) || 1),
      );
      status = `Too many license checks. Try again in ${retrySeconds} second${retrySeconds === 1 ? "" : "s"}.`;
      render();
      return licenseValid;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const verdict = (await response.json()) as {
      valid: boolean;
      reason?: string;
    };
    licenseValid = verdict.valid;
    localStorage.setItem(
      LICENSE_CACHE_KEY,
      JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }),
    );
    status = verdict.valid
      ? "License verified. You can add unlimited receipts."
      : "License no longer active. You can keep using and exporting existing records.";
    render();
    return verdict.valid;
  } catch {
    status = navigator.onLine
      ? "Could not verify the license just now. Try again shortly."
      : "Offline. The last license result remains in use.";
    render();
    return licenseValid;
  }
}

function bindLicense(): void {
  document
    .querySelector<HTMLFormElement>("#license-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = document
        .querySelector<HTMLInputElement>("#license-token")!
        .value.trim();
      if (!token) return;
      localStorage.setItem(LICENSE_KEY, token);
      status = "Verifying license…";
      render();
      await refreshLicense(true);
    });
  document
    .querySelector("#backup-json")
    ?.addEventListener("click", () =>
      download(
        "receipt-to-room-backup.json",
        JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), items },
          null,
          2,
        ),
        "application/json",
      ),
    );
  document
    .querySelector<HTMLInputElement>("#restore-json")
    ?.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const restored = inventoryFromBackup(
          JSON.parse(await file.text()) as unknown,
        );
        if (!restored) throw new Error("Invalid backup schema");
        items = restored;
        receiptUsage = Math.max(
          receiptUsage,
          new Set(items.map((item) => item.receiptId)).size,
        );
        saveReceiptUsage();
        saveItems();
        status = `Restored ${items.length} items.`;
        navigateTo("inventory");
      } catch {
        status =
          "That file is not a valid Receipt to Room backup. Your current records were kept.";
        render();
      }
    });
}

window.addEventListener("online", () => {
  status = "Back online.";
  render();
  void refreshLicense();
});
window.addEventListener("offline", () => {
  status = "Offline. Local work remains available.";
  render();
});
window.addEventListener("hashchange", () => {
  view = viewFromLocation();
  editingItemId = null;
  render("main h1");
});
