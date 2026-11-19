import type { ShowChapterOutputBoundary, ShowChapterOutputData } from '../use_case/showChapter';
import type { ChapterViewModel } from './ChapterViewModel';

/** Maps use-case output to a view model; knows nothing about React or the DOM. */
export class ShowChapterPresenter implements ShowChapterOutputBoundary {
  private readonly display: (model: ChapterViewModel | null) => void;

  constructor(display: (model: ChapterViewModel | null) => void) {
    this.display = display;
  }

  present(output: ShowChapterOutputData): void {
    const chapter = output.chapter;
    this.display(chapter ? {
      id: chapter.id,
      title: chapter.title,
      items: chapter.items.map(({ title, text }) => ({ title, text })),
    } : null);
  }
}
