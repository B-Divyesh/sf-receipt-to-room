import { defineConfig } from "vite";

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
  server: { port: 4173, strictPort: true }
});
