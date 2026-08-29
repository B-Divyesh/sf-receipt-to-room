import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
// @ts-expect-error The production helper is intentionally plain Node ESM.
import { assertDeploymentProvenance } from "../scripts/release-provenance.mjs";
// @ts-expect-error The production helper is intentionally plain Node ESM.
import { assertTaggedCandidate } from "../scripts/release-candidate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("release and static-host contract", () => {
  test("@claim:release-trigger @claim:release-artifacts ships one new native version through the package, Rust bundle, and tag workflow", () => {
    const pkg = JSON.parse(read("package.json")) as { version: string };
    const cargo = read("src-tauri/Cargo.toml");
    const tauri = JSON.parse(read("src-tauri/tauri.conf.json")) as {
      version: string;
    };
    const workflow = read(".github/workflows/release.yml");

    expect(pkg.version).toBe("0.1.11");
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
    expect(workflow).toContain(
      "releaseCommitish: ${{ needs.source.outputs.commit }}",
    );
    expect(workflow).toContain("ref: ${{ needs.source.outputs.commit }}");
    expect(workflow).toContain("release-provenance.mjs");
    expect(workflow).toContain("release-candidate.mjs");
    const liveGate = read("scripts/verify-live-release.mjs");
    expect(liveGate).toContain("checkout\\.dodopayments\\.com\\/session");
    expect(liveGate).toContain("hostedCheckout.ok");
  });

  test("@claim:release-candidate rejects a release tag that points to a different commit", () => {
    const candidate = "b5b307b4dc38a2001f503652f0661712c5b498f9";
    const staleTaggedParent = "b6683dbeb3806c5cbc0af98ab536d98b93924b13";

    expect(() =>
      assertTaggedCandidate({
        tag: "v0.1.11",
        version: "0.1.11",
        tagCommit: staleTaggedParent,
        expectedCommit: candidate,
      }),
    ).toThrow(`release tag v0.1.11 targets ${staleTaggedParent}`);

    expect(
      assertTaggedCandidate({
        tag: "v0.1.11",
        version: "0.1.11",
        tagCommit: candidate,
        expectedCommit: candidate,
      }),
    ).toEqual({ tag: "v0.1.11", version: "0.1.11", commit: candidate });
  });

  test("rejects the exact release-target drift reported by independent verification", () => {
    const expected = "fbd685d4e11121bfee033b5897e750c51a63155c";
    const stale = "50e6888fc2e78ef7c4dde423ed136db82adcac51";
    const directory = mkdtempSync(
      resolve(tmpdir(), "receipt-release-provenance-"),
    );
    const releasePath = resolve(directory, "release.json");
    const manifestPath = resolve(directory, "latest.json");
    writeFileSync(
      releasePath,
      JSON.stringify({ tag_name: "v0.1.4", target_commitish: stale }),
    );
    writeFileSync(
      manifestPath,
      JSON.stringify({ version: "0.1.4", sourceCommit: stale, platforms: {} }),
    );

    expect(() =>
      execFileSync(
        process.execPath,
        [
          resolve(root, "scripts/release-provenance.mjs"),
          expected,
          releasePath,
          manifestPath,
        ],
        { stdio: "pipe" },
      ),
    ).toThrow(/release targets 50e6888/);

    writeFileSync(
      releasePath,
      JSON.stringify({ tag_name: "v0.1.4", target_commitish: expected }),
    );
    writeFileSync(
      manifestPath,
      JSON.stringify({
        version: "0.1.4",
        sourceCommit: expected,
        platforms: {},
      }),
    );
    expect(
      execFileSync(
        process.execPath,
        [
          resolve(root, "scripts/release-provenance.mjs"),
          expected,
          releasePath,
          manifestPath,
        ],
        { encoding: "utf8" },
      ),
    ).toContain(expected);

    writeFileSync(
      manifestPath,
      JSON.stringify({ version: "0.1.4", sourceCommit: stale, platforms: {} }),
    );
    expect(() =>
      execFileSync(
        process.execPath,
        [
          resolve(root, "scripts/release-provenance.mjs"),
          expected,
          releasePath,
          manifestPath,
        ],
        { stdio: "pipe" },
      ),
    ).toThrow(/release manifest records 50e6888/);
  });

  test("rejects the exact live deployment drift reported by verification 8", () => {
    const expected = "fbd685d4e11121bfee033b5897e750c51a63155c";
    const stale = "50e6888fc2e78ef7c4dde423ed136db82adcac51";
    const page = (commit: string) =>
      `<!doctype html><html><head><meta name="build-commit" content="${commit}"></head></html>`;

    expect(() => assertDeploymentProvenance(page(stale), expected)).toThrow(
      /deployment records 50e6888/,
    );
    expect(() => assertDeploymentProvenance("<!doctype html>", expected)).toThrow(
      /does not publish a build-commit identity/,
    );
    expect(assertDeploymentProvenance(page(expected), expected)).toEqual({
      commit: expected,
    });
  });

  test("stamps every built site entry with the source commit", () => {
    const config = read("vite.site.config.ts");
    const liveGate = read("scripts/verify-live-release.mjs");

    expect(config).toContain('name: "build-commit"');
    expect(config).toContain("BUILD_SOURCE_COMMIT");
    expect(liveGate).toContain("assertDeploymentProvenance(html, expectedCommit)");
  });

  test("does not rewrite unknown requests to the landing page and caches hashed assets immutably", () => {
    const config = JSON.parse(read("site/public/staticwebapp.config.json")) as {
      navigationFallback?: unknown;
      responseOverrides?: Record<string, { rewrite?: string }>;
      routes?: Array<{ route?: string; headers?: Record<string, string> }>;
      globalHeaders?: Record<string, string>;
    };
    const assetRoute = config.routes?.find(
      (route) => route.route === "/assets/*",
    );

    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.["404"]?.rewrite).toBe("/404.html");
    expect(assetRoute?.headers?.["Cache-Control"]).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(config.globalHeaders?.["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(config.globalHeaders?.["X-Frame-Options"]).toBe("DENY");
    expect(read("site/public/_headers")).toContain("frame-ancestors 'none'");
    expect(read("site/404.html")).toContain("Page not found.");
    for (const page of [
      "site/index.html",
      "site/privacy/index.html",
      "site/terms/index.html",
      "site/404.html",
    ]) {
      expect(read(page)).toContain("data-build-version");
      expect(read(page)).not.toMatch(/Built by Param Factory · v\d/);
    }
  });

  test("waits for both HTTP entry points before Playwright starts claim tests", () => {
    const config = read("playwright.config.ts");
    expect(config).toContain('url: "http://127.0.0.1:4173/"');
    expect(config).toContain('url: "http://127.0.0.1:1420/"');
    expect(config.match(/reuseExistingServer: false/g)).toHaveLength(2);
    expect(config.match(/--strictPort/g)).toHaveLength(2);
    expect(config).not.toMatch(/\bport:\s*(4173|1420)/);
  });

  test("@claim:scope-boundaries documents record-keeping limits without promising retailer, valuation, or claim service", () => {
    const readme = read("README.md");
    const terms = read("site/terms/index.html");
    expect(readme).toContain("does not scrape retailers");
    expect(readme).toContain("does not estimate current value");
    expect(readme).toMatch(/not\s+file insurance claims/);
    expect(terms).toContain("does not provide insurance coverage");
  });

  test("round-three public copy uses short, consistent plain words", () => {
    const publicCopy = [
      read("README.md"),
      read("site/index.html"),
      read("site/terms/index.html"),
      read("app/main.ts"),
    ].join("\n");
    expect(publicCopy).not.toMatch(/receipt intake/i);
    expect(publicCopy).not.toMatch(/service window|per client|preflight/i);
    expect(read("site/index.html")).not.toContain("redacted spreadsheet");
    expect(read("README.md")).toMatch(
      /Tag\nonly the final committed candidate\. Run the release check before pushing the\ntag\. It rejects a tag that points to another commit\./,
    );
    expect(read("site/terms/index.html")).toContain(
      "Pay $29 once to add unlimited receipts and use backup files.",
    );
  });

  test("@claim:installer-integrity checks the published checksum before each installer proceeds", () => {
    const shell = read("site/public/install.sh");
    const powershell = read("site/public/install.ps1");
    expect(shell).toContain('[ "$actual" = "$expected" ] ||');
    expect(shell).toContain(
      "Checksum mismatch; the download was not installed.",
    );
    expect(shell.indexOf('[ "$actual" = "$expected" ] ||')).toBeLessThan(
      shell.indexOf("install -m 755"),
    );
    expect(powershell).toContain(
      "Get-FileHash -Path $temporary -Algorithm SHA256",
    );
    expect(powershell).toContain(
      "Checksum mismatch; the download was not installed.",
    );
    expect(powershell.indexOf("if ($actual -ne $asset.sha256")).toBeLessThan(
      powershell.indexOf("Start-Process msiexec.exe"),
    );
  });

  test("lists every documented product capability with exactly one claim test", () => {
    const claims = JSON.parse(read(".factory/claims.json")) as Array<{
      id: string;
      test: string;
    }>;
    const ids = claims.map((claim) => claim.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "sample-demo",
        "local-ocr",
        "csv-export",
        "price",
        "release-api",
        "receipt-workflow",
        "editable-records",
        "bulk-queue",
        "image-input",
        "print-undo",
        "local-storage",
        "backup-restore",
        "redacted-exports",
        "privacy-boundaries",
        "license-cache",
        "license-rate-policy",
        "offline-work",
        "checkout-operator",
        "free-exports",
        "scope-boundaries",
        "release-trigger",
        "release-artifacts",
        "release-candidate",
        "installer-integrity",
        "refund-revocation",
      ]),
    );
    expect(new Set(ids).size).toBe(ids.length);
    const e2e = `${read("tests/e2e/product.spec.ts")}\n${read("tests/release-contract.test.ts")}`;
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(e2e.match(new RegExp(`@claim:${claim.id}\\b`, "g"))).toHaveLength(
        1,
      );
    }
  });
});
