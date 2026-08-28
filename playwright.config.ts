import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { headless: true, viewport: { width: 1280, height: 800 } },
  webServer: [
    {
      command: "npm run dev:site -- --host 127.0.0.1 --strictPort",
      url: "http://127.0.0.1:4173/",
      reuseExistingServer: false,
      timeout: 30_000
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --strictPort",
      url: "http://127.0.0.1:1420/",
      reuseExistingServer: false,
      timeout: 30_000
    }
  ]
});
