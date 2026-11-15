'use client';

import type { Chapter } from '../entity/Chapter';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';
import Hero from './Hero';
import ChapterSection from './ChapterSection';
import ChapterDialog from './ChapterDialog';

interface Props {
  chapters: readonly Chapter[];
  activeChapter: ChapterViewModel | null;
  onOpenChapter: (id: string) => void;
  onCloseChapter: () => void;
}

/** Presentation composes the hero, chapter scenes, and the existing detail dialog. */
export default function OceanJourney({ chapters, activeChapter, onOpenChapter, onCloseChapter }: Props) {
  return (
    <>
      <main className="ocean-world" aria-label="Underwater portfolio">
        <Hero onContact={() => onOpenChapter('contact')} />
        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={index} onOpen={onOpenChapter} />
        ))}
      </main>
      <ChapterDialog chapter={activeChapter} onClose={onCloseChapter} />
    </>
  );
}
