'use client';

import type { Chapter } from '../entity/Chapter';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';
import Hero from './Hero';
import ChapterSection from './ChapterSection';
import ChapterDialog from './ChapterDialog';

export interface OceanJourneyProps {
  chapters: readonly Chapter[];
  activeChapter: ChapterViewModel | null;
  onOpenChapter: (id: string) => void;
  onCloseChapter: () => void;
}

export default function OceanJourney({ chapters, activeChapter, onOpenChapter, onCloseChapter }: OceanJourneyProps) {
  return (
    <>
      <header className="site-header">
        <a className="site-brand" href="#surface" aria-label="Ruoshui Deng — return to surface">R<span aria-hidden="true">✳</span>D</a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#about">ABOUT</a>
          <a href="#projects">PROJECTS</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>
      <main className="ocean-world">
        <Hero />
        {chapters.map((chapter, index) => (
          <ChapterSection key={chapter.id} chapter={chapter} index={index} total={chapters.length} onOpen={onOpenChapter} />
        ))}
        <footer className="ocean-footer">
          <span>© {new Date().getFullYear()} RUOSHUI DENG</span>
          <a href="#surface">BACK TO THE SURFACE ↑</a>
        </footer>
      </main>
      <ChapterDialog chapter={activeChapter} onClose={onCloseChapter} />
    </>
  );
}
