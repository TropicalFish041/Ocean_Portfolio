import type { ShowChapterInputBoundary } from '../use_case/showChapter';

/** Converts the view's click into use-case input. No React or data-access dependency. */
export class ShowChapterController {
  private readonly showChapter: ShowChapterInputBoundary;

  constructor(showChapter: ShowChapterInputBoundary) {
    this.showChapter = showChapter;
  }

  open(chapterId: string): void {
    this.showChapter.execute({ chapterId });
  }
}
