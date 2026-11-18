/** Idempotent repair for SVG backgrounds and four underwater ornaments.
 * Leave fish, opening clouds, night sky and firework frames unchanged. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const root = join(project, 'public');
const coralNames = new Set(['reef-about.svg', 'reef-projects.svg', 'reef-shark.svg', 'kelp-experience.svg']);
const HALF = 'data-coral-half-density="true"';
const QUARTER = 'data-coral-quarter-density="true"';
let checked = 0, changed = 0;

function normalize(svg) {
  svg = svg.replace(/<svg\b[^>]*>/i, tag =>
    tag.replace(/\s+style=(['"])(.*?)\1/gi, (_attr, _quote, style) => {
      const keep = style.split(';').map(x => x.trim()).filter(x =>
        x && !/^background(?:-color)?\s*:/i.test(x) && !/^position\s*:/i.test(x));
      return keep.length ? ` style="${keep.join('; ')}"` : '';
    }));
  return svg.replace(/<rect\b[^>]*\bfill=["'](?:white|#fff|#ffffff)["'][^>]*\/?\s*>/gi, '');
}

function transformCoral(svg) {
  // Half the original independent SVG strokes = twice previous quarter density.
  svg = svg.replace(/(<path\b[^>]*\bd=")([^"]*)(")/g, (full, before, d, after) => {
    const strokes = d.match(/M[^M]*/g);
    if (!strokes || strokes.length < 2) return full;
    return before + strokes.filter((_, i) => i % 2 === 0).join(' ') + after;
  });
  // Baseline SVG strokes are 2px; earlier 6x version was 12px.
  // 12px / 3 = 4px, irrespective of whether the source uses style or an XML attribute.
  svg = svg.replace(/stroke-width\s*:\s*[\d.]+px/g, 'stroke-width: 4px');
  svg = svg.replace(/stroke-width="[\d.]+"/g, 'stroke-width="4"');
  return svg.replace(/<svg\b/, `<svg ${HALF}`);
}

function originalIfAvailable(svg, name) {
  if (!svg.includes(QUARTER)) return svg;
  // The old script deleted 3/4 of the strokes; recover from Git history when available.
  try {
    const original = execFileSync('git', ['show', `HEAD:public/coral/${name}`], {
      cwd: project, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1024 * 1024,
    });
    if (!original.includes(QUARTER) && !original.includes(HALF)) return original;
  } catch { /* Source ZIPs have no Git metadata. */ }
  console.warn(`Cannot restore omitted strokes in ${name}; restore its original SVG before rerunning this script.`);
  return null;
}

function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) { walk(path); continue; }
    if (!entry.name.endsWith('.svg')) continue;
    checked++;
    const original = readFileSync(path, 'utf8');
    let content = original;
    if (coralNames.has(entry.name) && !content.includes(HALF)) {
      const recovered = originalIfAvailable(content, entry.name);
      if (recovered !== null) content = transformCoral(normalize(recovered));
      else content = normalize(content).replace(/stroke-width\s*:\s*[\d.]+px/g, 'stroke-width: 4px')
        .replace(/stroke-width="[\d.]+"/g, 'stroke-width="4"');
    } else {
      content = normalize(content);
    }
    if (/<image\b|data:image\/(?:png|jpe?g|webp)/i.test(content)) {
      throw new Error(`Raster data found in vector asset: ${path}`);
    }
    if (content !== original) { writeFileSync(path, content, 'utf8'); changed++; }
  }
}
walk(root);
console.log(`SVG backgrounds: ${checked} checked, ${changed} updated.`);
