import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const releaseApi = "https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest";
const release = { tag_name: "v0.1.5", assets: [
  { name: "Receipt.to.Room_0.1.5_x64_en-US.msi", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.5/Receipt.to.Room_0.1.5_x64_en-US.msi" },
  { name: "Receipt.to.Room_0.1.5_x64-setup.exe", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.5/Receipt.to.Room_0.1.5_x64-setup.exe" },
  { name: "Receipt.to.Room_0.1.5_aarch64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.5/Receipt.to.Room_0.1.5_aarch64.dmg" },
  { name: "Receipt.to.Room_0.1.5_x64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.5/Receipt.to.Room_0.1.5_x64.dmg" },
  { name: "Receipt.to.Room_0.1.5_amd64.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.5/Receipt.to.Room_0.1.5_amd64.AppImage" }
] };

const storedReceipt = (receiptId: string, name: string) => ({
  id: `${receiptId}-item`, receiptId, receiptName: `${receiptId}.png`, name,
  quantity: 1, price: 10, currency: "USD", confidence: 100,
  confidenceLabel: "good", included: true, merchant: "Home Store",
  room: "Office", category: "Decor", purchaseDate: "2026-08-28",
  warrantyDate: "", createdAt: "2026-08-28T00:00:00.000Z"
});

async function mockRelease(page: Page, body: unknown = release, status = 200): Promise<void> {
  await page.route(releaseApi, (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }));
}

test("@claim:price landing page is responsive and accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/turn receipts into room records/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /try it with sample data/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /download linux appimage/i })).toBeVisible();
  await expect(page.getByText("$29", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buy the field kit" })).toHaveAttribute("href", /products\/receipt-to-room\/checkout$/);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);

  await page.goto("http://127.0.0.1:1420/");
  await page.evaluate((records) => localStorage.setItem("receipt-to-room:inventory:v1", JSON.stringify(records)), [
    storedReceipt("receipt-1", "Lamp"), storedReceipt("receipt-2", "Chair"), storedReceipt("receipt-3", "Kettle")
  ]);
  await page.reload();
  await expect(page.getByText("3 of 3 free receipts used.")).toBeVisible();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await expect(page.getByRole("heading", { name: "Keep every room record, for good." })).toBeVisible();
  expect(await page.evaluate(() => new Set(JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).map((item: { receiptId: string }) => item.receiptId)).size)).toBe(3);

  await page.getByRole("button", { name: /inventory/i }).click();
  await page.getByRole("button", { name: "Remove Lamp" }).click();
  await page.getByLabel("Workspace").getByRole("button", { name: "Add receipt" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await expect(page.getByRole("heading", { name: "Keep every room record, for good." })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).length)).toBe(2);

  await page.evaluate(() => {
    localStorage.setItem("sb_license:receipt-to-room", "cached-valid-token");
    localStorage.setItem("sb_license:receipt-to-room:verdict", JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("FOURTH SHOP\nFourth item 4.00\nTOTAL 4.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByText("Fourth item", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => new Set(JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).map((item: { receiptId: string }) => item.receiptId)).size)).toBe(3);
  await page.getByRole("button", { name: /field kit unlocked/i }).click();
  const backup = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON backup" }).click();
  expect((await backup).suggestedFilename()).toBe("receipt-to-room-backup.json");
});

test("@claim:release-api uses the GitHub API, caches a matching download, and never fetches the redirect manifest", async ({ page }) => {
  const requests: string[] = [];
  const consoleErrors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: /download linux appimage/i })).toHaveAttribute("href", /releases\/download\/v0\.1\.5/);
  await expect(page.getByText(/unsigned release/)).toBeVisible();
  await page.getByRole("button", { name: "See all downloads" }).click();
  await expect(page.locator("#download-list")).toContainText("macOS (Apple silicon)");
  await expect(page.locator("#download-list")).toContainText("macOS (Intel)");
  await expect(page.locator("#download-list")).toContainText("Windows");
  await expect(page.locator("#download-list")).toContainText("Linux AppImage");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("receipt-to-room:release-metadata:v2"))).not.toBeNull();
  expect(requests).toContain(releaseApi);
  expect(requests.some((url) => url.includes("github.com/B-Divyesh/sf-receipt-to-room/releases/latest/download/latest.json"))).toBe(false);
  expect(consoleErrors).toEqual([]);
});

test("normal landing hides demo state while the demo URL shows it", async ({ page }) => {
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveCSS("outline-style", "solid");
  await page.goto("http://127.0.0.1:4173/?demo=1");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
});

