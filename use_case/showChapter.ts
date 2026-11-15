import type { Chapter } from '../entity/Chapter';

export interface ShowChapterInputData {
  readonly chapterId: string;
}

export interface ShowChapterOutputData {
  readonly chapter: Chapter | null;
}

/** Narrow port owned by this use case, not by the data access layer. */
export interface ChapterReadGateway {
  findById(id: string): Chapter | null;
}

export interface ShowChapterInputBoundary {
  execute(input: ShowChapterInputData): void;
}

export interface ShowChapterOutputBoundary {
  present(output: ShowChapterOutputData): void;
}

/** Application-specific selection rule: unknown / empty IDs do not open a panel. */
export class ShowChapterInteractor implements ShowChapterInputBoundary {
  private readonly chapters: ChapterReadGateway;
  private readonly output: ShowChapterOutputBoundary;

  constructor(chapters: ChapterReadGateway, output: ShowChapterOutputBoundary) {
    this.chapters = chapters;
    this.output = output;
  }

  execute(input: ShowChapterInputData): void {
    const id = input.chapterId.trim();
    const chapter = id ? this.chapters.findById(id) : null;
    this.output.present({ chapter });
  }
}
