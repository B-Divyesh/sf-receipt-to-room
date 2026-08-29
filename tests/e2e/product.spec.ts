import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const releaseApi =
  "https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest";
const release = {
  tag_name: "v0.1.14",
  assets: [
    {
      name: "Receipt.to.Room_0.1.14_x64_en-US.msi",
      browser_download_url:
        "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.14/Receipt.to.Room_0.1.14_x64_en-US.msi",
    },
    {
      name: "Receipt.to.Room_0.1.14_x64-setup.exe",
      browser_download_url:
        "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.14/Receipt.to.Room_0.1.14_x64-setup.exe",
    },
    {
      name: "Receipt.to.Room_0.1.14_aarch64.dmg",
      browser_download_url:
        "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.14/Receipt.to.Room_0.1.14_aarch64.dmg",
    },
    {
      name: "Receipt.to.Room_0.1.14_x64.dmg",
      browser_download_url:
        "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.14/Receipt.to.Room_0.1.14_x64.dmg",
    },
    {
      name: "Receipt.to.Room_0.1.14_amd64.AppImage",
      browser_download_url:
        "https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v0.1.14/Receipt.to.Room_0.1.14_amd64.AppImage",
    },
  ],
};

const storedReceipt = (receiptId: string, name: string) => ({
  id: `${receiptId}-item`,
  receiptId,
  receiptName: `${receiptId}.png`,
  name,
  quantity: 1,
  price: 10,
  currency: "USD",
  confidence: 100,
  confidenceLabel: "good",
  included: true,
  merchant: "Home Store",
  room: "Office",
  category: "Decor",
  purchaseDate: "2026-08-28",
  warrantyDate: "",
  createdAt: "2026-08-28T00:00:00.000Z",
});

async function mockRelease(
  page: Page,
  body: unknown = release,
  status = 200,
): Promise<void> {
  await page.route(releaseApi, (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

async function expectTouchTargets(
  page: Page,
  targets: ReadonlyArray<readonly [string, string]>,
): Promise<void> {
  for (const [label, selector] of targets) {
    const locator = page.locator(selector);
    const count = await locator.count();
    expect(count, `${label} should exist`).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const target = locator.nth(index);
      await expect(target, `${label} ${index + 1} should be visible`).toBeVisible();
      const box = await target.boundingBox();
      expect(box, `${label} ${index + 1} should have a bounding box`).not.toBeNull();
      expect(box!.width, `${label} ${index + 1} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${label} ${index + 1} height`).toBeGreaterThanOrEqual(44);
    }
  }
}

test("@claim:price @claim:checkout-operator landing price and hosted payment are responsive and accurate", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await context.route(
    /api\.sociobot\.in\/api\/v1\/products\/receipt-to-room\/checkout/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: '<!doctype html><html><head><meta http-equiv="refresh" content="0;url=https://checkout.dodopayments.com/session/recorded-fixture"></head></html>',
      }),
  );
  await context.route(/^https:\/\/checkout\.dodopayments\.com\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><html><body><main><h1>Hosted checkout</h1><p>This order is handled by Dodo Payments, the merchant of record.</p></main></body></html>",
    }),
  );
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /turn receipts into room records/i,
  );
  await expect(page.locator("main")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Try it with sample data" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /download linux appimage/i }),
  ).toBeVisible();
  await expect(page.getByText("$29", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Pay $29 once to add unlimited receipts and use backup files.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Buy unlimited receipts — $29" }),
  ).toHaveAttribute(
    "href",
    "https://api.sociobot.in/api/v1/products/receipt-to-room/checkout",
  );
  await page
    .getByRole("link", { name: "Buy unlimited receipts — $29" })
    .click();
  await expect(page).toHaveURL(/^https:\/\/checkout\.dodopayments\.com\//);
  await expect(
    page.getByText(/Dodo Payments, the merchant of record/i),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:4173/terms/");
  await expect(
    page.getByText("Dodo Payments is the merchant of record."),
  ).toBeVisible();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);

  await page.goto("http://127.0.0.1:1420/");
  await page.evaluate(
    (records) =>
      localStorage.setItem(
        "receipt-to-room:inventory:v1",
        JSON.stringify(records),
      ),
    [
      storedReceipt("receipt-1", "Lamp"),
      storedReceipt("receipt-2", "Chair"),
      storedReceipt("receipt-3", "Kettle"),
    ],
  );
  await page.reload();
  await expect(page.getByText("3 of 3 free receipts used.")).toBeVisible();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await expect(
    page.getByRole("heading", { name: "Add receipts without a limit." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        new Set(
          JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).map(
            (item: { receiptId: string }) => item.receiptId,
          ),
        ).size,
    ),
  ).toBe(3);

  await page.getByRole("button", { name: /inventory/i }).click();
  await page.getByRole("button", { name: "Remove Lamp" }).click();
  await page
    .getByLabel("Workspace")
    .getByRole("button", { name: "Add receipt" })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await expect(
    page.getByRole("heading", { name: "Add receipts without a limit." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)
          .length,
    ),
  ).toBe(2);

  await page.evaluate(() => {
    localStorage.setItem("sb_license:receipt-to-room", "cached-valid-token");
    localStorage.setItem(
      "sb_license:receipt-to-room:verdict",
      JSON.stringify({ valid: true, checkedAt: Date.now() }),
    );
  });
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page
    .getByLabel("One purchased item and price per line")
    .fill("FOURTH SHOP\nFourth item 4.00\nTOTAL 4.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByText("Fourth item", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        new Set(
          JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!).map(
            (item: { receiptId: string }) => item.receiptId,
          ),
        ).size,
    ),
  ).toBe(3);
  await page.getByRole("button", { name: /paid version active/i }).click();
  const backup = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup file" }).click();
  expect((await backup).suggestedFilename()).toBe(
    "receipt-to-room-backup.json",
  );
});

