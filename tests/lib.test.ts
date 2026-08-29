import { describe, expect, it } from "vitest";
import { confidenceLabel, inferDate, inventoryFromBackup, inventoryToCsv, parseReceiptText, redactPayment, totalValue, type InventoryItem } from "../app/lib";

describe("receipt parsing", () => {
  it("extracts products and skips totals and card lines", () => {
    const lines = parseReceiptText("GARDEN STORE\n2 x Storage Box 12.50\nDesk Lamp $39.00\nSubtotal 64.00\nVISA **** 1234", 78);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ name: "Storage Box", quantity: 2, price: 12.5, confidenceLabel: "check" });
  });
  it("uses explicit confidence bands", () => { expect(confidenceLabel(90)).toBe("good"); expect(confidenceLabel(70)).toBe("check"); expect(confidenceLabel(40)).toBe("low"); });
  it("recognizes ISO, day-first, and common US dates", () => {
    expect(inferDate("Purchased 2026-08-19")).toBe("2026-08-19");
    expect(inferDate("19/08/2026")).toBe("2026-08-19");
    expect(inferDate("Purchased 08/19/2026")).toBe("2026-08-19");
  });
  it("accepts grouped and whole-number receipt prices", () => {
    expect(parseReceiptText("Desk lamp 1,299.99\nSide table 39")).toMatchObject([
      { name: "Desk lamp", price: 1299.99 },
      { name: "Side table", price: 39 }
    ]);
  });
});

describe("safe exports", () => {
  const item: InventoryItem = { id:"1",receiptId:"r1",receiptName:"shop.jpg",name:"=Lamp",quantity:2,price:12.5,currency:"USD",confidence:90,confidenceLabel:"good",included:true,merchant:"Store card **** 1234",room:"Office",category:"Decor",purchaseDate:"2026-08-19",warrantyDate:"",createdAt:"2026-08-19T00:00:00Z" };
  it("removes payment details", () => expect(redactPayment("VISA **** 1234")).toContain("[payment details removed]"));
  it("guards CSV formulas and totals", () => { const csv=inventoryToCsv([item]);expect(csv).toContain("'=Lamp");expect(csv).not.toContain("1234");expect(totalValue([item])).toBe(25); });
});

describe("backup validation", () => {
  const item: InventoryItem = { id:"1",receiptId:"r1",receiptName:"shop.jpg",name:"Lamp",quantity:1,price:12.5,currency:"USD",confidence:90,confidenceLabel:"good",included:true,merchant:"Store",room:"Office",category:"Decor",purchaseDate:"2026-08-19",warrantyDate:"",createdAt:"2026-08-19T00:00:00Z" };
  it("accepts complete v1 records and rejects array-shaped corrupt records", () => {
    expect(inventoryFromBackup({ version: 1, items: [item] })).toEqual([item]);
    expect(inventoryFromBackup({ version: 1, items: [{}] })).toBeNull();
    expect(inventoryFromBackup({ items: [item] })).toBeNull();
  });
});
