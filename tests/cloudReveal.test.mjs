import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
const read = p => readFileSync(p, 'utf8');

test('clouds do not cover the entire sea with a solid background', () => {
  const css = read('app/svg-assets.css');
  assert.match(css, /\.entry-gate \{ background: transparent !important/);
  assert.match(css, /\.entry-gate::before \{ background: transparent !important/);
  assert.match(css, /rgba\(0,47,167,0\) 43%/);
  assert.match(css, /transparent 94%/);
  assert.match(css, /entry-gate--leaving \.entry-gate__cloud-layer::before \{ opacity: 0/);
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