test("@claim:release-api uses the GitHub API, caches a matching download, and never fetches the redirect manifest", async ({
  page,
}) => {
  const requests: string[] = [];
  const consoleErrors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(
    page.getByRole("link", { name: /download linux appimage/i }),
  ).toHaveAttribute("href", /releases\/download\/v0\.1\.14/);
  await expect(page.getByText(/unsigned release/)).toBeVisible();
  await page.getByRole("button", { name: "See all downloads" }).click();
  await expect(page.locator("#download-list")).toContainText(
    "macOS (Apple silicon)",
  );
  await expect(page.locator("#download-list")).toContainText("macOS (Intel)");
  await expect(page.locator("#download-list")).toContainText("Windows");
  await expect(page.locator("#download-list")).toContainText("Linux AppImage");
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("receipt-to-room:release-metadata:v2"),
      ),
    )
    .not.toBeNull();
  expect(requests).toContain(releaseApi);
  expect(
    requests.some((url) =>
      url.includes(
        "github.com/B-Divyesh/sf-receipt-to-room/releases/latest/download/latest.json",
      ),
    ),
  ).toBe(false);
  expect(consoleErrors).toEqual([]);
});

test("normal landing hides demo state while the demo URL shows it", async ({
  page,
}) => {
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeHidden();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toHaveCSS("outline-style", "solid");
  await page.goto("http://127.0.0.1:4173/?demo=1");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeVisible();
});

test("landing history restores URL, metadata, focus, and demo state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\?demo=1#sample$/);
  await expect(page).toHaveTitle("Demo — Receipt to Room");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Demo.");
  const enteredBanner = await page.getByLabel("Demo mode").boundingBox();
  const enteredHeading = await page
    .getByRole("heading", { name: "Your room inventory" })
    .boundingBox();
  expect(enteredHeading!.y).toBeGreaterThanOrEqual(
    enteredBanner!.y + enteredBanner!.height,
  );
  await page.goBack();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page).toHaveTitle(
    "Receipt to Room — turn receipts into room records",
  );
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Home.");
  await page.goForward();
  await expect(page).toHaveURL(/\?demo=1#sample$/);
  await expect(page).toHaveTitle("Demo — Receipt to Room");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Demo.");
  const restoredBanner = await page.getByLabel("Demo mode").boundingBox();
  const restoredHeading = await page
    .getByRole("heading", { name: "Your room inventory" })
    .boundingBox();
  expect(restoredHeading!.y).toBeGreaterThanOrEqual(
    restoredBanner!.y + restoredBanner!.height,
  );
});

