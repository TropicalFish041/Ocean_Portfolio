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

test('only early ocean palette changes; subsequent ocean colors stay unchanged', () => {
  assert.match(css, /#071b59 18\.45%/);
  assert.match(css, /#0b2a70 35%/);
  assert.match(css, /#0337a9 45%/);
  for (const color of ['#083899 55%', '#0b2b76 71%', '#071c49 85%', '#040f25 94%', '#010512 100%']) {
    assert.ok(css.includes(color), `unchanged later ocean stop ${color}`);
  }
  assert.match(css, /impasto-relief\.webp/);
});

test('only foreground cloud uses upscaled PNG sequence with unchanged timing', () => {
  assert.match(entry, /SKY_FRAME_MS = 1100/);
  assert.match(entry, /layer === 0 \? `\/intro\/sky-front-\$\{frame\}\.png`/);
  for (let i=0; i<3; i++) {
    const image = readFileSync(join(root, 'public/intro', `sky-front-${i}.png`));
    assert.equal(image.readUInt32BE(16), 3824);
    assert.equal(image.readUInt32BE(20), 1632);
  }
  assert.match(offline, /foregroundFrames/);
  assert.match(offline, /skyFrontFrames/);
});
