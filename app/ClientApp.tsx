'use client';

import { useMemo, useState } from 'react';
import { StaticChapterRepository, portfolioChapters } from '../data_access/StaticChapterRepository';
import { ShowChapterInteractor } from '../use_case/showChapter';
import { ShowChapterController } from '../interface_adapter/ShowChapterController';
import { ShowChapterPresenter } from '../interface_adapter/ShowChapterPresenter';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';
import OceanJourney from '../view/OceanJourney';

/** Composition root: the only place that wires concrete adapters to the use case. */
export default function ClientApp() {
  const [activeChapter, setActiveChapter] = useState<ChapterViewModel | null>(null);

  const controller = useMemo(() => {
    // Default repository includes five fish scenes AND a separate Contact entry.
    const repository = new StaticChapterRepository();
    const presenter = new ShowChapterPresenter(setActiveChapter);
    const interactor = new ShowChapterInteractor(repository, presenter);
    return new ShowChapterController(interactor);
  }, []);

  return (
    <OceanJourney
      chapters={portfolioChapters}
      activeChapter={activeChapter}
      onOpenChapter={(chapterId) => controller.open(chapterId)}
      onCloseChapter={() => setActiveChapter(null)}
    />
  );
}