test("@claim:offline-work manual intake and export remain available offline", async ({ page, context }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await context.setOffline(true);
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Offline" })).toBeVisible();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("LOCAL SHOP\nToolbox 24.00\nTOTAL 24.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByText("Toolbox", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toBe("receipt-to-room-inventory.csv");
});

test("unavailable releases show a calm publishing state without console errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockRelease(page, { message: "Not Found" }, 404);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByText("Downloads are being published. Check the release page again soon.")).toBeVisible();
  await expect(page.getByRole("link", { name: "View release page" })).toHaveAttribute("href", /releases\/latest$/);
  expect(pageErrors).toEqual([]);
});

test("@claim:sample-demo is isolated, searchable, resettable, and keyboard reachable", async ({ page, browser }) => {
  const realRecord = storedReceipt("real-receipt", "Real lamp");
  await page.addInitScript((record) => localStorage.setItem("receipt-to-room:inventory:v1", JSON.stringify([record])), realRecord);
  await mockRelease(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveTitle("Demo — Receipt to Room");
  await expect(page.getByLabel("Demo mode")).toContainText("sample data, nothing is saved to your real records");
  const sampleHeading = page.getByRole("heading", { name: "Your room inventory" });
  await expect(sampleHeading).toBeVisible();
  await expect(sampleHeading).toBeFocused();
  expect((await page.getByText("Cedar kettle", { exact: true }).boundingBox())!.y).toBeLessThan(844);
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await page.getByLabel("Search sample records").fill("lamp");
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0].name)).toBe("Real lamp");
  expect(await page.evaluate(() => localStorage.getItem("demo:receipt-to-room:sample:v1"))).toBeNull();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);

  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Cedar kettle" }).click();
  await page.locator('#edit-item-form select[name="room"]').selectOption("Living room");
  await page.getByRole("button", { name: "Save changes" }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0].name)).toBe("Real lamp");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("demo:receipt-to-room:inventory:v1")!)[0].room)).toBe("Living room");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("demo:receipt-to-room:inventory:v1")!)[0].room)).toBe("Kitchen");
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("demo:receipt-to-room:inventory:v1"))).toBeNull();
  const cleanContext = await browser.newContext();
  const cleanPage = await cleanContext.newPage();
  await cleanPage.goto("http://127.0.0.1:1420/#intake");
  await cleanPage.getByRole("button", { name: "Load sample project" }).click();
  await expect(cleanPage.getByLabel("Demo mode")).toBeVisible();
  await expect(cleanPage.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await cleanContext.close();
});