test("Home returns focus and announces every same-origin route change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);

  for (const path of ["/privacy/", "/terms/", "/404.html"] as const) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    const routeHeading = page.locator("main h1");
    await expect(routeHeading).toBeFocused();
    await expect(routeHeading).toHaveCSS("outline-style", "solid");
    await page.getByRole("link", { name: /return home/i }).click();
    await expect(page).toHaveURL("http://127.0.0.1:4173/");
    const homeHeading = page.getByRole("heading", { level: 1 });
    await expect(homeHeading).toBeFocused();
    await expect(homeHeading).toHaveCSS("outline-style", "solid");
    await expect(page.locator("#route-announcement")).toHaveText("Home.");
  }

  await page.goto("http://127.0.0.1:4173/?demo=1#sample");
  await page.getByRole("link", { name: "Leave demo and use my records" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Home.");
});

test("cross-page Back and Forward focus and announce the restored route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("link", { name: "Read the privacy note" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:4173/privacy/");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Privacy.");
  await page.goBack();
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
    "outline-style",
    "solid",
  );
  await expect(page.locator("#route-announcement")).toHaveText("Home.");
  await page.goForward();
  await expect(page).toHaveURL("http://127.0.0.1:4173/privacy/");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Privacy.");
});

test("@claim:offline-work manual intake and export remain available offline", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await context.setOffline(true);
  await expect(
    page.getByRole("status", { name: "" }).filter({ hasText: "Offline" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page
    .getByLabel("One purchased item and price per line")
    .fill("LOCAL SHOP\nToolbox 24.00\nTOTAL 24.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(page.getByText("Toolbox", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download spreadsheet" }).click();
  expect((await download).suggestedFilename()).toBe(
    "receipt-to-room-inventory.csv",
  );
});

test("unavailable releases show a calm publishing state without console errors", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await mockRelease(page, { message: "Not Found" }, 404);
  await page.goto("http://127.0.0.1:4173/");
  await expect(
    page.getByText(
      "Downloads are being published. Check the release page again soon.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View release page" }),
  ).toHaveAttribute("href", /releases\/latest$/);
  expect(pageErrors).toEqual([]);
});

