import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const releaseApi = "https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest";
const release = { tag_name: "v0.1.4", assets: [
  { name: "Receipt.to.Room_0.1.4_x64_en-US.msi", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.4/Receipt.to.Room_0.1.4_x64_en-US.msi" },
  { name: "Receipt.to.Room_0.1.4_x64-setup.exe", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.4/Receipt.to.Room_0.1.4_x64-setup.exe" },
  { name: "Receipt.to.Room_0.1.4_aarch64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.4/Receipt.to.Room_0.1.4_aarch64.dmg" },
  { name: "Receipt.to.Room_0.1.4_x64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.4/Receipt.to.Room_0.1.4_x64.dmg" },
  { name: "Receipt.to.Room_0.1.4_amd64.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.4/Receipt.to.Room_0.1.4_amd64.AppImage" }
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
  await expect(page.getByRole("link", { name: /download linux appimage/i })).toHaveAttribute("href", /releases\/download\/v0\.1\.4/);
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
  await page.goto("http://127.0.0.1:1420/");
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

test("@claim:sample-demo is isolated, searchable, resettable, and keyboard reachable", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("receipt-to-room:inventory:v1", "real-data-must-stay"));
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/?demo=1");
  await expect(page).toHaveTitle("Demo — Receipt to Room");
  await expect(page.getByLabel("Demo mode")).toContainText("sample data, nothing is saved to your real records");
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await page.getByLabel("Search sample records").fill("lamp");
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("receipt-to-room:inventory:v1"))).toBe("real-data-must-stay");
  expect(await page.evaluate(() => localStorage.getItem("demo:receipt-to-room:sample:v1"))).toBeNull();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("@claim:csv-export @claim:receipt-workflow @claim:local-storage manual receipt becomes a searchable, exportable inventory", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (/^https?:/.test(request.url()) && !request.url().startsWith("http://127.0.0.1:1420")) externalRequests.push(request.url()); });
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("HOME STORE\nDesk lamp 39.00\nStorage box 12.50\nTOTAL 51.50");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible();
  await page.locator('select[name="room"]').selectOption("Office");
  await page.locator('select[name="category"]').selectOption("Electronics");
  await page.locator('input[name="warrantyDate"]').fill("2028-08-28");
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  await page.getByLabel("Search items, rooms, categories, or retailers").fill("lamp");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Desk lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Electronics", { exact: true })).toBeVisible();
  await expect(page.getByText("Warranty to 2028-08-28", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await download;
  expect(csv.suggestedFilename()).toBe("receipt-to-room-inventory.csv");
  const csvText = await (await import("node:fs/promises")).readFile(await csv.path() as string, "utf8");
  expect(csvText).toContain("Desk lamp");
  expect(csvText).toContain("Office");
  expect(await page.evaluate(() => localStorage.getItem("receipt-to-room:inventory:v1"))).toContain("Desk lamp");
  expect(externalRequests).toEqual([]);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("@claim:bulk-queue queues two shipped receipt images", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#receipt-files").setInputFiles(["tests/fixtures/sample-receipt.png", "tests/fixtures/sample-receipt.png"]);
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  expect(await page.evaluate(() => new Set(JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).map((item: { receiptId: string }) => item.receiptId)).size)).toBe(2);
});

test("@claim:print-undo creates printable output and restores a removed item", async ({ page }) => {
  await page.addInitScript((record) => localStorage.setItem("receipt-to-room:inventory:v1", JSON.stringify([record])), storedReceipt("receipt-print", "Reading lamp"));
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Inventory 1" }).click();
  await page.getByRole("button", { name: "Print / save PDF" }).click();
  const printFrame = page.locator('iframe[title="Printable room inventory"]');
  await expect(printFrame).toHaveCount(1);
  expect(await printFrame.evaluate((frame: HTMLIFrameElement) => frame.contentDocument?.body.textContent)).toContain("Reading lamp");
  await page.getByRole("button", { name: "Remove Reading lamp" }).click();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("receipt-to-room:inventory:v1"))).toContain("Reading lamp");
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

test("checkout return stores, strips, verifies, and unlocks a license", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  let verifiedToken = "";
  await page.route("https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*", async (route) => {
    verifiedToken = new URL(route.request().url()).searchParams.get("license") ?? "";
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, reason: "ok", expires_at: null }) });
  });

  await page.goto("http://127.0.0.1:1420/?license=licensed-test-token#license");
  await expect.poll(() => verifiedToken).toBe("licensed-test-token");
  await expect.poll(() => new URL(page.url()).searchParams.has("license")).toBe(false);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("sb_license:receipt-to-room"))).toBe("licensed-test-token");
  await page.getByRole("button", { name: /field kit unlocked/i }).click();
  await expect(page.getByRole("heading", { name: "Your full field kit is unlocked." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download JSON backup" })).toBeVisible();
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
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#receipt-files").setInputFiles("tests/fixtures/sample-receipt.png");
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible({ timeout: 75_000 });
  await expect(page.locator('[name^="name-"]').first()).not.toHaveValue("");
  expect(externalRequests).toEqual([]);
});