test("@claim:csv-export @claim:receipt-workflow @claim:local-storage @claim:editable-records a mixed-room receipt stays accurate and editable", async ({ page }) => {
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem("receipt-to-room:inventory:v1", "real-records-stay-separate"); });
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith("http://127.0.0.1:1420")) externalRequests.push(request.url()); });
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("HOME STORE\nKitchen kettle 39\nOffice lamp 1,299.99\nTOTAL 1338.99\nPurchased 08/19/2026");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible();
  const reviewAxe = await new AxeBuilder({ page: page as never }).analyze();
  expect(reviewAxe.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  await page.locator('select[name="room-0"]').selectOption("Kitchen");
  await page.locator('select[name="category-0"]').selectOption("Appliance");
  await page.locator('input[name="warrantyDate-0"]').fill("2028-08-19");
  await page.locator('select[name="room-1"]').selectOption("Office");
  await page.locator('select[name="category-1"]').selectOption("Electronics");
  await page.locator('input[name="warrantyDate-1"]').fill("2029-08-19");
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  await page.getByLabel("Search items, rooms, categories, or retailers").fill("lamp");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Office lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Electronics", { exact: true })).toBeVisible();
  await expect(page.getByText("Warranty to 2029-08-19", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Office lamp" }).click();
  const editForm = page.locator("#edit-item-form");
  await editForm.locator('select[name="room"]').selectOption("Living room");
  await editForm.locator('select[name="category"]').selectOption("Decor");
  await editForm.locator('input[name="warrantyDate"]').fill("2030-08-19");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Living room", { exact: true })).toBeVisible();
  await expect(page.getByText("Warranty to 2030-08-19", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await download;
  expect(csv.suggestedFilename()).toBe("receipt-to-room-inventory.csv");
  const csvText = await (await import("node:fs/promises")).readFile(await csv.path() as string, "utf8");
  expect(csvText).toContain("Office lamp");
  expect(csvText).toContain("Living room");
  expect(await page.evaluate(() => localStorage.getItem("demo:receipt-to-room:inventory:v1"))).toContain("Office lamp");
  expect(await page.evaluate(() => localStorage.getItem("receipt-to-room:inventory:v1"))).toBe("real-records-stay-separate");
  expect(externalRequests).toEqual([]);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("@claim:bulk-queue queues two shipped receipt images", async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  const fixture = await (await import("node:fs/promises")).readFile("tests/fixtures/sample-receipt.png");
  await page.locator("#receipt-files").setInputFiles([
    { name: "sample-receipt-a.png", mimeType: "image/png", buffer: fixture },
    { name: "sample-receipt-b.png", mimeType: "image/png", buffer: fixture }
  ]);
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  const addToInventory = page.getByRole("button", { name: "Add to room inventory" });
  await addToInventory.click();
  await expect(addToInventory).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  await addToInventory.click();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  expect(await page.evaluate(() => new Set(JSON.parse(localStorage.getItem("demo:receipt-to-room:inventory:v1")!).map((item: { receiptId: string }) => item.receiptId)).size)).toBe(4);
});

test("@claim:print-undo creates printable output and restores a removed item", async ({ page }) => {
  await page.addInitScript((record) => localStorage.setItem("demo:receipt-to-room:inventory:v1", JSON.stringify([record])), storedReceipt("receipt-print", "Reading lamp"));
  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  await page.getByRole("button", { name: "Print / save PDF" }).click();
  const printFrame = page.locator('iframe[title="Printable room inventory"]');
  await expect(printFrame).toHaveCount(1);
  expect(await printFrame.evaluate((frame: HTMLIFrameElement) => frame.contentDocument?.body.textContent)).toContain("Reading lamp");
  await page.getByRole("button", { name: "Remove Reading lamp" }).click();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("demo:receipt-to-room:inventory:v1"))).toContain("Reading lamp");
});

test("blank manual receipt keeps its named recovery field visible and focused", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByRole("button", { name: "Review these lines" }).click();

  const textarea = page.getByLabel("One purchased item and price per line");
  await expect(page.getByRole("alert")).toHaveText("Paste at least one item and price, then try again.");
  await expect(textarea).toBeVisible();
  await expect(textarea).toBeFocused();
  await expect(textarea).toHaveAttribute("aria-invalid", "true");
  await expect(textarea).toHaveAttribute("aria-describedby", "manual-error");

  await textarea.fill("Desk lamp 39.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible();
});

test("@claim:image-input rejects unsupported and oversized receipt files with recovery guidance", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page.locator("#receipt-files").setInputFiles({ name: "receipt.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") });
  await expect(page.getByRole("alert")).toContainText("Use a JPG, PNG, or WebP no larger than 10 MB");
  await page.locator("#receipt-files").setInputFiles({ name: "large.png", mimeType: "image/png", buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole("alert")).toContainText("large.png was skipped");
  await expect(page.getByRole("button", { name: "Paste receipt text" })).toBeVisible();
});

test("deep links survive reload and mobile screen changes restore heading focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((record) => localStorage.setItem("receipt-to-room:inventory:v1", JSON.stringify([record])), storedReceipt("route", "Route lamp"));
  await page.goto("http://127.0.0.1:1420/#inventory");
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();

  await page.getByRole("button", { name: "Add receipt" }).first().click();
  await expect(page.getByRole("heading", { name: "Turn a receipt into room records." })).toBeFocused();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("SHOP\nDesk lamp 39");
  await page.getByRole("button", { name: "Review these lines" }).click();
  const reviewHeading = page.getByRole("heading", { name: "Check the useful lines" });
  await expect(reviewHeading).toBeFocused();
  expect((await reviewHeading.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
  expect((await reviewHeading.boundingBox())!.y).toBeLessThan(844);
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  const inventoryHeading = page.getByRole("heading", { name: "Your room inventory" });
  await expect(inventoryHeading).toBeFocused();
  expect((await inventoryHeading.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
  expect((await inventoryHeading.boundingBox())!.y).toBeLessThan(844);
});

test("@claim:backup-restore rejects malformed records without replacing known-good inventory", async ({ page }) => {
  const existing = storedReceipt("safe", "Safe lamp");
  const restored = storedReceipt("restored", "Restored chair");
  await page.addInitScript((record) => {
    localStorage.setItem("receipt-to-room:inventory:v1", JSON.stringify([record]));
    localStorage.setItem("sb_license:receipt-to-room", "cached-valid-token");
    localStorage.setItem("sb_license:receipt-to-room:verdict", JSON.stringify({ valid: true, checkedAt: Date.now() }));
  }, existing);
  const pageErrors: string[] = [];
  page.on("pageerror", (event) => pageErrors.push(event.message));
  await page.goto("http://127.0.0.1:1420/#license");
  const backupDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON backup" }).click();
  expect((await backupDownload).suggestedFilename()).toBe("receipt-to-room-backup.json");
  await page.locator("#restore-json").setInputFiles({ name: "valid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ version: 1, items: [restored] })) });
  await expect(page.getByText("Restored chair", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /field kit unlocked/i }).click();
  await page.locator("#restore-json").setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"version":1,"items":[{}]}') });
  await expect(page.getByRole("status")).toContainText("current records were kept");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0].name)).toBe("Restored chair");
  await page.getByRole("button", { name: /inventory/i }).click();
  await expect(page.getByText("Restored chair", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("@claim:redacted-exports @claim:privacy-boundaries exports redact payment details without tracking", async ({ page }) => {
  const privateRecord = { ...storedReceipt("private", "Desk lamp"), merchant: "Home Store VISA 4111 1111 1111 1111" };
  await page.addInitScript((record) => localStorage.setItem("demo:receipt-to-room:inventory:v1", JSON.stringify([record])), privateRecord);
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith("http://127.0.0.1:1420")) externalRequests.push(request.url()); });
  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await (await import("node:fs/promises")).readFile(await (await download).path() as string, "utf8");
  expect(csv).toContain("[redacted payment]");
  expect(csv).not.toContain("4111 1111 1111 1111");
  await page.getByRole("button", { name: "Print / save PDF" }).click();
  const printText = await page.locator('iframe[title="Printable room inventory"]').evaluate((frame: HTMLIFrameElement) => frame.contentDocument?.body.textContent ?? "");
  expect(printText).toContain("[redacted payment]");
  expect(printText).not.toContain("4111 1111 1111 1111");
  expect(externalRequests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  await page.goto("http://127.0.0.1:4173/privacy/");
  expect((await page.context().cookies()).filter((cookie) => cookie.name.toLowerCase().includes("analytics"))).toEqual([]);
  expect(await page.locator('script[src*="analytics"],script[src^="http"]').count()).toBe(0);
});

test("mobile first-screen links meet the 44 by 44 CSS pixel target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  for (const target of [page.getByRole("link", { name: "Receipt to Room home" }), page.getByLabel("Primary").getByRole("link", { name: "Demo", exact: true })]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("@claim:license-cache checkout return stores, strips, verifies, and caches a license", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420/");
  await page.evaluate(() => localStorage.clear());
  let verifiedToken = "";
  let verificationRequests = 0;
  await page.route("https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*", async (route) => {
    verificationRequests += 1;
    const requestUrl = new URL(route.request().url());
    expect(Array.from(requestUrl.searchParams.keys())).toEqual(["license"]);
    verifiedToken = requestUrl.searchParams.get("license") ?? "";
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, reason: "ok", expires_at: null }) });
  });

  await page.goto("http://127.0.0.1:1420/?license=licensed-test-token#license");
  await expect.poll(() => verifiedToken).toBe("licensed-test-token");
  await expect.poll(() => new URL(page.url()).searchParams.has("license")).toBe(false);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("sb_license:receipt-to-room"))).toBe("licensed-test-token");
  await page.getByRole("button", { name: /field kit unlocked/i }).click();
  await expect(page.getByRole("heading", { name: "Your full field kit is unlocked." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download JSON backup" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your full field kit is unlocked." })).toBeVisible();
  expect(verificationRequests).toBe(1);
});

