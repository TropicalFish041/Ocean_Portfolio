import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const hero = read('view/Hero.tsx');
const css = read('app/globals.css');

test('night scene and original impasto texture are preserved', () => {
  assert.match(hero, /night-seascape\.png/);
  assert.match(css, /impasto-relief\.webp/);
  assert.match(css, /--sea-horizon/);
  assert.match(css, /\.gif-firework--reflection/);
  assert.ok(statSync(join(root, 'public/ocean/night-seascape.png')).size > 100_000);
  assert.equal(JSON.parse(read('data/chapters.json')).length, 5);
});

test('continuous lighter-to-abyss gradient and visible lower texture', () => {
  assert.match(css, /#0b205b 16\.6667%/);
  assert.match(css, /#010512 100%/);
  assert.match(css, /\.ocean-world::before/);
  assert.match(css, /\.ocean-world::after/);
  assert.match(css, /background-size: 1120px 1120px/);
});

test('fish scaling is editable through five named CSS variables', () => {
  for (const id of ['about', 'projects', 'skills', 'experience', 'shark']) {
    assert.match(css, new RegExp('\\.chapter-section--' + id + '\\s*\\{\\s*--fish-max:'));
  }
  assert.match(css, /width: min\(var\(--fish-max/);
});

test('center dialog uses a 2\/3 viewport width and a 20% opaque backdrop surface', () => {
  assert.match(css, /width: 66\.6667vw/);
  assert.match(css, /rgba\(8, 24, 47, \.20\)/);
  assert.match(css, /translate\(-50%, -50%\)/);
  assert.match(css, /backdrop-filter: blur\(18px\)/);
});

test('original staggered single-burst fireworks and handwritten nav are still there', () => {
  assert.match(hero, /FRAME_COUNT = 5/);
  assert.match(hero, /framePath\(burst\.frame!?\)/);
  assert.match(hero, /next\.length < 3/);
  assert.match(hero, /hero__contact-brush/);
  assert.match(hero, /Scroll to view my work/);
  for (let i = 0; i < 5; i++) {
    assert.ok(statSync(join(root, 'public/animations/firework-frames', `${i}.png`)).size > 1000);
  }
});

test('offline preview has independent contact and five fish chapters', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /data\/contact\.json/);
  assert.match(offline, /JSON\.stringify\(\[\.\.\.chapters, contact\]\)/);
  assert.match(offline, /firework-frames/);
});
