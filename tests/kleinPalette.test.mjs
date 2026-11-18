import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
test('the entire illustrated canvas uses Klein blue and black ink only', () => {
  const css = read('app/svg-assets.css');
  assert.match(css, /#002FA7/);
  assert.match(css, /\.ocean-world::before, \.ocean-world::after/);
  assert.match(css, /\.hero__fade \{ display: none/);
  assert.match(css, /\.entry-gate::before \{ background: #002FA7/);
  assert.doesNotMatch(css, /invert\(1\)|linear-gradient\(/);
});
test('night imagery remains three transparent black vector frames', () => {
  for(let i=0;i<3;i++) {
    const svg=read(`public/ocean/night-frame-${i}.svg`);
    assert.match(svg, /<path\b/);
    assert.doesNotMatch(svg, /background:|<image\b|<rect\b[^>]*fill=["']white/i);
    assert.match(svg,/stroke="#000"/);
  }
});
test('original five-frame fish and fireworks survive path-only repair', () => {
  const sanitizer=read('scripts/normalize-svg-backgrounds.mjs');
  assert.match(sanitizer, /root\.replace|content\.replace/);
  assert.match(sanitizer, /content !== original/);
  assert.match(read('view/ChapterSection.tsx'),/setFrame\(previous => \(previous \+ 1\) % 5\)/);
  assert.match(read('view/Hero.tsx'),/FRAME_COUNT = 5/);
});
