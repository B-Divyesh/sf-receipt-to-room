import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const releaseApi = "https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest";
const release = { tag_name: "v0.1.1", assets: [
  { name: "Receipt.to.Room_0.1.1_x64_en-US.msi", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.1/Receipt.to.Room_0.1.1_x64_en-US.msi" },
  { name: "Receipt.to.Room_0.1.1_x64-setup.exe", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.1/Receipt.to.Room_0.1.1_x64-setup.exe" },
  { name: "Receipt.to.Room_0.1.1_aarch64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.1/Receipt.to.Room_0.1.1_aarch64.dmg" },
  { name: "Receipt.to.Room_0.1.1_x64.dmg", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.1/Receipt.to.Room_0.1.1_x64.dmg" },
  { name: "Receipt.to.Room_0.1.1_amd64.AppImage", browser_download_url: "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.1/Receipt.to.Room_0.1.1_amd64.AppImage" }
] };

async function mockRelease(page: Page, body: unknown = release, status = 200): Promise<void> {
  await page.route(releaseApi, (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }));
}

test("landing page is responsive and accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/turn receipts into room records/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /try it with sample data/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /download linux appimage/i })).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
});

test("@claim:release-api uses the GitHub API, caches a matching download, and never fetches the redirect manifest", async ({ page }) => {
  const requests: string[] = [];
  const consoleErrors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: /download linux appimage/i })).toHaveAttribute("href", /releases\/download\/v0\.1\.1/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("receipt-to-room:release-metadata:v1"))).not.toBeNull();
  expect(requests).toContain(releaseApi);
  expect(requests.some((url) => url.includes("github.com/B-Divyesh/sf-receipt-to-room/releases/latest/download/latest.json"))).toBe(false);
  expect(consoleErrors).toEqual([]);
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

test("@claim:csv-export manual receipt becomes a searchable, exportable inventory", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByLabel("One purchased item and price per line").fill("HOME STORE\nDesk lamp 39.00\nStorage box 12.50\nTOTAL 51.50");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(page.getByRole("heading", { name: "Check the useful lines" })).toBeVisible();
  await page.locator('select[name="room"]').selectOption("Office");
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByRole("heading", { name: "Your room inventory" })).toBeVisible();
  await page.getByLabel("Search items, rooms, categories, or retailers").fill("lamp");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Desk lamp", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toBe("receipt-to-room-inventory.csv");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
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