test("@claim:sample-demo is isolated, searchable, resettable, and keyboard reachable", async ({
  page,
  browser,
}) => {
  const realRecord = storedReceipt("real-receipt", "Real lamp");
  await page.addInitScript(
    (record) =>
      localStorage.setItem(
        "receipt-to-room:inventory:v1",
        JSON.stringify([record]),
      ),
    realRecord,
  );
  const thirdPartyRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.hostname !== "127.0.0.1")
      thirdPartyRequests.push(request.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/?demo=1");
  await expect(page).toHaveTitle("Demo — Receipt to Room");
  await expect(page.getByLabel("Demo mode")).toContainText(
    "Demo — sample data, nothing is saved",
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem("receipt-to-room:release-metadata:v2"),
    ),
  ).toBeNull();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter(
        (key) => key !== "receipt-to-room:inventory:v1",
      ),
    ),
  ).toEqual(["demo:receipt-to-room:sample:v1"]);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage)
        .filter((key) => key !== "receipt-to-room:inventory:v1")
        .every((key) => key.startsWith("demo:")),
    ),
  ).toBe(true);
  const sampleHeading = page.getByRole("heading", {
    name: "Your room inventory",
  });
  await expect(sampleHeading).toBeVisible();
  await expect(sampleHeading).toBeFocused();
  const banner = await page.getByLabel("Demo mode").boundingBox();
  const heading = await sampleHeading.boundingBox();
  expect(heading!.y).toBeGreaterThanOrEqual(banner!.y + banner!.height);
  expect(
    (await page.getByText("Cedar kettle", { exact: true }).boundingBox())!.y,
  ).toBeLessThan(844);
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await page.getByLabel("Search demo records").fill("lamp");
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Reset demo" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0]
          .name,
    ),
  ).toBe("Real lamp");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("demo:receipt-to-room:sample:v1"),
    ),
  ).toBeNull();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);

  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Cedar kettle" }).click();
  await page
    .locator('#edit-item-form select[name="room"]')
    .selectOption("Living room");
  await page.getByRole("button", { name: "Save changes" }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0]
          .name,
    ),
  ).toBe("Real lamp");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("demo:receipt-to-room:inventory:v1")!,
        )[0].room,
    ),
  ).toBe("Living room");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText("Cedar kettle", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("demo:receipt-to-room:inventory:v1")!,
        )[0].room,
    ),
  ).toBe("Kitchen");
  await page
    .getByRole("button", { name: "Leave demo and use my records" })
    .click();
  await expect(page.getByLabel("Demo mode")).toBeHidden();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("demo:receipt-to-room:inventory:v1"),
    ),
  ).toBeNull();
  const cleanContext = await browser.newContext();
  const cleanPage = await cleanContext.newPage();
  await cleanPage.goto("http://127.0.0.1:1420/#intake");
  await cleanPage.getByRole("button", { name: "Load demo records" }).click();
  await expect(cleanPage.getByLabel("Demo mode")).toBeVisible();
  await expect(
    cleanPage.getByText("Cedar kettle", { exact: true }),
  ).toBeVisible();
  await cleanContext.close();
  expect(thirdPartyRequests).toEqual([]);
});

test("@claim:csv-export @claim:receipt-workflow @claim:local-storage @claim:editable-records @claim:free-exports a mixed-room receipt stays accurate and editable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      "receipt-to-room:inventory:v1",
      "real-records-stay-separate",
    );
  });
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      !request.url().startsWith("http://127.0.0.1:1420")
    )
      externalRequests.push(request.url());
  });
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page
    .getByLabel("One purchased item and price per line")
    .fill(
      "HOME STORE\nKitchen kettle 39\nOffice lamp 1,299.99\nTOTAL 1338.99\nPurchased 08/19/2026",
    );
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(
    page.getByRole("heading", { name: "Check the useful lines" }),
  ).toBeVisible();
  const reviewAxe = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    reviewAxe.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.locator('select[name="room-0"]').selectOption("Kitchen");
  await page.locator('select[name="category-0"]').selectOption("Appliance");
  await page.locator('input[name="warrantyDate-0"]').fill("2028-08-19");
  await page.locator('select[name="room-1"]').selectOption("Office");
  await page.locator('select[name="category-1"]').selectOption("Electronics");
  await page.locator('input[name="warrantyDate-1"]').fill("2029-08-19");
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeVisible();
  await page
    .getByLabel("Search items, rooms, categories, or retailers")
    .fill("lamp");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Office lamp", { exact: true })).toBeVisible();
  await expect(page.getByText("Electronics", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Warranty to 2029-08-19", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Office lamp" }).click();
  const editForm = page.locator("#edit-item-form");
  await editForm.locator('select[name="room"]').selectOption("Living room");
  await editForm.locator('select[name="category"]').selectOption("Decor");
  await editForm.locator('input[name="warrantyDate"]').fill("2030-08-19");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Living room", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Warranty to 2030-08-19", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download spreadsheet" }).click();
  const csv = await download;
  expect(csv.suggestedFilename()).toBe("receipt-to-room-inventory.csv");
  const csvText = await (
    await import("node:fs/promises")
  ).readFile((await csv.path()) as string, "utf8");
  expect(csvText).toContain("Office lamp");
  expect(csvText).toContain("Living room");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("demo:receipt-to-room:inventory:v1"),
    ),
  ).toContain("Office lamp");
  expect(
    await page.evaluate(() =>
      localStorage.getItem("receipt-to-room:inventory:v1"),
    ),
  ).toBe("real-records-stay-separate");
  expect(externalRequests).toEqual([]);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
});

