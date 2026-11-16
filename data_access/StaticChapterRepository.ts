import records from '../data/chapters.json' with { type: 'json' };
import contact from '../data/contact.json' with { type: 'json' };
import type { Chapter } from '../entity/Chapter';
import type { ChapterReadGateway } from '../use_case/showChapter';

/** Five fish scenes. Contact is a distinct, non-rendered chapter. */
export const portfolioChapters: readonly Chapter[] = records;
export const contactChapter: Chapter = contact;

/** Static data adapter; no API, persistence, or browser-specific code. */
export class StaticChapterRepository implements ChapterReadGateway {
  private readonly chapters: readonly Chapter[];

  constructor(chapters: readonly Chapter[] = [...portfolioChapters, contactChapter]) {
    this.chapters = chapters;
  }

  findById(id: string): Chapter | null {
    return this.chapters.find((chapter) => chapter.id === id) ?? null;
  }
}
