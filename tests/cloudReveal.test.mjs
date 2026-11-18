import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
const read = p => readFileSync(p, 'utf8');

test('Klein-blue cover stays opaque until cloud exit', () => {
  const css = read('app/svg-assets.css');
  assert.match(css, /\.entry-gate::before \{[\s\S]*?background: #002FA7 !important;[\s\S]*?opacity: 1 !important/);
  assert.match(css, /\.entry-gate--leaving::before \{ opacity: 0 !important/);
  assert.match(css, /#002FA7 65%, rgba\(0,47,167,0\) 94%/);
  assert.match(css, /#002FA7 32%, rgba\(0,47,167,0\) 45%/);
  assert.match(css, /\.entry-gate__cloud-stack \{ top: 25dvh; \}/);
});

test('underwater decorations shrink by 1.2 and use 1.5x thicker lines', () => {
  const css = read('app/svg-assets.css');
  for (const width of ['42.5vw, 625px', '43.75vw, 650px', '45vw, 650px', '48.75vw, 712.5px',
    '70vw, 387.5px', '68.75vw, 375px', '70vw, 400px', '72.5vw, 500px']) {
    assert.ok(css.includes(width), `missing ${width}`);
  }
  for (const name of ['reef-about', 'reef-projects', 'reef-shark', 'kelp-experience']) {
    assert.match(read(`public/coral/${name}.svg`), /stroke-width="2\.175"/);
  }
  assert.match(read('public/ocean/night-frame-0.svg'), /stroke-width="1\.45"/);
});

test('fish hitbox covers its whole image, and sparse wave art is kept behind it', () => {
  const fish = read('view/ChapterSection.tsx');
  const css = read('app/svg-assets.css');
  assert.match(fish, /onClick=\{\(\) => onOpen\(chapter\.id\)\}/);
  assert.doesNotMatch(fish, /getImageData|openIfPainted|pixelsRef/);
  assert.match(css, /\.ocean-world::after \{/);
  assert.match(css, /data:image\/svg\+xml;base64/);
  assert.match(css, /top: max\(100svh, 470px\)/);
  assert.match(css, /pointer-events: none/);
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
