import { defineConfig } from "@playwright/test";
export default defineConfig({testDir:"tests/e2e",timeout:30_000,use:{headless:true,viewport:{width:1280,height:800}},webServer:[{command:"npm run dev:site -- --host 127.0.0.1",port:4173,reuseExistingServer:true},{command:"npm run dev -- --host 127.0.0.1",port:1420,reuseExistingServer:true}]});
