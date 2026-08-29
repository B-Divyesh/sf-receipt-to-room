import { execFileSync } from "node:child_process";
import { defineConfig } from "vite";

const sourceCommit = (
  process.env.BUILD_SOURCE_COMMIT ??
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim()
).toLowerCase();

if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
  throw new Error(`BUILD_SOURCE_COMMIT must be a full Git SHA, received ${sourceCommit}`);
}

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: new URL("./site/index.html", import.meta.url).pathname,
        privacy: new URL("./site/privacy/index.html", import.meta.url).pathname,
        terms: new URL("./site/terms/index.html", import.meta.url).pathname,
        notFound: new URL("./site/404.html", import.meta.url).pathname
      }
    }
  },
  plugins: [{
    name: "receipt-to-room-build-identity",
    transformIndexHtml() {
      return [{
        tag: "meta",
        attrs: { name: "build-commit", content: sourceCommit },
        injectTo: "head"
      }];
    }
  }],
  server: { port: 4173, strictPort: true }
});
