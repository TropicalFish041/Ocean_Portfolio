import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';

const root = process.cwd();
const read = file => readFileSync(join(root, file), 'utf8');
const entry = read('view/EntryGate.tsx');
const css = read('app/globals.css');
const offline = read('scripts/create-offline-preview.mjs');

test('opening sky uses 3 SVG frames at the original 1100ms cadence', () => {
  assert.match(entry, /SKY_FRAMES = 3/);
  assert.match(entry, /SKY_FRAME_MS = 1100/);
  assert.match(entry, /sky-front-\$\{i\}\.svg/);
  for (let i = 0; i < 3; i++) {
    const path = join(root, 'public/intro', `sky-front-${i}.svg`);
    assert.ok(statSync(path).size > 3_000);
    assert.match(readFileSync(path, 'utf8'), /<svg\b/);
  }
});

test('independently positioned transparent clouds retain exact 1/5 and 2/5 alignment', () => {
  assert.match(entry, /\[0, 1, 2\]\.map\(layer/);
  assert.match(entry, /entry-gate__cloud-layer--\$\{layer \+ 1\}/);
  assert.match(css, /\.entry-gate__cloud-stack\s*\{[^}]*height: 110dvh/s);
  const tops = [1, 2, 3].map(n => {
    const m = css.match(new RegExp(`\\.entry-gate__cloud-layer--${n} \\{ top: (-?[\\d.]+)%;`));
    assert.ok(m, `layer ${n} has own top position`);
    return Number(m[1]);
  });
  assert.deepEqual(tops, [-25, -5, 35]);
  assert.equal(tops[1] - tops[0], 20);
  assert.equal(tops[2] - tops[1], 40);
  assert.match(css, /\.entry-gate__cloud-layer--1 img \{/);
  assert.match(css, /\.entry-gate__cloud-layer--2 img \{/);
  assert.match(css, /\.entry-gate__cloud-layer--3 img \{/);
  assert.match(css, /transparent 65%/);
  assert.match(css, /transparent 83%/);
});

test('all clouds travel UP, with front faster than middle faster than rear', () => {
  const parameters = [
    { name: 'front', layer: 1, ms: 1900, distance: 220 },
    { name: 'middle', layer: 2, ms: 3050, distance: 195 },
    { name: 'rear', layer: 3, ms: 4500, distance: 240 },
  ];
  for (const { name, layer, ms, distance } of parameters) {
    assert.match(css, new RegExp(`entry-gate--leaving \\.entry-gate__cloud-layer--${layer} \\{ animation: cloud-${name}-rise ${ms}ms linear both;`));
    assert.match(css, new RegExp(`@keyframes cloud-${name}-rise \\{ to \\{ transform: translate3d\\(0, -${distance}dvh, 0\\);`));
  }
  const speeds = parameters.map(({ ms, distance }) => distance / ms);
  assert.ok(speeds[0] > speeds[1] && speeds[1] > speeds[2], 'strict speed ordering');
  // All three are completely above the viewport before removing the gate.
  const starts = [-27.5, -5.5, 38.5]; // top percentages * 110dvh
  parameters.forEach(({ distance }, i) => assert.ok(starts[i] + 110 - distance < 0));
  assert.match(entry, /EXIT_MS = 4650/);
});

test('main scene is already mounted and starts moving with the first cloud', () => {
  assert.match(entry, /document\.body\.classList\.add\('ocean-entry-leaving'\)/);
  assert.doesNotMatch(css, /animation-play-state: paused/);
  assert.match(css, /sea-camera-rock 6\.4s/);
  const camera = css.match(/@keyframes sea-camera-rock \{([\s\S]*?)\}/)?.[1] ?? '';
  assert.doesNotMatch(camera, /scale\(/);
  assert.match(read('view/OceanJourney.tsx'), /<EntryGate \/>[\s\S]*<main className="ocean-world"/);
});

test('offline version retains the same three independent layers and exit behavior', () => {
  assert.match(offline, /entry-gate__cloud-layer--\$\{layer \+ 1\}/);
  assert.match(offline, /}, 1100\)/);
  assert.match(offline, /reduced \? 150 : 4650/);
  assert.match(offline, /document\.body\.classList\.add\('ocean-entry-leaving'\)/);
});
