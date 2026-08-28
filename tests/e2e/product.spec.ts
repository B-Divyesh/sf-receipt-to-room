import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page is responsive and accessible", async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 });
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading",{level:1})).toHaveText(/receipts, planted/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link",{name:/download|view the latest/i}).first()).toBeVisible();
  const results=await new AxeBuilder({page:page as never}).analyze();
  expect(results.violations.filter((v)=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("manual receipt becomes a searchable, exportable inventory", async ({ page }) => {
  await page.addInitScript(()=>localStorage.clear());
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button",{name:"Paste receipt text"}).click();
  await page.getByLabel("One purchased item and price per line").fill("HOME STORE\nDesk lamp 39.00\nStorage box 12.50\nTOTAL 51.50");
  await page.getByRole("button",{name:"Review these lines"}).click();
  await expect(page.getByRole("heading",{name:"Check the useful lines"})).toBeVisible();
  await page.locator('select[name="room"]').selectOption("Office");
  await page.getByRole("button",{name:"Add to room inventory"}).click();
  await expect(page.getByRole("heading",{name:"Your room inventory"})).toBeVisible();
  await expect(page.getByText("Desk lamp",{exact:true})).toBeVisible();
  const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export CSV"}).click();expect((await download).suggestedFilename()).toBe("receipt-to-room-inventory.csv");
  const results=await new AxeBuilder({page:page as never}).analyze();
  expect(results.violations.filter((v)=>["serious","critical"].includes(v.impact??""))).toEqual([]);
});

test("bundled OCR reads a receipt without external runtime assets", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(()=>localStorage.clear());
  const externalRequests:string[]=[];
  page.on("request",(request)=>{if(/^https?:/.test(request.url())&&!request.url().startsWith("http://127.0.0.1:1420"))externalRequests.push(request.url());});
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#receipt-files").setInputFiles("tests/fixtures/sample-receipt.png");
  await expect(page.getByRole("heading",{name:"Check the useful lines"})).toBeVisible({timeout:75_000});
  await expect(page.locator('[name^="name-"]').first()).not.toHaveValue("");
  expect(externalRequests).toEqual([]);
});
