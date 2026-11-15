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
  assert.match(hero, /FRAME_MS = 250/);
  assert.match(hero, /randomSpawnDelay/);
  assert.match(hero, /framePath\(burst\.frame!?\)/);
  assert.match(hero, /createFirework\(nextId\.current\+\+, lastCreated, now\)/);
  assert.doesNotMatch(hero, /\.gif['"]/);
  for (let i = 0; i < 5; i++) {
    assert.ok(statSync(join(root, 'public/animations/firework-frames', `${i}.png`)).size > 1000);
  }
});

test('at least one and at most three fireworks, with synchronized reflections', () => {
  assert.match(hero, /let active: Firework\[\] = \[createFirework\(nextId\.current\+\+\)\]/);
  assert.match(hero, /next\.length < 3/);
  assert.match(hero, /next\.length === 0/);
  assert.match(hero, /const src = framePath\(burst\.frame!?\)/);
  assert.equal((hero.match(/<img src=\{src\}/g) || []).length, 2);
  assert.match(hero, /prefers-reduced-motion/);
  assert.doesNotMatch(hero, /initialCount/);
  assert.match(hero, /nextSpawnAt = now \+ randomSpawnDelay\(\)/);
  assert.match(hero, /SPAWN_GAP_MIN = 450/);
  assert.match(hero, /SPAWN_GAP_SPREAD = 1400/);
});

test('offline preview uses the same five frame images, without nonexistent scripts', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /firework-frames/);
  assert.match(offline, /frameSources/);
  assert.match(offline, /fireworksJS/);
  assert.match(offline, /const first = make\(\)/);
  assert.match(offline, /randomSpawnDelay/);
  assert.doesNotMatch(offline, /const count = 1 \+ Math\.floor/);
  assert.doesNotMatch(offline, /public\/animations\/fireworks\.js/);
});

test('handwritten overlays use the existing contact panel and hide scroll hint on scroll', () => {
  const journey = read('view/OceanJourney.tsx');
  const chapterSection = read('view/ChapterSection.tsx');
  assert.match(hero, /Ruoshui Deng/);
  assert.match(hero, /Scroll to view my work/);
  assert.match(hero, /showScrollCue/);
  assert.match(hero, /scrollY < 35/);
  assert.match(hero, /hero__contact-brush/);
  assert.match(journey, /onOpenChapter\('contact'\)/);
  assert.match(chapterSection, /chapter.id === 'about'.*About Me/);
  assert.match(chapterSection, /chapter.id === 'projects'.*Experience/);
  assert.match(css, /hero__handwritten-name/);
});
