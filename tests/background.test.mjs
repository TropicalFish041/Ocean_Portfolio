import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';
const root = process.cwd();
const read = path => readFileSync(join(root, path), 'utf8');
const hero = read('view/Hero.tsx');
const css = read('app/globals.css');

test('night scene and two-ink surface are preserved', () => {
  assert.match(hero, /night-frame-/);
  assert.match(read('app/svg-assets.css'), /#002FA7/);
  assert.match(css, /--sea-horizon/);
  assert.match(css, /\.gif-firework--reflection/);
  assert.ok(statSync(join(root, 'public/ocean/night-frame-0.svg')).size > 100_000);
  assert.equal(JSON.parse(read('data/chapters.json')).length, 4);
});

test('uniform Klein-blue field replaces previous gradients and textures', () => {
  const svgCss = read('app/svg-assets.css');
  assert.match(svgCss, /background: #002FA7/);
  assert.match(svgCss, /\.ocean-world, \.hero \{/);
  assert.match(svgCss, /rgba\(0,47,167,0\) 94%/);
  assert.match(svgCss, /\.ocean-world::before/);
  assert.match(svgCss, /\.ocean-world::after/);
  assert.match(svgCss, /display: none !important/);
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
    assert.ok(statSync(join(root, 'public/animations/firework-frames', `${i}.svg`)).size > (i === 0 ? 60 : 1000));
  }
});

test('offline preview has independent contact and four fish chapters', () => {
  const offline = read('scripts/create-offline-preview.mjs');
  assert.match(offline, /data\/contact\.json/);
  assert.match(offline, /JSON\.stringify\(\[\.\.\.chapters, contact\]\)/);
  assert.match(offline, /firework-frames/);
});

test('hello interlude, viewport-triggered swim and five SVG frames per fish', () => {
  const section = read('view/ChapterSection.tsx');
  const journey = read('view/OceanJourney.tsx');
  const chapters = JSON.parse(read('data/chapters.json'));
  assert.match(journey, /className="hello-section"/);
  assert.match(journey, /Veritas liberabit vos\./);
  assert.match(hero, /href="#hello"/);
  assert.match(section, /IntersectionObserver/);
  assert.match(section, /frameMs/);
  assert.match(section, /setFrame\(previous => \(previous \+ 1\) % 5\)/);
  assert.match(css, /chapter-section--in-view/);
  assert.deepEqual(chapters.map(c => c.id), ['about','projects','shark','experience']);
  assert.equal(chapters[1].image, '/fish/peppermint-angelfish.svg');
  assert.equal(chapters[1].title, 'Projects & Experience');
  assert.equal(chapters[1].items.length, 7);
  const folders = ['lionfish','peppermint-angelfish','opah','shark'];
  for (const folder of folders) for (let frame=0;frame<5;frame++) {
    assert.ok(statSync(join(root,'public/fish/frames',folder,`${frame}.svg`)).size > 1000);
  }
  assert.match(read('scripts/create-offline-preview.mjs'), /swimJS/);
});

test('two independent coral cutouts decorate only the first two sections', () => {
  const component = read('view/ChapterSection.tsx');
  assert.match(component, /coral-reef--about/);
  assert.match(component, /coral-reef--projects/);
  assert.match(css, /@keyframes coral-sway/);
  assert.match(css, /pointer-events: none/);
  for (const image of ['reef-about.svg', 'reef-projects.svg']) {
    const svg = read(join('public/coral', image));
    assert.match(svg, /data-coral-half-density="true"/);
    assert.ok(statSync(join(root, 'public/coral', image)).size > 5_000);
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
  assert.doesNotMatch(music, /music-toggle/);
  assert.match(music, /autoPlay/);
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

test('three-frame sky gate, animated sea, boat and independently positioned fireworks', () => {
  const entry = read('view/EntryGate.tsx');
  const journey = read('view/OceanJourney.tsx');
  assert.match(journey, /<EntryGate \/>/);
  assert.match(entry, /click to explore/);
  assert.match(entry, /SKY_FRAMES = 3/);
  assert.match(entry, /setLeaving\(true\)/);
  assert.match(hero, /night-frame-/);
  assert.match(hero, /NIGHT_FRAME_MS/);
  assert.match(hero, /hero__boat-rock/);
  assert.match(css, /sea-camera-rock/);
  assert.match(css, /boat-rock/);
  for (let i=0; i<3; i++) {
    assert.ok(statSync(join(root, 'public/intro', `sky-front-${i}.svg`)).size>3_000);
    assert.ok(statSync(join(root, 'public/ocean', `night-frame-${i}.svg`)).size>100_000);
  }
  assert.ok(statSync(join(root, 'public/ocean/boat.svg')).size>10_000);
});

test('reef ends are no longer clipped and shark enters from the left', () => {
  assert.match(css, /\.chapter-section \{ overflow: visible; \}/);
  assert.match(css, /\.coral-reef--about/);
  assert.match(css, /\.coral-reef--projects/);
  assert.match(css, /\.chapter-section--shark \{ --swim-rest-x: -13vw; --swim-off-x: -75vw; \}/);
  assert.match(css, /\.coral-reef \{ --reef-edge-overhang: 10px; opacity: \.88; \}/);
});

test('four centered handwritten labels and two new moving underwater cutouts', () => {
  const component = read('view/ChapterSection.tsx');
  for (const label of ['About Me','Experience','Arts','Interests']) assert.match(component, new RegExp('>' + label + '<'));
  for (const name of ['reef-shark.svg','kelp-experience.svg']) {
    const svg = read(join('public/coral', name));
    assert.match(svg, /data-coral-half-density="true"/);
    assert.ok(statSync(join(root, 'public/coral', name)).size > 5_000);
  }
  assert.match(component, /coral-reef--shark/);
  assert.match(component, /kelp-forest--experience/);
  assert.match(css, /bottom: -14svh/);
  assert.match(css, /coral-sway/);
  assert.match(css, /\.chapter-section--experience \.chapter-section__label/);
});
