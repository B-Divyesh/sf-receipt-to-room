#!/usr/bin/env bash
set -euo pipefail

VERIFY_URL="${1:-https://receipt-to-room.sociobot.in}"

VERIFY_URL="$VERIFY_URL" node --input-type=module <<'EOF'
import { chromium } from "@playwright/test";

const url = process.env.VERIFY_URL;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const consoleErrors = [];
const pageErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => pageErrors.push(error.message));

const response = await page.goto(url, { waitUntil: "networkidle" });
if (!response?.ok()) throw new Error(`URL returned ${response?.status() ?? "no response"}: ${url}`);

const result = await page.evaluate(() => ({
  title: document.title.trim(),
  lang: document.documentElement.lang,
  mains: document.querySelectorAll("main").length,
  h1s: document.querySelectorAll("h1").length,
  imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
}));

if (!result.title) throw new Error("The page has no title");
if (result.lang !== "en") throw new Error(`Expected html lang=en, received ${result.lang || "(empty)"}`);
if (result.mains !== 1) throw new Error(`Expected one main landmark, received ${result.mains}`);
if (result.h1s !== 1) throw new Error(`Expected one h1, received ${result.h1s}`);
if (result.imagesWithoutAlt) throw new Error(`${result.imagesWithoutAlt} image(s) have no alt attribute`);
if (result.horizontalOverflow) throw new Error("The 390px page has horizontal overflow");
if (consoleErrors.length || pageErrors.length) throw new Error(`Browser errors: ${[...consoleErrors, ...pageErrors].join(" | ")}`);

console.log(JSON.stringify({ url, ...result, consoleErrors: 0, pageErrors: 0 }, null, 2));
await browser.close();
EOF
