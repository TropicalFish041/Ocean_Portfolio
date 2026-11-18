/** One-time, idempotent transparency repair for the ORIGINAL extracted SVG paths.
 * No raster conversion, no path rewriting, and no changes to the five-frame animations.
 * Automatically runs before npm run dev/build/test/offline. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../public/', import.meta.url));
let changed = 0;
let checked = 0;
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    if (!entry.name.endsWith('.svg')) continue;
    checked++;
    const original = readFileSync(path, 'utf8');
    let content = original.replace(/<svg\b[^>]*>/i, tag => {
      // Root 'background: white' makes even transparent vectors opaque.
      return tag.replace(/\s+style=(['"])(.*?)\1/gi, (_attr, _q, style) => {
        const keep = style.split(';').map(item => item.trim()).filter(item => {
          return item && !/^background(?:-color)?\s*:/i.test(item)
            && !/^position\s*:/i.test(item);
        });
        return keep.length ? ` style="${keep.join('; ')}"` : '';
      });
    });
    // Remove explicitly painted white backplates, if any, without touching ink paths.
    content = content.replace(/<rect\b[^>]*\bfill=["'](?:white|#fff|#ffffff)["'][^>]*\/?\s*>/gi, '');
    if (/<image\b|data:image\/(?:png|jpe?g|webp)/i.test(content)) {
      throw new Error(`Raster data found in vector asset: ${path}`);
    }
    if (content !== original) { writeFileSync(path, content, 'utf8'); changed++; }
  }
}
walk(root);
console.log(`SVG transparent backgrounds: ${checked} checked, ${changed} repaired.`);
