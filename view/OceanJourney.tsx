'use client';

import type { Chapter } from '../entity/Chapter';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';
import Hero from './Hero';
import ChapterSection from './ChapterSection';
import ChapterDialog from './ChapterDialog';
import BackgroundMusic from './BackgroundMusic';
import EntryGate from './EntryGate';
import UnderwaterRipples from './UnderwaterRipples';

interface Props {
  chapters: readonly Chapter[];
  activeChapter: ChapterViewModel | null;
  onOpenChapter: (id: string) => void;
  onCloseChapter: () => void;
}

/** Presentation only: original hero, a short greeting, then four swimming scenes. */
export default function OceanJourney({ chapters, activeChapter, onOpenChapter, onCloseChapter }: Props) {
  return (
    <>
      <BackgroundMusic />
      <EntryGate />
      <main className="ocean-world" aria-label="Underwater portfolio">
        <UnderwaterRipples />
        <Hero onContact={() => onOpenChapter('contact')} />
        <section className="hello-section" id="hello" aria-label="Introduction">
          <span>Hello</span>
        </section>
        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={index} onOpen={onOpenChapter} />
        ))}
      </main>
      <ChapterDialog chapter={activeChapter} onClose={onCloseChapter} />
    </>
  );
}
