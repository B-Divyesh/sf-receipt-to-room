import { describe, expect, it } from "vitest";
import { confidenceLabel, inferDate, inventoryToCsv, parseReceiptText, redactPayment, totalValue, type InventoryItem } from "../app/lib";

describe("receipt parsing", () => {
  it("extracts products and skips totals and card lines", () => {
    const lines = parseReceiptText("GARDEN STORE\n2 x Storage Box 12.50\nDesk Lamp $39.00\nSubtotal 64.00\nVISA **** 1234", 78);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ name: "Storage Box", quantity: 2, price: 12.5, confidenceLabel: "check" });
  });
  it("uses explicit confidence bands", () => { expect(confidenceLabel(90)).toBe("good"); expect(confidenceLabel(70)).toBe("check"); expect(confidenceLabel(40)).toBe("low"); });
  it("recognizes common dates", () => { expect(inferDate("Purchased 2026-08-19")).toBe("2026-08-19"); expect(inferDate("19/08/2026")).toBe("2026-08-19"); });
});

describe("safe exports", () => {
  const item: InventoryItem = { id:"1",receiptId:"r1",receiptName:"shop.jpg",name:"=Lamp",quantity:2,price:12.5,confidence:90,confidenceLabel:"good",included:true,merchant:"Store card **** 1234",room:"Office",category:"Decor",purchaseDate:"2026-08-19",warrantyDate:"",createdAt:"2026-08-19T00:00:00Z" };
  it("redacts payment details", () => expect(redactPayment("VISA **** 1234")).toContain("[redacted payment]"));
  it("guards CSV formulas and totals", () => { const csv=inventoryToCsv([item]);expect(csv).toContain("'=Lamp");expect(csv).not.toContain("1234");expect(totalValue([item])).toBe(25); });
});
