import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const hero = read('view/Hero.tsx');
const css = read('app/globals.css');

test('existing painted ocean and fish presentation are preserved', () => {
  assert.match(hero, /night-seascape\.png/);
  assert.match(css, /impasto-relief\.webp/);
  assert.match(css, /--sea-horizon/);
  assert.match(css, /\.gif-firework--reflection/);
  assert.ok(statSync(join(root, 'public/ocean/night-seascape.png')).size > 100_000);
  assert.equal((read('data/chapters.json').match(/"fishName"/g) || []).length, 5);
});

test('animation is a finite five-frame sequence, never a looping GIF', () => {
  assert.match(hero, /FRAME_COUNT = 5/);
  assert.match(hero, /FRAME_MS = 220/);
  assert.match(hero, /framePath\(burst\.frame\)/);
  assert.match(hero, /createFirework\(nextId\.current\+\+, burst\)/);
  assert.doesNotMatch(hero, /\.gif['"]/);
  for (let i = 0; i < 5; i++) {
    assert.ok(statSync(join(root, 'public/animations/firework-frames', `${i}.png`)).size > 1000);
  }
});

test('at least one and at most three fireworks, with synchronized reflections', () => {
  assert.match(hero, /startCount = 1 \+ Math\.floor\(Math\.random\(\) \* 3\)/);
  assert.match(hero, /next\.length < 3/);
  assert.match(hero, /next\.length > 1/);
  assert.match(hero, /const src = framePath\(burst\.frame\)/);
  assert.equal((hero.match(/<img src=\{src\}/g) || []).length, 2);
  assert.match(hero, /prefers-reduced-motion/);
});

test('offline preview uses the same five frame images, without nonexistent scripts', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /firework-frames/);
  assert.match(offline, /frameSources/);
  assert.match(offline, /fireworksJS/);
  assert.doesNotMatch(offline, /public\/animations\/fireworks\.js/);
});
