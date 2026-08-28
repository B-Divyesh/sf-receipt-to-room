import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "assets", "src", "field-guide-hero.png");
const output = join(root, "site", "public", "assets");
for (const width of [768, 1536]) await sharp(source).resize({ width, withoutEnlargement: true }).avif({ quality: width === 768 ? 52 : 57, effort: 6 }).toFile(join(output, `field-guide-hero-${width}.avif`));
await sharp(source).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 72 }).toFile(join(output, "social-preview.webp"));
await sharp(source).resize(180, 180, { fit: "cover" }).png().toFile(join(output, "apple-touch-icon.png"));
