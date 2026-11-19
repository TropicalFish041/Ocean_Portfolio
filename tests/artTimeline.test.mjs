import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const gallery = JSON.parse(read('data/artworks.json'));

test('Arts timeline has six playable videos and eighteen images from 2026 to 2023', () => {
  const works = gallery.works;
  assert.equal(works.filter(w => w.type === 'video').length, 6);
  assert.equal(works.filter(w => w.type === 'image').length, 18);
  assert.deepEqual([...new Set(works.map(w => w.year))], [2026, 2025, 2024, 2023]);
  assert.equal(new Set(works.map(w => w.id)).size, works.length);
  for (const work of works) {
    assert.ok(work.title && work.date && work.src.startsWith('/art/'));
    assert.ok(existsSync(join(root, 'public', work.src)), work.src);
    assert.ok(work.src.endsWith(work.type === 'video' ? '.mp4' : '.jpg'));
  }
});

test('Arts dialog is special-cased by stable chapter ID; other chapter dialogs remain unchanged', () => {
  assert.match(read('view/ChapterDialog.tsx'), /chapter.id === 'shark'/);
  assert.match(read('view/ChapterDialog.tsx'), /item.title === 'CV'/);
  assert.match(read('view/ArtTimeline.tsx'), /controls playsInline/);
  assert.match(read('view/ArtTimeline.tsx'), /\.sort\(\(a, b\) => b - a\)/);
  assert.match(read('interface_adapter/ShowChapterPresenter.ts'), /id: chapter.id/);
});
