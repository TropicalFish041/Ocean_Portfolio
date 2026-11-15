import type {
  ShowChapterOutputBoundary,
  ShowChapterOutputData,
} from '../use_case/showChapter';
import type { ChapterViewModel } from './ChapterViewModel';

/** Formats use-case output for presentation, with no React or DOM dependency. */
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
      eyebrow: chapter.eyebrow,
      intro: chapter.intro,
      fishName: chapter.fishName,
      items: chapter.items.map(({ title, text }) => ({ title, text })),
    } : null);
  }
}
