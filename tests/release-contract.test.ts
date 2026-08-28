import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("release and static-host contract", () => {
  test("ships one new native version through the package, Rust bundle, and tag workflow", () => {
    const pkg = JSON.parse(read("package.json")) as { version: string };
    const cargo = read("src-tauri/Cargo.toml");
    const tauri = JSON.parse(read("src-tauri/tauri.conf.json")) as { version: string };
    const workflow = read(".github/workflows/release.yml");

    expect(pkg.version).toBe("0.1.1");
    expect(cargo).toContain(`version = "${pkg.version}"`);
    expect(tauri.version).toBe(pkg.version);
    expect(workflow).toContain('tags: ["v*"]');
    expect(workflow).toContain("tagName: v__VERSION__");
    expect(workflow).toContain("x86_64-unknown-linux-gnu");
    expect(workflow).toContain("x86_64-pc-windows-msvc");
    expect(workflow).toContain("x86_64-apple-darwin");
    expect(workflow).toContain("aarch64-apple-darwin");
    expect(workflow).toContain("SHA256SUMS");
    expect(workflow).toContain("latest.json");
  });

  test("does not rewrite unknown requests to the landing page and caches hashed assets immutably", () => {
    const config = JSON.parse(read("site/public/staticwebapp.config.json")) as {
      navigationFallback?: unknown;
      responseOverrides?: Record<string, { rewrite?: string }>;
      routes?: Array<{ route?: string; headers?: Record<string, string> }>;
    };
    const assetRoute = config.routes?.find((route) => route.route === "/assets/*");

    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.["404"]?.rewrite).toBe("/404.html");
    expect(assetRoute?.headers?.["Cache-Control"]).toBe("public, max-age=31536000, immutable");
    expect(read("site/404.html")).toContain("That record is not here.");
  });
});
