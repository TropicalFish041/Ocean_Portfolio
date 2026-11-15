import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');
const css = read('app/globals.css');
const hero = read('view/Hero.tsx');
const animation = read('public/animations/fireworks.js');

test('night seascape replaces the sunset without losing the impasto background', () => {
  assert.match(css, /\.ocean-world\s*\{[\s\S]*?linear-gradient\(180deg,/);
  assert.match(css, /\.ocean-world::before\s*\{/);
  assert.match(css, /impasto-relief\.webp/);
  assert.match(css, /mix-blend-mode:\s*overlay/);
  assert.match(hero, /night-seascape\.png/);
  assert.match(css, /hero__fade/);
  assert.match(css, /--surface-blue:\s*#0b205b/i);
  assert.ok(statSync(join(root, 'public/textures/impasto-relief.webp')).size > 10_000);
  assert.ok(statSync(join(root, 'public/ocean/night-seascape.png')).size > 100_000);
});

test('fireworks use painterly animated marks and share source data with reflections', () => {
  assert.match(hero, /<canvas\b/);
  assert.match(hero, /\/animations\/fireworks\.js/);
  assert.match(animation, /paintSky\(burst, now\)/);
  assert.match(animation, /paintReflection\(burst, now\)/);
  assert.match(animation, /for \(const burst of bursts\)/);
  assert.match(animation, /bursts\.length < 3/);
  assert.match(animation, /Math\.random\(\)/);
  assert.match(animation, /prefers-reduced-motion/);
  assert.match(animation, /IntersectionObserver/);
});

test('existing five fish scenes and information architecture remain untouched', () => {
  const chapterSection = read('view/ChapterSection.tsx');
  const oceanJourney = read('view/OceanJourney.tsx');
  assert.equal((chapterSection.match(/<img\b/g) || []).length, 1);
  assert.match(oceanJourney, /<ChapterDialog/);
  assert.doesNotMatch(hero, /<h[1-6]|<p\b|<nav|<footer/);
  assert.doesNotMatch(css, /\.hero::(?:before|after)/);
});

test('offline preview embeds the same sea painting and fireworks source', () => {
  const script = read('scripts/create-offline-preview.mjs');
  assert.match(script, /seaPainting/);
  assert.match(script, /fireworksScript/);
  assert.match(script, /ocean-fireworks/);
});
