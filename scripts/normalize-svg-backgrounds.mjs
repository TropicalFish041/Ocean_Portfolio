/** Idempotent repair for SVG backgrounds and four underwater ornaments.
 * Keep fish, intro clouds, night sky and five-frame animations unchanged. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const coralNames = new Set(['reef-about.svg', 'reef-projects.svg', 'reef-shark.svg', 'kelp-experience.svg']);
let checked = 0, changed = 0;

function thinCoral(svg) {
  if (svg.includes('data-coral-quarter-density="true"')) return svg;
  svg = svg.replace(/(<path\b[^>]*\bd=")([^"]*)(")/g, (full, before, d, after) => {
    const strokes = d.match(/M[^M]*/g);
    if (!strokes || strokes.length < 4) return full;
    return before + strokes.filter((_, i) => i % 4 === 0).join(' ') + after;
  });
  return svg.replace(/<svg\b/, '<svg data-coral-quarter-density="true"');
}

function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    if (!entry.name.endsWith('.svg')) continue;
    checked++;
    const original = readFileSync(path, 'utf8');
    let content = original.replace(/<svg\b[^>]*>/i, tag =>
      tag.replace(/\s+style=(['"])(.*?)\1/gi, (_attr, _q, style) => {
        const keep = style.split(';').map(x => x.trim()).filter(x =>
          x && !/^background(?:-color)?\s*:/i.test(x) && !/^position\s*:/i.test(x));
        return keep.length ? ` style="${keep.join('; ')}"` : '';
      }));
    content = content.replace(/<rect\b[^>]*\bfill=["'](?:white|#fff|#ffffff)["'][^>]*\/?\s*>/gi, '');
    if (/<image\b|data:image\/(?:png|jpe?g|webp)/i.test(content)) {
      throw new Error(`Raster data found in vector asset: ${path}`);
    }
    if (coralNames.has(entry.name)) {
      // Source files use 2px in the style attribute; some edited copies use
      // a stroke-width XML attribute. Multiply either representation by 6.
      if (!content.includes('data-coral-quarter-density="true"')) {
        content = content.replace(/stroke-width\s*:\s*([\d.]+)px/g,
          (_full, value) => `stroke-width: ${Number((Number(value) * 6).toFixed(4))}px`);
        content = content.replace(/stroke-width="([\d.]+)"/g,
          (_full, value) => `stroke-width="${Number((Number(value) * 6).toFixed(4))}"`);
        content = thinCoral(content);
      }
    }
    if (content !== original) { writeFileSync(path, content, 'utf8'); changed++; }
  }
}
walk(root);
console.log(`SVG backgrounds: ${checked} checked, ${changed} updated.`);