test("@claim:bulk-queue queues two shipped receipt images", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  const fixture = await (
    await import("node:fs/promises")
  ).readFile("tests/fixtures/sample-receipt.png");
  await page.locator("#receipt-files").setInputFiles([
    { name: "sample-receipt-a.png", mimeType: "image/png", buffer: fixture },
    { name: "sample-receipt-b.png", mimeType: "image/png", buffer: fixture },
  ]);
  await expect(
    page.getByRole("heading", { name: "Check the useful lines" }),
  ).toBeVisible({ timeout: 75_000 });
  const addToInventory = page.getByRole("button", {
    name: "Add to room inventory",
  });
  await addToInventory.click();
  await expect(addToInventory).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Check the useful lines" }),
  ).toBeVisible({ timeout: 75_000 });
  await addToInventory.click();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        new Set(
          JSON.parse(
            localStorage.getItem("demo:receipt-to-room:inventory:v1")!,
          ).map((item: { receiptId: string }) => item.receiptId),
        ).size,
    ),
  ).toBe(4);
});

test("@claim:print-undo creates printable output and restores a removed item", async ({
  page,
}) => {
  await page.addInitScript(
    (record) =>
      localStorage.setItem(
        "demo:receipt-to-room:inventory:v1",
        JSON.stringify([record]),
      ),
    storedReceipt("receipt-print", "Reading lamp"),
  );
  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  await page.getByRole("button", { name: "Print inventory" }).click();
  const printFrame = page.locator('iframe[title="Printable room inventory"]');
  await expect(printFrame).toHaveCount(1);
  expect(
    await printFrame.evaluate(
      (frame: HTMLIFrameElement) => frame.contentDocument?.body.textContent,
    ),
  ).toContain("Reading lamp");
  await page.getByRole("button", { name: "Remove Reading lamp" }).click();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Reading lamp", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("demo:receipt-to-room:inventory:v1"),
    ),
  ).toContain("Reading lamp");
});

test("blank manual receipt keeps its named recovery field visible and focused", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page.getByRole("button", { name: "Review these lines" }).click();

  const textarea = page.getByLabel("One purchased item and price per line");
  await expect(page.getByRole("alert")).toHaveText(
    "Paste at least one item and price, then try again.",
  );
  await expect(textarea).toBeVisible();
  await expect(textarea).toBeFocused();
  await expect(textarea).toHaveAttribute("aria-invalid", "true");
  await expect(textarea).toHaveAttribute("aria-describedby", "manual-error");

  await textarea.fill("Desk lamp 39.00");
  await page.getByRole("button", { name: "Review these lines" }).click();
  await expect(
    page.getByRole("heading", { name: "Check the useful lines" }),
  ).toBeVisible();
});

