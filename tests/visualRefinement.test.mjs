import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';

const root = process.cwd();
const css = readFileSync(join(root, 'app/globals.css'), 'utf8');
const entry = readFileSync(join(root, 'view/EntryGate.tsx'), 'utf8');
const offline = readFileSync(join(root, 'scripts/create-offline-preview.mjs'), 'utf8');

test('four background cutouts overhang by exactly 10px, also on mobile', () => {
  assert.match(css, /--reef-edge-overhang: 10px;/);
  assert.equal((css.match(/--reef-edge-overhang: 10px;/g) || []).length, 2);
  assert.match(css, /left: calc\(0px - var\(--reef-edge-overhang\)\)/);
  assert.match(css, /right: calc\(0px - var\(--reef-edge-overhang\)\)/);
});

test('Arts label moves inward without changing font and section order', () => {
  assert.match(css, /chapter-section--shark \.chapter-section__label \{ right: clamp\(24px, 14vw, 205px\)/);
  assert.deepEqual(JSON.parse(readFileSync(join(root,'data/chapters.json'),'utf8')).map(x => x.id), ['about','projects','shark','experience']);
});

test('underwater palette is paused without changing layout', () => {
  const replacement = readFileSync(join(root, 'app/svg-assets.css'), 'utf8');
  assert.match(replacement, /\.ocean-world/);
  assert.match(replacement, /background: #002FA7/);
  assert.doesNotMatch(replacement, /linear-gradient/);
  assert.match(replacement, /\.hero__fade/);
});

test('the three original sky layers use SVG and preserve the old 1100ms timing', () => {
  assert.match(entry, /SKY_FRAME_MS = 1100/);
  assert.match(entry, /sky-front-\$\{frame\}\.svg/);
  for (let i=0; i<3; i++) {
    const image = readFileSync(join(root, 'public/intro', `sky-front-${i}.svg`), 'utf8');
    assert.match(image, /<svg\b/);
  }
  assert.match(offline, /skyFrames/);
});
