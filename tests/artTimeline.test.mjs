import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const gallery = JSON.parse(read('data/artworks.json'));

test('Arts data stays valid and all referenced files exist with matching case', () => {
  assert.ok(gallery.introduction?.trim());
  assert.ok(Array.isArray(gallery.works));
  const works = gallery.works;
  assert.ok(works.length > 0);
  assert.equal(new Set(works.map(w => w.id)).size, works.length);
  for (const work of works) {
    assert.ok(work.id && work.title && work.date && Number.isInteger(work.year));
    assert.ok(['video', 'image'].includes(work.type));
    assert.match(work.src, /^\/art\/[A-Za-z0-9._-]+$/);
    const suffix = work.src.split('.').at(-1).toLowerCase();
    assert.ok(work.type === 'video' ? suffix === 'mp4' : ['jpg', 'jpeg', 'png', 'webp'].includes(suffix));
    assert.ok(existsSync(join(root, 'public', work.src.slice(1))), `Missing (case-sensitive): ${work.src}`);
  }
});

test('Art modal keeps native video controls, lazy requests and optional archive links', () => {
  const timeline = read('view/ArtTimeline.tsx');
  const dialog = read('view/ChapterDialog.tsx');
  assert.match(timeline, /controls playsInline preload="none"/);
  assert.match(timeline, /gallery.links/);
  assert.match(timeline, /\.sort\(\(a, b\) => b - a\)/);
  assert.match(dialog, /chapter.id === 'shark'/);
  assert.match(dialog, /item.title === 'CV'/);
  assert.match(read('interface_adapter/ShowChapterPresenter.ts'), /id: chapter.id/);
});
