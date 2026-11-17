import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';

const root = process.cwd();
const read = file => readFileSync(join(root, file), 'utf8');
const entry = read('view/EntryGate.tsx');
const css = read('app/globals.css');

test('new opening sky is exactly three separate PNG frames at the old 1100ms cadence', () => {
  assert.match(entry, /SKY_FRAMES = 3/);
  assert.match(entry, /SKY_FRAME_MS = 1100/);
  assert.match(entry, /\/intro\/sky-\$\{i\}\.png/);
  for (let i = 0; i < 3; i++) {
    assert.ok(statSync(join(root, 'public/intro', `sky-${i}.png`)).size > 100_000);
    const png = readFileSync(join(root, 'public/intro', `sky-${i}.png`));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), 1912);
    assert.equal(png.readUInt32BE(20), 816);
  }
});

test('three stacked cloud sheets descend in progressively longer sweeps', () => {
  assert.match(entry, /\[0, 1, 2\]\.map\(layer/);
  assert.match(entry, /EXIT_MS = 4400/);
  assert.match(css, /\.entry-gate__cloud-stack/);
  assert.match(css, /@keyframes cloud-descent/);
  const markers = [...css.matchAll(/(?:0%|22\.5%|53\.5%|100%)\s*\{\s*transform: translate3d\(0,/g)];
  assert.equal(markers.length, 4);
  const durations = [22.5, 53.5 - 22.5, 100 - 53.5];
  assert.ok(durations[0] < durations[1] && durations[1] < durations[2]);
});

test('sea camera is quicker without a zoom pop and remains paused behind entry', () => {
  assert.match(css, /sea-camera-rock 6\.4s/);
  assert.match(css, /\.ocean-entry-active \.hero__painted-scene \{ animation-play-state: paused;/);
  const camera = css.match(/@keyframes sea-camera-rock \{([\s\S]*?)\}/)?.[1] ?? '';
  assert.doesNotMatch(camera, /scale\(/);
  assert.match(entry, /classList\.add\('ocean-entry-active'\)/);
});

test('music first attempts autoplay before clicks and retries when loaded', () => {
  const music = read('view/BackgroundMusic.tsx');
  assert.match(music, /audio\.play\(\)/);
  assert.match(music, /autoPlay loop/);
  assert.match(music, /audio\.addEventListener\('canplay', start\)/);
  assert.match(music, /window\.addEventListener\('pointerdown', start\)/);
  assert.doesNotMatch(music, /music-toggle/);
});

test('standalone preview mirrors the cloud stack and time sequence', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /class="entry-gate__cloud-stack"/);
  assert.match(offline, /class="entry-sky-frame"/);
  assert.match(offline, /}, 1100\)/);
  assert.match(offline, /reduced \? 150 : 4400/);
});