test("@claim:license-rate-policy license throttling always presents a non-zero retry interval", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  let attempts = 0;
  await page.route("https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*", (route) => {
    attempts += 1;
    return attempts <= 30
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: false, reason: "invalid" }) })
      : route.fulfill({ status: 429, headers: { "Retry-After": "0" }, body: "rate limited" });
  });
  await page.goto("http://127.0.0.1:1420/#license");
  const allowed = await page.evaluate(async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 30; index += 1) {
      statuses.push((await fetch(`https://api.sociobot.in/api/v1/products/receipt-to-room/verify?license=fixture-${index}`)).status);
    }
    return statuses;
  });
  expect(allowed).toEqual(Array(30).fill(200));
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByLabel("License token").fill("rate-limited-token");
  await page.getByRole("button", { name: "Verify license" }).click();
  await expect(page.getByRole("status")).toContainText("Try again in 1 second.");
  expect(attempts).toBe(31);
});

test("@claim:local-ocr bundled OCR reads a receipt without external runtime assets", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => localStorage.clear());
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith("http://127.0.0.1:1420")) externalRequests.push(request.url()); });
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page.locator("#receipt-files").setInputFiles("tests/fixtures/sample-receipt.png");
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  await expect(page.locator('[name^="name-"]').first()).not.toHaveValue("");
  expect(await page.evaluate(() => Object.values(localStorage).every((value) => !String(value).startsWith("data:image/")))).toBe(true);
  expect(externalRequests).toEqual([]);
});
