'use client';

import { useEffect, useRef, useState } from 'react';
import type { Chapter } from '../entity/Chapter';

interface Props {
  chapter: Chapter;
  index: number;
  onOpen: (chapterId: string) => void;
}

// The swimming artwork uses exactly five numbered SVG frames per fish.
// Keep animation timing local to the view; no use-case or domain changes needed.
const SWIM: Record<string, { folder: string; frameMs: number }> = {
  about: { folder: 'lionfish', frameMs: 180 },
  projects: { folder: 'peppermint-angelfish', frameMs: 180 },
  experience: { folder: 'opah', frameMs: 150 },
  shark: { folder: 'shark', frameMs: 160 },
};

export default function ChapterSection({ chapter, index, onOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [frame, setFrame] = useState(0);
  const animation = SWIM[chapter.id];

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.intersectionRatio >= 0.18);
    }, { threshold: [0, 0.18, 0.5] });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Play only while the fish's section is visible; replay on re-entry.
  useEffect(() => {
    setFrame(0);
    if (!inView || !animation || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFrame(previous => (previous + 1) % 5);
    }, animation.frameMs);
    return () => window.clearInterval(timer);
  }, [inView, animation]);

  // The entire image/button rectangle is clickable, including transparent pixels.
  const src = animation
    ? `/fish/frames/${animation.folder}/${frame}.svg`
    : chapter.image;

  return (
    <section ref={sectionRef}
      className={`chapter-section chapter-section--${chapter.id} ${index % 2 ? 'chapter-section--alternate' : ''}${inView ? ' chapter-section--in-view' : ''}`}
      id={chapter.id} aria-label={chapter.fishName}>
      {chapter.id === 'about' && (
        <img className="coral-reef coral-reef--about" src="/coral/reef-about.svg"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      {chapter.id === 'projects' && (
        <img className="coral-reef coral-reef--projects" src="/coral/reef-projects.svg"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      {chapter.id === 'shark' && (
        <img className="coral-reef coral-reef--shark" src="/coral/reef-shark.svg"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      {chapter.id === 'experience' && (
        <img className="coral-reef kelp-forest--experience" src="/coral/kelp-experience.svg"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      <button className="fish-button" type="button" onClick={() => onOpen(chapter.id)}
        aria-label={`Open ${chapter.title} via ${chapter.fishName}`}>
        <img className="fish-button__image" src={src} alt=""
          draggable={false} loading={index === 0 ? 'eager' : 'lazy'} />
      </button>
      {chapter.id === 'about' && (
        <div className="chapter-section__label" aria-hidden="true">
          <span>About Me</span>
          <span className="chapter-section__explore">
            <span>Click the fish</span>
            <svg viewBox="0 0 44 24" fill="none" aria-hidden="true">
              <path d="M40 12H4M14 3L4 12L14 21" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}
      {chapter.id === 'projects' && <span className="chapter-section__label" aria-hidden="true">Experience</span>}
      {chapter.id === 'shark' && <span className="chapter-section__label" aria-hidden="true">Arts</span>}
      {chapter.id === 'experience' && <span className="chapter-section__label" aria-hidden="true">Miscellaneous</span>}
    </section>
  );
}
