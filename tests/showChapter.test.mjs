import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { StaticChapterRepository, portfolioChapters } from '../data_access/StaticChapterRepository.ts';
import { ShowChapterInteractor } from '../use_case/showChapter.ts';
import { ShowChapterController } from '../interface_adapter/ShowChapterController.ts';
import { ShowChapterPresenter } from '../interface_adapter/ShowChapterPresenter.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pipeline = () => {
  const output = [];
  const presenter = new ShowChapterPresenter((model) => output.push(model));
  const controller = new ShowChapterController(
    new ShowChapterInteractor(new StaticChapterRepository(), presenter),
  );
  return { controller, output };
};

test('exactly four swimming scenes after the Hello interlude', () => {
  assert.deepEqual(portfolioChapters.map(({ id }) => id), ['about', 'projects', 'shark', 'experience']);
  assert.equal(new Set(portfolioChapters.map(({ id }) => id)).size, 4);
});

test('all artwork references point to the supplied SVGs', () => {
  for (const scene of portfolioChapters) {
    assert.match(scene.image, /^\/fish\/[a-z-]+\.svg$/);
    const file = resolve(root, 'public', scene.image.slice(1));
    assert.ok(existsSync(file), file);
    assert.match(readFileSync(file, 'utf8'), /<svg\b/);
    assert.ok(scene.fishName && (scene.id === 'shark' || scene.items.length > 0));
  }
});

test('controller -> interactor -> presenter maps clicked fish to dialog content', () => {
  const { controller, output } = pipeline();
  controller.open('projects');
  assert.equal(output.length, 1);
  assert.equal(output[0].title, 'Projects & Experience');
  assert.equal(output[0].items.length, 6);
  assert.ok(!('eyebrow' in output[0]));
  assert.ok(!('subtitle' in output[0]));
});


test('shark and top Contact route through the same use case but show different content', () => {
  const { controller, output } = pipeline();
  controller.open('shark');
  controller.open('contact');
  assert.equal(output[0].id, 'shark');
  assert.equal(output[0].title, 'Arts');
  assert.equal(output[1].title, 'Contact me');
  assert.notDeepEqual(output[0].items, output[1].items);
  assert.equal(portfolioChapters.length, 4);
  assert.equal(portfolioChapters.filter(({ id }) => id === 'contact').length, 0);
});

test('invalid and empty chapter identifiers never open a dialog', () => {
  const { controller, output } = pipeline();
  controller.open('does-not-exist');
  controller.open('   ');
  assert.deepEqual(output, [null, null]);
});

test('narrow read gateway is substitutable with an injected stub', () => {
  const fake = { findById: (id) => ({ ...portfolioChapters[0], id }) };
  let result;
  new ShowChapterInteractor(fake, { present: (output) => { result = output.chapter; } }).execute({ chapterId: 'test' });
  assert.equal(result.id, 'test');
});

test('presenter creates a new view model without mutating source entries', () => {
  const { controller, output } = pipeline();
  controller.open('projects');
  assert.notEqual(output[0].items, portfolioChapters[1].items);
  assert.deepEqual(output[0].items, portfolioChapters[1].items);
});

test('only the requested handwritten titles and navigation appear on the main canvas', () => {
  const hero = readFileSync(resolve(root, 'view/Hero.tsx'), 'utf8');
  const section = readFileSync(resolve(root, 'view/ChapterSection.tsx'), 'utf8');
  const journey = readFileSync(resolve(root, 'view/OceanJourney.tsx'), 'utf8');
  const jsx = [hero, section, journey].join('\n');
  assert.match(hero, /<h1 className="hero__handwritten-name">Ruoshui Deng<\/h1>/);
  assert.match(hero, /Scroll to view my work/);
  assert.match(hero, /hero__contact-brush/);
  assert.match(section, /chapter.id === 'about'/);
  assert.match(section, /chapter.id === 'projects'/);
  assert.match(journey, /className="hello-section"/);
  assert.match(journey, /onOpenChapter\('contact'\)/);
  for (const pattern of [/<header\b/, /<footer\b/, /<nav\b/, /<p\b/, /DISCOVER/, /SCROLL TO DIVE/]) {
    assert.ok(!pattern.test(jsx), `${pattern} should not appear on the canvas`);
  }
});

test('inner source files never depend on outer layers', () => {
  const disallowed = [
    ['entity/Chapter.ts', ['react', 'next', 'use_case/', 'data_access/', 'interface_adapter/', 'view/', 'app/']],
    ['use_case/showChapter.ts', ['react', 'next', 'data_access/', 'interface_adapter/', 'view/', 'app/']],
    ['data_access/StaticChapterRepository.ts', ['react', 'next', 'interface_adapter/', 'view/', 'app/']],
    ['interface_adapter/ShowChapterController.ts', ['react', 'next', 'data_access/', 'view/', 'app/']],
    ['interface_adapter/ShowChapterPresenter.ts', ['react', 'next', 'data_access/', 'view/', 'app/']],
  ];
  for (const [filename, forbidden] of disallowed) {
    const text = readFileSync(resolve(root, filename), 'utf8');
    for (const dependency of forbidden) {
      assert.ok(!text.includes(`from '../${dependency}`) && !text.includes(`from '${dependency}`), `${filename}: ${dependency}`);
    }
  }
});
