import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const css = readFileSync(join(root, 'app/globals.css'), 'utf8');

test('a single painted gradient and texture layer spans the full page', () => {
  assert.match(css, /\.ocean-world\s*\{[\s\S]*?linear-gradient\(180deg,/);
  assert.match(css, /\.ocean-world::before\s*\{/);
  assert.match(css, /impasto-relief\.webp/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /mix-blend-mode:\s*overlay/);
  assert.ok(statSync(join(root, 'public/textures/impasto-relief.webp')).size > 10_000);
});

test('the sunset and scenes contain no additional decorative objects or image layers', () => {
  const hero = readFileSync(join(root, 'view/Hero.tsx'), 'utf8');
  const scene = readFileSync(join(root, 'view/ChapterSection.tsx'), 'utf8');
  assert.doesNotMatch(hero, /<img|<svg|<h[1-6]|<p\b/);
  assert.equal((scene.match(/<img\s/g) || []).length, 1);
  assert.doesNotMatch(css, /\.hero::(?:before|after)/);
});