test("@claim:image-input rejects unsupported and oversized receipt files with recovery guidance", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page.locator("#receipt-files").setInputFiles({
    name: "receipt.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "Use a JPG, PNG, or WebP no larger than 10 MB",
  );
  await page.locator("#receipt-files").setInputFiles({
    name: "large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("alert")).toContainText("large.png was skipped");
  await expect(
    page.getByRole("button", { name: "Paste receipt text" }),
  ).toBeVisible();
});

test("deep links survive reload and mobile screen changes restore heading focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    (record) =>
      localStorage.setItem(
        "receipt-to-room:inventory:v1",
        JSON.stringify([record]),
      ),
    storedReceipt("route", "Route lamp"),
  );
  await page.goto("http://127.0.0.1:1420/#inventory");
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your room inventory" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Add receipt" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Turn a receipt into room records." }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Paste receipt text" }).click();
  await page
    .getByLabel("One purchased item and price per line")
    .fill("SHOP\nDesk lamp 39");
  await page.getByRole("button", { name: "Review these lines" }).click();
  const reviewHeading = page.getByRole("heading", {
    name: "Check the useful lines",
  });
  await expect(reviewHeading).toBeFocused();
  expect((await reviewHeading.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
  expect((await reviewHeading.boundingBox())!.y).toBeLessThan(844);
  await page.getByRole("button", { name: "Add to room inventory" }).click();
  const inventoryHeading = page.getByRole("heading", {
    name: "Your room inventory",
  });
  await expect(inventoryHeading).toBeFocused();
  expect((await inventoryHeading.boundingBox())!.y).toBeGreaterThanOrEqual(-1);
  expect((await inventoryHeading.boundingBox())!.y).toBeLessThan(844);
});

test("@claim:backup-restore rejects malformed records without replacing known-good inventory", async ({
  page,
}) => {
  const existing = storedReceipt("safe", "Safe lamp");
  const restored = storedReceipt("restored", "Restored chair");
  await page.addInitScript((record) => {
    localStorage.setItem(
      "receipt-to-room:inventory:v1",
      JSON.stringify([record]),
    );
    localStorage.setItem("sb_license:receipt-to-room", "cached-valid-token");
    localStorage.setItem(
      "sb_license:receipt-to-room:verdict",
      JSON.stringify({ valid: true, checkedAt: Date.now() }),
    );
  }, existing);
  const pageErrors: string[] = [];
  page.on("pageerror", (event) => pageErrors.push(event.message));
  await page.goto("http://127.0.0.1:1420/#license");
  const backupDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup file" }).click();
  expect((await backupDownload).suggestedFilename()).toBe(
    "receipt-to-room-backup.json",
  );
  await page.locator("#restore-json").setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ version: 1, items: [restored] })),
  });
  await expect(page.getByText("Restored chair", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /paid version active/i }).click();
  await page.locator("#restore-json").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"items":[{}]}'),
  });
  await expect(page.getByRole("status")).toContainText(
    "current records were kept",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("receipt-to-room:inventory:v1")!)[0]
          .name,
    ),
  ).toBe("Restored chair");
  await page.getByRole("button", { name: /inventory/i }).click();
  await expect(page.getByText("Restored chair", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("@claim:redacted-exports @claim:privacy-boundaries exports redact payment details without tracking", async ({
  page,
}) => {
  const privateRecord = {
    ...storedReceipt("private", "Desk lamp"),
    merchant: "Home Store VISA 4111 1111 1111 1111",
  };
  await page.addInitScript(
    (record) =>
      localStorage.setItem(
        "demo:receipt-to-room:inventory:v1",
        JSON.stringify([record]),
      ),
    privateRecord,
  );
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      !request.url().startsWith("http://127.0.0.1:1420")
    )
      externalRequests.push(request.url());
  });
  await page.goto("http://127.0.0.1:1420/?demo=1#inventory");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download spreadsheet" }).click();
  const csv = await (
    await import("node:fs/promises")
  ).readFile((await (await download).path()) as string, "utf8");
  expect(csv).toContain("[payment details removed]");
  expect(csv).not.toContain("4111 1111 1111 1111");
  await page.getByRole("button", { name: "Print inventory" }).click();
  const printText = await page
    .locator('iframe[title="Printable room inventory"]')
    .evaluate(
      (frame: HTMLIFrameElement) =>
        frame.contentDocument?.body.textContent ?? "",
    );
  expect(printText).toContain("[payment details removed]");
  expect(printText).not.toContain("4111 1111 1111 1111");
  expect(externalRequests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  await page.goto("http://127.0.0.1:4173/privacy/");
  expect(
    (await page.context().cookies()).filter((cookie) =>
      cookie.name.toLowerCase().includes("analytics"),
    ),
  ).toEqual([]);
  expect(
    await page.locator('script[src*="analytics"],script[src^="http"]').count(),
  ).toBe(0);
});

