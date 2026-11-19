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

test('every MP4 has a real, replaceable cover and the photo lightbox is keyboard accessible', () => {
  const videoWorks = gallery.works.filter(work => work.type === 'video');
  assert.equal(videoWorks.length, 6);
  for (const work of videoWorks) {
    assert.match(work.poster, /^\/art\/posters\/video-\d+\.jpg$/);
    assert.ok(existsSync(join(root, 'public', work.poster.slice(1))), `Missing poster: ${work.poster}`);
  }
  const timeline = read('view/ArtTimeline.tsx');
  assert.match(timeline, /poster=\{'poster' in work \? work\.poster : undefined\}/);
  assert.match(timeline, /previewDialog/);
  assert.match(timeline, /\.showModal\(\)/);
  assert.match(timeline, /onCancel=\{event => \{ event\.preventDefault\(\); setPreview\(null\); \}\}/);
  assert.match(timeline, /id === 'image-08' \? 'eager' : 'lazy'/);
  assert.match(timeline, /Retry image/);
});

test('About Me prompt breathes at Neco Black; site music stops during artwork video playback', () => {
  const css = read('app/svg-assets.css');
  const music = read('view/BackgroundMusic.tsx');
  assert.match(css, /\.chapter-section--about \.chapter-section__explore > span/);
  assert.match(css, /font-weight: 900 !important/);
  assert.match(css, /entry-prompt-breathe 5\.4s/);
  assert.match(music, /document\.addEventListener\('play', onVideoPlay, true\)/);
  assert.match(music, /document\.addEventListener\('pause', onVideoStop, true\)/);
  assert.match(music, /document\.addEventListener\('ended', onVideoStop, true\)/);
  assert.match(music, /audio!\.pause\(\)/);
  assert.match(music, /resumeAfterVideo/);
});
