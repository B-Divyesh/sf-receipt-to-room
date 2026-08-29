import { chromium, request as playwrightRequest } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'https://receipt-to-room.sociobot.in';
const outDir = new URL('./', import.meta.url);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { testedAt: new Date().toISOString(), base, routes: {}, demo: {}, keyboard: {}, reducedMotion: {} };

async function auditRoute(name, path, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const route = {
    status: response?.status(),
    responseHeaders: response ? await response.allHeaders() : {},
    title: await page.title(),
    lang: await page.locator('html').getAttribute('lang'),
    h1Count: await page.locator('h1').count(),
    h1: await page.locator('h1').allTextContents(),
    mainCount: await page.locator('main').count(),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    consoleErrors,
    pageErrors,
    requests,
    seriousCriticalAxe: axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    allAxe: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
  };
  if (viewport.width === 390) {
    route.smallTargets = await page.locator('a:visible, button:visible, input:visible, select:visible, textarea:visible').evaluateAll((els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80), width: Math.round(r.width), height: Math.round(r.height) };
    }).filter((x) => x.width < 44 || x.height < 44));
  }
  await page.screenshot({ path: new URL(`${name}.png`, outDir).pathname, fullPage: true });
  report.routes[name] = route;
  await context.close();
}

await auditRoute('desktop-home', '/', { width: 1440, height: 900 });
await auditRoute('mobile-home', '/', { width: 390, height: 844 });
await auditRoute('mobile-privacy', '/privacy/', { width: 390, height: 844 });
await auditRoute('mobile-terms', '/terms/', { width: 390, height: 844 });
await auditRoute('mobile-404', '/definitely-missing', { width: 390, height: 844 });

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const hrefs = await page.locator('a[href]').evaluateAll((links) => [...new Set(links.map((link) => link.href).filter((href) => !href.startsWith('mailto:')))]);
  await context.close();
  const api = await playwrightRequest.newContext();
  report.links = [];
  for (const url of [...hrefs, `${base}/robots.txt`, `${base}/sitemap.xml`, `${base}/install.sh`, `${base}/install.ps1`]) {
    let response = await api.fetch(url, { method: 'HEAD', maxRedirects: 0, failOnStatusCode: false });
    if (response.status() === 405) response = await api.fetch(url, { method: 'GET', maxRedirects: 0, failOnStatusCode: false });
    const location = response.headers().location;
    report.links.push({ url, status: response.status(), locationHost: location ? new URL(location, url).host : null });
  }
  await api.dispose();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const response = await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  report.demo = {
    status: response?.status(),
    banner: await page.locator('#demo-banner').innerText(),
    sampleRows: await page.locator('#sample-rows > li').count(),
    heading: await page.locator('#sample-title').innerText(),
    focusedId: await page.evaluate(() => document.activeElement?.id || ''),
    localStorage: await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))),
    requests,
    externalRequests: requests.filter((url) => new URL(url).origin !== new URL(base).origin),
    cookies: await context.cookies(),
    consoleErrors,
    pageErrors,
  };
  await page.screenshot({ path: new URL('mobile-demo.png', outDir).pathname, fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  report.keyboard.skip = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = el ? getComputedStyle(el) : null;
    return { text: el?.textContent?.trim(), href: el?.getAttribute('href'), outline: cs?.outline, rect: el?.getBoundingClientRect().toJSON() };
  });
  await page.keyboard.press('Enter');
  report.keyboard.skipAfterEnter = await page.evaluate(() => ({ id: document.activeElement?.id, tag: document.activeElement?.tagName }));
  await page.goto(base, { waitUntil: 'networkidle' });
  report.keyboard.tabOrder = [];
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    const text = await page.evaluate(() => document.activeElement?.textContent?.trim() || '');
    report.keyboard.tabOrder.push(text);
    if (text === 'Try it with sample data') break;
  }
  report.keyboard.demoAction = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = el ? getComputedStyle(el) : null;
    return { text: el?.textContent?.trim(), outline: cs?.outline, outlineOffset: cs?.outlineOffset };
  });
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  report.keyboard.demoAfterEnter = await page.evaluate(() => ({ url: location.href, focusedId: document.activeElement?.id, rows: document.querySelectorAll('#sample-rows > li').length }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
  report.reducedMotion = await page.evaluate(() => ({
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    runningAnimations: document.getAnimations().filter((animation) => animation.playState === 'running').length,
  }));
  await context.close();
}

await browser.close();
await writeFile(new URL('live-audit.json', outDir), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
