import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
const read = p => readFileSync(p, 'utf8');

test('the closed gate covers the night with Klein blue until entry', () => {
  const css = read('app/svg-assets.css');
  assert.match(css, /\.entry-gate::before \{[\s\S]*?background: #002FA7 !important;[\s\S]*?opacity: 1 !important;/);
  assert.match(css, /\.entry-gate--leaving::before \{ opacity: 0 !important; \}/);
  assert.match(css, /#002FA7 65%, rgba\(0,47,167,0\) 94%/);
  assert.match(css, /\.entry-gate__cloud-layer--3::before/);
  assert.match(css, /#002FA7 32%, rgba\(0,47,167,0\) 45%/);
});

test('underwater ornaments are 1.5x larger and match the night stroke', () => {
  const css = read('app/svg-assets.css');
  for (const token of ['51vw, 750px','52.5vw, 780px','54vw, 780px','58.5vw, 855px']) {
    assert.ok(css.includes(token));
  }
  for (const name of ['reef-about', 'reef-projects', 'reef-shark', 'kelp-experience']) {
    assert.match(read(`public/coral/${name}.svg`), /stroke-width="1\.45"/);
  }
  assert.match(read('public/ocean/night-frame-0.svg'), /stroke-width="1\.45"/);
});

test('night is decoded before transition and preloaded as high priority', () => {
  assert.match(read('view/EntryGate.tsx'), /nightReady\.current = painting\.decode\(\)/);
  assert.match(read('view/EntryGate.tsx'), /void nightReady\.current\.then/);
  assert.match(read('view/Hero.tsx'), /fetchPriority="high"/);
  assert.match(read('app/layout.tsx'), /rel="preload"/);
  assert.match(read('scripts/create-offline-preview.mjs'), /void seaReady\.then/);
});

test('night, clouds, corals and fish remain vector-only and small enough to draw', () => {
  for(let i=0;i<3;i++) {
    const night=read(`public/ocean/night-frame-${i}.svg`);
    const cloud=read(`public/intro/sky-front-${i}.svg`);
    assert.ok(statSync(`public/ocean/night-frame-${i}.svg`).size < 180_000);
    assert.ok(statSync(`public/intro/sky-front-${i}.svg`).size < 120_000);
    for(const xml of [night, cloud]) {
      assert.match(xml,/<path\b/);
      assert.doesNotMatch(xml,/<image\b|data:image|background: white/i);
      assert.match(xml,/stroke="#000"/);
    }
  }
});