test("390px touch targets cover every control reported by verification 9", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockRelease(page);
  await page.goto("http://127.0.0.1:4173/");
  await expectTouchTargets(page, [
    ["landing wordmark", ".site-header .brand"],
    ["landing navigation", ".site-header nav a"],
    ["landing privacy note", ".privacy-section a"],
    ["landing footer links", "footer > div:nth-child(2) a"],
  ]);

  await page.goto("http://127.0.0.1:4173/?demo=1#sample");
  await expect(page.getByLabel("Demo mode")).toBeVisible();
  await expectTouchTargets(page, [
    ["demo banner actions", ".demo-banner button, .demo-banner a"],
    ["demo footer links", "footer > div:nth-child(2) a"],
  ]);

  for (const route of ["privacy", "terms"]) {
    await page.goto(`http://127.0.0.1:4173/${route}/`);
    await expectTouchTargets(page, [
      [`${route} email and return links`, "main.legal a"],
      [`${route} footer links`, "footer > div:nth-child(2) a"],
    ]);
  }

  await page.goto("http://127.0.0.1:1420/");
  await expectTouchTargets(page, [["desktop app wordmark", ".wordmark"]]);
});

test("verification 11 regression keeps every desktop Demo link at least 44 by 44 CSS pixels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockRelease(page);
  for (const route of ["/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(`http://127.0.0.1:4173${route}`);
    await expectTouchTargets(page, [
      [`desktop Demo link on ${route}`, ".site-header nav a:first-child"],
    ]);
  }
});

test("@claim:license-cache checkout return stores, strips, verifies, and caches a license", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:1420/");
  await page.evaluate(() => localStorage.clear());
  let verifiedToken = "";
  let verificationRequests = 0;
  await page.route(
    "https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*",
    async (route) => {
      verificationRequests += 1;
      const requestUrl = new URL(route.request().url());
      expect(Array.from(requestUrl.searchParams.keys())).toEqual(["license"]);
      verifiedToken = requestUrl.searchParams.get("license") ?? "";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ valid: true, reason: "ok", expires_at: null }),
      });
    },
  );

  await page.goto("http://127.0.0.1:1420/?license=licensed-test-token#license");
  await expect.poll(() => verifiedToken).toBe("licensed-test-token");
  await expect
    .poll(() => new URL(page.url()).searchParams.has("license"))
    .toBe(false);
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("sb_license:receipt-to-room")),
    )
    .toBe("licensed-test-token");
  await page.getByRole("button", { name: /paid version active/i }).click();
  await expect(
    page.getByRole("heading", { name: "Your paid version is active." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download backup file" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your paid version is active." }),
  ).toBeVisible();
  expect(verificationRequests).toBe(1);
  await page.evaluate(() =>
    localStorage.setItem(
      "sb_license:receipt-to-room:verdict",
      JSON.stringify({ valid: true, checkedAt: Date.now() - 86_399_000 }),
    ),
  );
  await page.reload();
  expect(verificationRequests).toBe(1);
  await page.evaluate(() =>
    localStorage.setItem(
      "sb_license:receipt-to-room:verdict",
      JSON.stringify({ valid: true, checkedAt: Date.now() - 86_401_000 }),
    ),
  );
  await page.reload();
  await expect.poll(() => verificationRequests).toBe(2);
});

