#!/usr/bin/env node
/**
 * Release gate for the public artifact. Run after a tagged GitHub Actions
 * release and static deployment. It deliberately verifies the two issues a
 * local build cannot prove: release identity and hosting behaviour.
 *
 * Usage: node scripts/verify-live-release.mjs <expected-git-sha> [site-url]
 */
import { createHash } from "node:crypto";

const [expectedCommit, siteUrl = "https://receipt-to-room.sociobot.in"] = process.argv.slice(2);
if (!expectedCommit) throw new Error("Usage: node scripts/verify-live-release.mjs <expected-git-sha> [site-url]");

const repository = "B-Divyesh/sf-receipt-to-room";
const api = `https://api.github.com/repos/${repository}/releases/latest`;
const productApi = "https://api.sociobot.in/api/v1/products/receipt-to-room";
const request = async (url, options) => {
  const response = await fetch(url, options);
  return response;
};
const requireOk = (condition, message) => { if (!condition) throw new Error(message); };

const releaseResponse = await request(api, { headers: { Accept: "application/vnd.github+json" } });
requireOk(releaseResponse.ok, `GitHub release API returned ${releaseResponse.status}`);
const release = await releaseResponse.json();
requireOk(release.target_commitish === expectedCommit, `release targets ${release.target_commitish}, expected ${expectedCommit}`);

const assets = new Map(release.assets.map((asset) => [asset.name, asset]));
for (const suffix of [".AppImage", ".msi", ".exe", ".dmg"]) {
  requireOk([...assets.keys()].some((name) => name.endsWith(suffix)), `release is missing a ${suffix} asset`);
}
const manifest = assets.get("latest.json");
const sums = assets.get("SHA256SUMS");
requireOk(manifest && sums, "release is missing latest.json or SHA256SUMS");
const platformManifest = await (await request(manifest.browser_download_url)).json();
const sumText = await (await request(sums.browser_download_url)).text();
for (const { url, sha256 } of Object.values(platformManifest.platforms)) {
  const asset = [...assets.values()].find((entry) => entry.browser_download_url === url);
  requireOk(asset, `manifest points to absent asset ${url}`);
  const binary = Buffer.from(await (await request(url)).arrayBuffer());
  requireOk(createHash("sha256").update(binary).digest("hex") === sha256, `checksum mismatch for ${asset.name}`);
  requireOk(sumText.includes(`${sha256}  ${asset.name}`), `SHA256SUMS omits ${asset.name}`);
}

const checkout = await request(`${productApi}/checkout`, { redirect: "manual" });
requireOk(checkout.status >= 300 && checkout.status < 400, `checkout returned ${checkout.status}, expected hosted-checkout redirect`);
const verifyAttempts = await Promise.all(Array.from({ length: 31 }, (_, index) => request(`${productApi}/verify?license=release-gate-invalid-${index}`)));
requireOk(verifyAttempts.some((response) => response.status === 429 && Boolean(response.headers.get("retry-after"))), "license verification did not enforce 429 with Retry-After");

const landing = await request(`${siteUrl}/`);
requireOk(landing.ok, `landing returned ${landing.status}`);
const html = await landing.text();
const assetPath = html.match(/\/assets\/[^"']+\.js/)?.[0];
requireOk(assetPath, "landing has no hashed JavaScript asset");
const builtAsset = await request(new URL(assetPath, siteUrl));
requireOk(/max-age=31536000/.test(builtAsset.headers.get("cache-control") ?? "") && /immutable/.test(builtAsset.headers.get("cache-control") ?? ""), "hashed asset is not immutably cached");
const notFound = await request(new URL("/not-a-real-route", siteUrl));
requireOk(notFound.status === 404, `unknown route returned ${notFound.status}, expected 404`);

console.log(JSON.stringify({ release: release.tag_name, commit: release.target_commitish, checkout: checkout.status, rateLimited: true, cache: builtAsset.headers.get("cache-control"), notFound: notFound.status }, null, 2));
