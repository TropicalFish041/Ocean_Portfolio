import records from '../data/chapters.json' with { type: 'json' };
import type { Chapter } from '../entity/Chapter';
import type { ChapterReadGateway } from '../use_case/showChapter';

/** Static data adapter; no API, persistence, or browser-specific code. */
export const portfolioChapters: readonly Chapter[] = records;

export class StaticChapterRepository implements ChapterReadGateway {
  private readonly chapters: readonly Chapter[];

  constructor(chapters: readonly Chapter[] = portfolioChapters) {
    this.chapters = chapters;
  }

  findById(id: string): Chapter | null {
    return this.chapters.find((chapter) => chapter.id === id) ?? null;
  }
}
