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
const setup = () => {
  const received = [];
  const presenter = new ShowChapterPresenter((model) => received.push(model));
  const interactor = new ShowChapterInteractor(new StaticChapterRepository(), presenter);
  const controller = new ShowChapterController(interactor);
  return { controller, received };
};

test('all five chapters exist in the expected underwater order', () => {
  assert.deepEqual(portfolioChapters.map((chapter) => chapter.id), ['about', 'projects', 'skills', 'experience', 'contact']);
  assert.equal(new Set(portfolioChapters.map((chapter) => chapter.id)).size, 5);
});

test('each chapter points to an included transparent PNG', () => {
  for (const chapter of portfolioChapters) {
    assert.ok(chapter.image.startsWith('/fish/'));
    const filename = resolve(root, 'public', chapter.image.slice(1));
    assert.ok(existsSync(filename), filename);
    const signature = readFileSync(filename).subarray(0, 8).toString('hex');
    assert.equal(signature, '89504e470d0a1a0a');
    assert.ok(chapter.title && chapter.imageDescription && chapter.items.length > 0);
  }
});

test('view -> controller -> interactor -> presenter produces the requested view model', () => {
  const { controller, received } = setup();
  controller.open('projects');
  assert.equal(received.length, 1);
  assert.equal(received[0].title, 'Selected Projects');
  assert.equal(received[0].items.length, 3);
  assert.equal(received[0].fishName, 'Lionfish');
});

test('unknown or whitespace-only IDs safely produce no selected chapter', () => {
  const { controller, received } = setup();
  controller.open('missing');
  controller.open('   ');
  assert.deepEqual(received, [null, null]);
});

test('repository only exposes the narrow findById port and handles unknown IDs', () => {
  const repository = new StaticChapterRepository();
  assert.equal(repository.findById('about')?.title, 'About Me');
  assert.equal(repository.findById('not-a-chapter'), null);
});

test('presenter passes new plain view models instead of mutable source objects', () => {
  const { controller, received } = setup();
  controller.open('skills');
  assert.notEqual(received[0].items, portfolioChapters[2].items);
  assert.deepEqual(received[0].items, portfolioChapters[2].items);
});

test('dependency rule: inner layers do not import outer layers', () => {
  const rules = [
    { path: 'entity/Chapter.ts', forbidden: ['react', 'next', 'view/', 'app/', 'interface_adapter/', 'data_access/', 'use_case/'] },
    { path: 'use_case/showChapter.ts', forbidden: ['react', 'next', 'view/', 'app/', 'interface_adapter/', 'data_access/'] },
    { path: 'interface_adapter/ShowChapterController.ts', forbidden: ['react', 'next', 'view/', 'app/', 'data_access/'] },
    { path: 'interface_adapter/ShowChapterPresenter.ts', forbidden: ['react', 'next', 'view/', 'app/', 'data_access/'] },
    { path: 'data_access/StaticChapterRepository.ts', forbidden: ['react', 'next', 'view/', 'app/', 'interface_adapter/'] },
  ];
  for (const { path, forbidden } of rules) {
    const source = readFileSync(resolve(root, path), 'utf8');
    for (const outer of forbidden) {
      assert.ok(!source.includes(`from '${outer}`) && !source.includes(`from '../${outer}`), `${path} must not import ${outer}`);
    }
  }
});
