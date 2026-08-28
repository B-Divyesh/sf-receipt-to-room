import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [directory, rawVersion, sourceCommit] = process.argv.slice(2);
if (!directory || !rawVersion || !/^[0-9a-f]{40}$/i.test(sourceCommit ?? "")) {
  throw new Error("Usage: node make-release-manifest.mjs <assets-dir> <version> <40-character-source-commit>");
}
const version = rawVersion.replace(/^v/, "");
const files = (await readdir(directory)).filter((name) => !["latest.json", "SHA256SUMS"].includes(name));
const sha = new Map();
for (const file of files) sha.set(file, createHash("sha256").update(await readFile(join(directory, file))).digest("hex"));

function find(...patterns) {
  const match = files.find((name) => patterns.every((pattern) => pattern.test(name)));
  if (!match) throw new Error(`Missing release asset matching ${patterns}`);
  return match;
}
const selected = {
  "macos-arm64": ["macOS (Apple silicon)", find(/\.dmg$/i, /(aarch64|arm64)/i)],
  "macos-x86_64": ["macOS (Intel)", find(/\.dmg$/i, /(x64|x86_64)/i)],
  "windows-x86_64": ["Windows", find(/\.msi$/i, /(x64|x86_64)/i)],
  "linux-x86_64": ["Linux AppImage", find(/\.AppImage$/i, /(amd64|x86_64)/i)]
};
const base = `https://github.com/B-Divyesh/sf-receipt-to-room/releases/download/v${version}/`;
const platforms = Object.fromEntries(Object.entries(selected).map(([key, [label, file]]) => [key, { label, url: `${base}${encodeURIComponent(file)}`, sha256: sha.get(file) }]));
await writeFile(join(directory, "latest.json"), `${JSON.stringify({ version, sourceCommit, platforms })}\n`);
await writeFile(join(directory, "SHA256SUMS"), `${files.sort().map((file) => `${sha.get(file)}  ${basename(file)}`).join("\n")}\n`);
