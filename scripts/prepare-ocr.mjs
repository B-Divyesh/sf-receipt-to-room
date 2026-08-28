import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "app", "public", "ocr");
await mkdir(join(output, "tessdata"), { recursive: true });

await cp(
  join(root, "node_modules", "@tesseract.js-data", "eng", "4.0.0_best_int", "eng.traineddata.gz"),
  join(output, "tessdata", "eng.traineddata.gz")
);
await cp(
  join(root, "node_modules", "tesseract.js", "dist", "worker.min.js"),
  join(output, "worker.min.js")
);

const coreDir = join(root, "node_modules", "tesseract.js-core");
for (const name of await readdir(coreDir)) {
  if (name.startsWith("tesseract-core") && (name.endsWith(".js") || name.endsWith(".wasm"))) {
    await cp(join(coreDir, name), join(output, name));
  }
}
