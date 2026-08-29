import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = "https://receipt-to-room.sociobot.in";
const browser = await chromium.launch({ headless: true });
const report = { routes: [], keyboard: {}, demo: {}, reducedMotion: {}, requests: [], cookies: [] };

async function inspectRoute(path, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => requests.push(request.url()));
  const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  const dom = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: [...document.querySelectorAll("h1")].map((node) => node.textContent?.trim()),
    mains: document.querySelectorAll("main").length,
    missingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    smallTargets: [...document.querySelectorAll("a,button,input,select,textarea")]
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { label: node.getAttribute("aria-label") || node.textContent?.trim() || node.getAttribute("name"), width: Math.round(rect.width), height: Math.round(rect.height) };
      })
  }));
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const severe = axe.violations.filter((item) => item.impact === "serious" || item.impact === "critical").map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length }));
  const headers = response ? await response.allHeaders() : {};
  report.routes.push({ path, viewport, status: response?.status(), ...dom, severeAxe: severe, consoleErrors, pageErrors, headers });
  report.requests.push({ path, urls: requests });
  report.cookies.push(...await context.cookies());
  await context.close();
}

await inspectRoute("/", { width: 1440, height: 900 });
await inspectRoute("/?demo=1#sample", { width: 390, height: 844 });
await inspectRoute("/privacy/", { width: 390, height: 844 });
await inspectRoute("/terms/", { width: 1440, height: 900 });

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  report.keyboard.firstFocus = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    href: document.activeElement?.getAttribute("href"),
    outline: getComputedStyle(document.activeElement).outline,
    rect: (() => { const r = document.activeElement.getBoundingClientRect(); return { width: r.width, height: r.height }; })()
  }));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  while ((await page.evaluate(() => document.activeElement?.textContent?.trim())) !== "Try it with sample data") await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.waitForURL(/demo=1/);
  report.keyboard.afterDemo = await page.evaluate(() => ({
    url: location.href,
    focusedText: document.activeElement?.textContent?.trim(),
    focusedTag: document.activeElement?.tagName,
    scrollY,
    sampleTop: document.querySelector("#sample")?.getBoundingClientRect().top
  }));
  report.demo = await page.evaluate(() => ({
    banner: document.querySelector(".demo-banner")?.textContent?.replace(/\s+/g, " ").trim(),
    rows: document.querySelectorAll("#sample-rows li").length,
    visibleSample: (() => { const r = document.querySelector("#sample-rows li")?.getBoundingClientRect(); return Boolean(r && r.top >= 0 && r.top < innerHeight); })(),
    storage: Object.keys(localStorage).sort()
  }));
  await page.screenshot({ path: ".factory/verification-evidence-9/live-demo-mobile.png", fullPage: false });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1#sample`, { waitUntil: "networkidle" });
  report.reducedMotion = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("*")];
    const animated = nodes.filter((node) => {
      const style = getComputedStyle(node);
      return style.animationName !== "none" && style.animationDuration !== "0s" || !["0s", "1e-05s"].includes(style.transitionDuration);
    });
    return { matches: matchMedia("(prefers-reduced-motion: reduce)").matches, animatedCount: animated.length };
  });
  await context.close();
}

report.cookies = report.cookies.map(({ name, domain, sameSite, secure, httpOnly }) => ({ name, domain, sameSite, secure, httpOnly }));
console.log(JSON.stringify(report, null, 2));
await browser.close();
