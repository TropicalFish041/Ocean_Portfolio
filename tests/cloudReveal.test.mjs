import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
const read = p => readFileSync(p, 'utf8');

test('intro sky and full-coverage curtain are preserved; prompt doubles and is bold', () => {
  const css = read('app/svg-assets.css');
  assert.match(css, /entry-gate__cloud-stack \{ top: 25dvh/);
  assert.match(css, /background: #002FA7 !important/);
  assert.match(css, /font-size: clamp\(32px, 3\.5vw, 44px\)/);
  assert.match(css, /font-weight: 900 !important/);
});

test('fish and sea scene stay separate from the animated ripples', () => {
  const css = read('app/svg-assets.css');
  const journey = read('view/OceanJourney.tsx');
  const waves = read('view/UnderwaterRipples.tsx');
  assert.match(css, /\.hero \{ overflow: visible; \}/);
  assert.match(css, /\.hero__painted-scene \{ overflow: visible; bottom: -12svh; \}/);
  assert.match(css, /\.underwater-ripples/);
  assert.match(css, /ocean-world::after \{ content: none/);
  assert.match(journey, /<UnderwaterRipples \/>/);
  assert.match(waves, /random\(1\.56, 2\.35\) \* 8/);
  assert.match(waves, /window\.setInterval/);
  assert.match(waves, /pointerEvents|underwater-ripples/);
  assert.doesNotMatch(css, /data:image\/svg\+xml;base64/);
});

test('coral density and stroke updated only by idempotent sanitizer', () => {
  const sanitizer = read('scripts/normalize-svg-backgrounds.mjs');
  assert.match(sanitizer, /data-coral-quarter-density/);
  assert.match(sanitizer, /i % 4 === 0/);
  assert.match(sanitizer, /Number\(value\) \* 6/);
  assert.match(sanitizer, /coralNames\.has/);
  assert.match(read('view/ChapterSection.tsx'), /onClick=\{\(\) => onOpen\(chapter\.id\)\}/);
});

test('contact includes final CV link with predictable downloadable PDF name', () => {
  const contact = JSON.parse(read('data/contact.json'));
  const dialog = read('view/ChapterDialog.tsx');
  assert.equal(contact.items.at(-1).text, 'download my CV');
  assert.match(dialog, /\/cv\/Ruoshui_Deng_CV\.pdf/);
  assert.match(dialog, /download="Ruoshui_Deng_CV\.pdf"/);
  const css = read('app/svg-assets.css');
  assert.match(css, /\.detail-dialog__content article h3/);
  assert.match(css, /\.detail-dialog__content article p/);
});
