export type Confidence = "good" | "check" | "low";

export interface ParsedLine {
  id: string;
  name: string;
  quantity: number;
  price: number;
  confidence: number;
  confidenceLabel: Confidence;
  included: boolean;
}

export interface DraftLine extends ParsedLine {
  room: string;
  category: string;
  warrantyDate: string;
}

export interface InventoryItem extends ParsedLine {
  receiptId: string;
  receiptName: string;
  merchant: string;
  currency: string;
  room: string;
  category: string;
  purchaseDate: string;
  warrantyDate: string;
  createdAt: string;
}

const OMIT = /\b(total|subtotal|tax|vat|change|cash|tender|balance|visa|mastercard|amex|card|payment|receipt|thank you)\b/i;

export function confidenceLabel(value: number): Confidence {
  if (value >= 86) return "good";
  if (value >= 65) return "check";
  return "low";
}

export function parseReceiptText(text: string, confidence = 72): ParsedLine[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed: ParsedLine[] = [];
  for (const raw of lines) {
    if (OMIT.test(raw)) continue;
    const match = raw.match(/^(.+?)\s+(?:[$€£₹]\s*)?(\d{1,6}(?:,\d{3})*(?:\.\d{2})?|\d{1,6},\d{2})$/);
    if (!match || match[1].length < 2) continue;
    const quantityMatch = match[1].match(/^(\d{1,2})\s*[x×]\s*(.+)$/i);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const name = (quantityMatch?.[2] ?? match[1]).replace(/^[*#\-\s]+/, "").trim();
    const amount = match[2];
    const price = Number(amount.includes(".") ? amount.replaceAll(",", "") : amount.replace(",", "."));
    if (!name || !Number.isFinite(price)) continue;
    const lineConfidence = Math.max(1, Math.min(99, Math.round(confidence)));
    parsed.push({
      id: crypto.randomUUID(), name, quantity, price,
      confidence: lineConfidence, confidenceLabel: confidenceLabel(lineConfidence), included: true
    });
  }
  return parsed;
}

export function inferMerchant(text: string): string {
  return text.split(/\r?\n/).map((line) => line.trim())
    .find((line) => line.length > 2 && line.length < 60 && !/[\d]{4}/.test(line))?.slice(0, 60) ?? "Unknown retailer";
}

export function inferDate(text: string): string {
  const yearFirst = text.match(/\b(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/);
  const local = text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/);
  if (!yearFirst && !local) return new Date().toISOString().slice(0, 10);
  let year: string;
  let month: string;
  let day: string;
  if (yearFirst) [, year, month, day] = yearFirst;
  else {
    const [, first, second, parsedYear] = local!;
    year = parsedYear;
    // Unambiguous values win. Ambiguous numeric dates use the product's
    // default USD convention (month/day/year).
    [month, day] = Number(first) > 12 ? [second, first] : [first, second];
  }
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === iso
    ? iso
    : new Date().toISOString().slice(0, 10);
}

export function inferCurrency(text: string): string {
  if (text.includes("₹")) return "INR";
  if (text.includes("€")) return "EUR";
  if (text.includes("£")) return "GBP";
  return "USD";
}

export function redactPayment(value: string): string {
  return value
    .replace(/\b(?:visa|mastercard|amex|card|acct|account)\s*[:#-]?\s*(?:[*xX•\s-]*\d){2,}\b/gi, "[redacted payment]")
    .replace(/\b(?:\d[ -]*?){12,19}\b/g, "[redacted payment]");
}

function csvCell(value: unknown): string {
  let text = redactPayment(String(value ?? ""));
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function inventoryToCsv(items: InventoryItem[]): string {
  const header = ["Item", "Quantity", "Paid", "Currency", "Room", "Category", "Purchase date", "Warranty until", "Retailer", "Receipt"];
  const rows = items.map((item) => [
    item.name, item.quantity, item.price.toFixed(2), item.currency || "USD", item.room, item.category,
    item.purchaseDate, item.warrantyDate, item.merchant, item.receiptName
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function totalValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

const confidenceValues = new Set<Confidence>(["good", "check", "low"]);
const currencyValues = new Set(["USD", "INR", "EUR", "GBP", "CAD", "AUD"]);
const roomValues = new Set(["Kitchen", "Living room", "Bedroom", "Bathroom", "Office", "Garage", "Other"]);
const categoryValues = new Set(["Appliance", "Electronics", "Furniture", "Kitchenware", "Home supply", "Tool", "Decor", "Other"]);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !isoDate.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function isInventoryItem(value: unknown): value is InventoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const strings = ["id", "receiptId", "receiptName", "name", "merchant", "currency", "room", "category", "purchaseDate", "warrantyDate", "createdAt"];
  return strings.every((key) => typeof item[key] === "string") &&
    Boolean(item.id) && Boolean(item.receiptId) && Boolean(item.receiptName) && Boolean(item.name) && Boolean(item.merchant) &&
    Number.isInteger(item.quantity) && Number(item.quantity) >= 1 && Number(item.quantity) <= 999 &&
    typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
    typeof item.confidence === "number" && Number.isFinite(item.confidence) && item.confidence >= 1 && item.confidence <= 100 &&
    confidenceValues.has(item.confidenceLabel as Confidence) && typeof item.included === "boolean" &&
    currencyValues.has(item.currency as string) && roomValues.has(item.room as string) && categoryValues.has(item.category as string) &&
    isIsoDate(item.purchaseDate) && (item.warrantyDate === "" || isIsoDate(item.warrantyDate)) &&
    !Number.isNaN(Date.parse(item.createdAt as string));
}

export function inventoryFromBackup(value: unknown): InventoryItem[] | null {
  if (!value || typeof value !== "object") return null;
  const backup = value as { version?: unknown; items?: unknown };
  if (backup.version !== 1 || !Array.isArray(backup.items) || !backup.items.every(isInventoryItem)) return null;
  return backup.items;
}
