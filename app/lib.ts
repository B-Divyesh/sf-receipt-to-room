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
    const match = raw.match(/^(.+?)\s+(?:[$€£₹]\s*)?(\d{1,6}(?:[.,]\d{2}))$/);
    if (!match || match[1].length < 2) continue;
    const quantityMatch = match[1].match(/^(\d{1,2})\s*[x×]\s*(.+)$/i);
    const quantity = quantityMatch ? Number(quantityMatch[1]) : 1;
    const name = (quantityMatch?.[2] ?? match[1]).replace(/^[*#\-\s]+/, "").trim();
    const price = Number(match[2].replace(",", "."));
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
  const match = text.match(/\b(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/) ??
    text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/);
  if (!match) return new Date().toISOString().slice(0, 10);
  const [year, month, day] = match[1].startsWith("20")
    ? [match[1], match[2], match[3]]
    : [match[3], match[2], match[1]];
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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
