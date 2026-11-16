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
  assert.equal(JSON.parse(read('data/chapters.json')).length, 4);
});

test('continuous lighter-to-abyss gradient and visible lower texture', () => {
  assert.match(css, /#0b205b 18\.45%/);
  assert.match(css, /#010512 100%/);
  assert.match(css, /\.ocean-world::before/);
  assert.match(css, /\.ocean-world::after/);
  assert.match(css, /background-size: 1120px 1120px/);
});

test('fish scaling is editable through four named CSS variables', () => {
  for (const id of ['about', 'projects', 'experience', 'shark']) {
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

test('offline preview has independent contact and four fish chapters', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /data\/contact\.json/);
  assert.match(offline, /JSON\.stringify\(\[\.\.\.chapters, contact\]\)/);
  assert.match(offline, /firework-frames/);
});


test('hello interlude, viewport-triggered swim and five PNG frames per fish', () => {
  const section = read('view/ChapterSection.tsx');
  const journey = read('view/OceanJourney.tsx');
  const chapters = JSON.parse(read('data/chapters.json'));
  assert.match(journey, /className="hello-section"/);
  assert.match(journey, /<span>Hello<\/span>/);
  assert.match(hero, /href="#hello"/);
  assert.match(section, /IntersectionObserver/);
  assert.match(section, /frameMs/);
  assert.match(section, /setFrame\(previous => \(previous \+ 1\) % 5\)/);
  assert.match(css, /chapter-section--in-view/);
  assert.deepEqual(chapters.map(c => c.id), ['about','projects','shark','experience']);
  assert.equal(chapters[1].image, '/fish/peppermint-angelfish.png');
  assert.equal(chapters[1].title, 'Projects & Experience');
  assert.equal(chapters[1].items.length, 6);
  const folders = ['butterflyfish','peppermint-angelfish','opah','shark'];
  for (const folder of folders) for (let frame=0;frame<5;frame++) {
    assert.ok(statSync(join(root,'public/fish/frames',folder,`${frame}.png`)).size > 1000);
  }
  assert.match(read('scripts/create-offline-preview.mjs'), /swimJS/);
});


test('two independent coral cutouts decorate only the first two sections', () => {
  const component = read('view/ChapterSection.tsx');
  assert.match(component, /coral-reef--about/);
  assert.match(component, /coral-reef--projects/);
  assert.match(css, /@keyframes coral-sway/);
  assert.match(css, /pointer-events: none/);
  for (const image of ['reef-about.png', 'reef-projects.png']) {
    assert.ok(statSync(join(root, 'public/coral', image)).size > 100_000);
  }
});

test('background music uses the supplied OGG, fades up and is gesture-safe', () => {
  const music = read('view/BackgroundMusic.tsx');
  const journey = read('view/OceanJourney.tsx');
  assert.match(journey, /<BackgroundMusic \/>/);
  assert.match(music, /\/audio\/background\.ogg/);
  assert.match(music, /FADE_IN_MS = 3000/);
  assert.match(music, /audio\.play\(\)/);
  assert.match(music, /pointerdown/);
  assert.match(music, /keydown/);
  assert.match(music, /aria-pressed/);
  assert.match(music, /userPausedRef/);
  assert.ok(statSync(join(root, 'public/audio/background.ogg')).size > 1_000_000);
});

test('offline preview keeps music, coral and the reordered scenes', () => {
  const source = read('scripts/create-offline-preview.mjs');
  assert.match(source, /audioSource/);
  assert.match(source, /coralSources/);
  assert.match(source, /musicJS/);
  assert.match(source, /site-music/);
  assert.deepEqual(JSON.parse(read('data/chapters.json')).map(c => c.id), ['about','projects','shark','experience']);
});