test("@claim:refund-revocation a revoked purchase turns off paid features", async ({
  page,
}) => {
  await page.addInitScript(
    (record) => {
      localStorage.setItem(
        "sb_license:receipt-to-room",
        "refunded-fixture-token",
      );
      localStorage.setItem(
        "sb_license:receipt-to-room:verdict",
        JSON.stringify({ valid: true, checkedAt: 0 }),
      );
      localStorage.setItem(
        "receipt-to-room:inventory:v1",
        JSON.stringify([record]),
      );
    },
    storedReceipt("kept-after-refund", "Kept lamp"),
  );
  await page.route(
    "https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*",
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          valid: false,
          reason: "revoked",
          expires_at: null,
        }),
      }),
  );
  await page.goto("http://127.0.0.1:1420/#license");
  await expect(page.getByRole("status")).toContainText(
    "License no longer active",
  );
  await expect(
    page.getByRole("heading", { name: "Add receipts without a limit." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download backup file" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /inventory/i }).click();
  await expect(page.getByText("Kept lamp", { exact: true })).toBeVisible();
  const exportDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download spreadsheet" }).click();
  expect((await exportDownload).suggestedFilename()).toBe(
    "receipt-to-room-inventory.csv",
  );
});

test("@claim:license-rate-policy license throttling always presents a non-zero retry interval", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  let attempts = 0;
  await page.route(
    "https://api.sociobot.in/api/v1/products/receipt-to-room/verify?*",
    (route) => {
      attempts += 1;
      return attempts <= 30
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ valid: false, reason: "invalid" }),
          })
        : route.fulfill({
            status: 429,
            headers: { "Retry-After": "0" },
            body: "rate limited",
          });
    },
  );
  await page.goto("http://127.0.0.1:1420/#license");
  const allowed = await page.evaluate(async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 30; index += 1) {
      statuses.push(
        (
          await fetch(
            `https://api.sociobot.in/api/v1/products/receipt-to-room/verify?license=fixture-${index}`,
          )
        ).status,
      );
    }
    return statuses;
  });
  expect(allowed).toEqual(Array(30).fill(200));
  await page.getByRole("button", { name: "Paid version", exact: true }).click();
  await page.getByLabel("Paid-version token").fill("rate-limited-token");
  await page.getByRole("button", { name: "Verify paid version" }).click();
  await expect(page.locator("#license-note")).toContainText(
    "Try again in 1 second.",
  );
  expect(attempts).toBe(31);
});

test("@claim:local-ocr bundled OCR reads a receipt without external runtime assets", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => localStorage.clear());
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      !request.url().startsWith("http://127.0.0.1:1420")
    )
      externalRequests.push(request.url());
  });
  await page.goto("http://127.0.0.1:1420/?demo=1#intake");
  await page
    .locator("#receipt-files")
    .setInputFiles("tests/fixtures/sample-receipt.png");
  await expect(
    page.getByRole("heading", { name: "Check the useful lines" }),
  ).toBeVisible({ timeout: 75_000 });
  await expect(page.locator('[name^="name-"]').first()).not.toHaveValue("");
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).every(
        (value) => !String(value).startsWith("data:image/"),
      ),
    ),
  ).toBe(true);
  expect(externalRequests).toEqual([]);
});

test("site routes expose complete metadata, focused headings, shared links, and one build version", async ({
  page,
}) => {
  await mockRelease(page);
  const routes = [
    ["/", "Receipt to Room — turn receipts into room records"],
    ["/privacy/", "Privacy — Receipt to Room"],
    ["/terms/", "Terms — Receipt to Room"],
    ["/404.html", "Page not found — Receipt to Room"],
  ] as const;
  for (const [path, title] of routes) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https:\/\/receipt-to-room\.sociobot\.in\//,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /social-preview\.webp$/,
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      /social-preview\.webp$/,
    );
    await expect(page.locator("main h1")).toHaveCount(1);
    if (path !== "/") await expect(page.locator("main h1")).toBeFocused();
    await expect(page.locator("footer")).toContainText(
      "Built by Param Factory · v0.1.14",
    );
    await expect(
      page.locator("footer").getByRole("link", { name: "Receipt to Room home" }),
    ).toHaveCount(1);
    for (const label of ["Demo", "Privacy", "Terms", "Source on GitHub (external)"]) {
      await expect(
        page.locator("footer").getByRole("link", { name: label, exact: true }),
      ).toHaveCount(1);
    }
  }
  await page.goto("http://127.0.0.1:4173/404.html");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found.",
  );
});
