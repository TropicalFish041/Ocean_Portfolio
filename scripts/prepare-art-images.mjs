/** Generate a browser-friendly JPEG for the existing ComiCup 31 artwork.
 * The user's original image-08.JPG is never modified or deleted.
 * Next 15 installs sharp as an optional dependency; the fallback preserves the source. */
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const art = fileURLToPath(new URL('../public/art/', import.meta.url));
const source = join(art, 'image-08.JPG');
const target = join(art, 'image-08-display.jpg');
if (!existsSync(source)) {
  console.warn('ComiCup 31 image not found: public/art/image-08.JPG');
  process.exitCode = 0;
} else if (!existsSync(target) || statSync(source).mtimeMs > statSync(target).mtimeMs) {
  try {
    const { default: sharp } = await import('sharp');
    await sharp(source, { failOn: 'none' })
      .rotate().resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 83, mozjpeg: true }).toFile(target);
    console.log('Created optimized ComiCup 31 JPEG:', target);
  } catch (error) {
    // Preserve a working URL, but report if the original cannot be decoded.
    copyFileSync(source, target);
    console.warn('Could not re-encode ComiCup 31; copied original instead:', String(error));
  }
}
