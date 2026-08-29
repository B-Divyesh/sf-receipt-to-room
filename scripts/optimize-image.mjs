import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "assets", "src", "field-guide-hero.png");
const output = join(root, "site", "public", "assets");
for (const width of [384, 672, 768, 1536]) {
  const resized = sharp(source).resize({ width, withoutEnlargement: true });
  await resized.clone().avif({ quality: width <= 672 ? 50 : width === 768 ? 52 : 57, effort: 6 }).toFile(join(output, `field-guide-hero-${width}.avif`));
  await resized.clone().webp({ quality: width <= 672 ? 72 : 76, effort: 6 }).toFile(join(output, `field-guide-hero-${width}.webp`));
}
for (const name of ["load", "review", "assign", "export"]) {
  const walkthrough = join(output, `walkthrough-${name}.png`);
  for (const width of [480, 720, 960]) {
    await sharp(walkthrough)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 6 })
      .toFile(join(output, `walkthrough-${name}-${width}.webp`));
  }
}
await sharp(source).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 72 }).toFile(join(output, "social-preview.webp"));
await sharp(source).resize(180, 180, { fit: "cover" }).png().toFile(join(output, "apple-touch-icon.png"));
