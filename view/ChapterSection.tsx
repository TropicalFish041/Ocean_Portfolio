'use client';

import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { Chapter } from '../entity/Chapter';

interface Props {
  chapter: Chapter;
  index: number;
  onOpen: (chapterId: string) => void;
}

// The supplied swimming GIFs have exactly five transparent frames each.
// Keep animation timing local to the view; no use-case or domain changes needed.
const SWIM: Record<string, { folder: string; frameMs: number }> = {
  about: { folder: 'butterflyfish', frameMs: 180 },
  projects: { folder: 'peppermint-angelfish', frameMs: 180 },
  experience: { folder: 'opah', frameMs: 150 },
  shark: { folder: 'shark', frameMs: 160 },
};

export default function ChapterSection({ chapter, index, onOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pixelsRef = useRef<ImageData | null>(null);
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

  // Preserve pixel-accurate clicking even as the five PNG frames change.
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    let cancelled = false;
    const prepare = () => {
      if (cancelled || !image.naturalWidth || !image.naturalHeight) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        pixelsRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
      } catch { pixelsRef.current = null; }
    };
    if (image.complete) prepare();
    image.addEventListener('load', prepare);
    return () => { cancelled = true; image.removeEventListener('load', prepare); };
  }, []);

  const openIfPainted = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) { onOpen(chapter.id); return; }
    const image = imageRef.current;
    const pixels = pixelsRef.current;
    if (!image || !pixels) { onOpen(chapter.id); return; }
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    // The tall butterflyfish frames are letterboxed by object-fit: contain.
    const scale = Math.min(bounds.width / pixels.width, bounds.height / pixels.height);
    const displayedWidth = pixels.width * scale;
    const displayedHeight = pixels.height * scale;
    const offsetX = (bounds.width - displayedWidth) / 2;
    const offsetY = (bounds.height - displayedHeight) / 2;
    const x = Math.floor((event.clientX - bounds.left - offsetX) / scale);
    const y = Math.floor((event.clientY - bounds.top - offsetY) / scale);
    if (x >= 0 && y >= 0 && x < pixels.width && y < pixels.height
      && pixels.data[(y * pixels.width + x) * 4 + 3] > 28) onOpen(chapter.id);
  };

  const src = animation
    ? `/fish/frames/${animation.folder}/${frame}.png`
    : chapter.image;

  return (
    <section ref={sectionRef}
      className={`chapter-section chapter-section--${chapter.id} ${index % 2 ? 'chapter-section--alternate' : ''}${inView ? ' chapter-section--in-view' : ''}`}
      id={chapter.id} aria-label={chapter.fishName}>
      {chapter.id === 'about' && (
        <img className="coral-reef coral-reef--about" src="/coral/reef-about.png"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      {chapter.id === 'projects' && (
        <img className="coral-reef coral-reef--projects" src="/coral/reef-projects.png"
          alt="" aria-hidden="true" draggable={false} loading="lazy" />
      )}
      <button className="fish-button" type="button" onClick={openIfPainted}
        aria-label={`Open ${chapter.title} via ${chapter.fishName}`}>
        <img ref={imageRef} className="fish-button__image" src={src} alt=""
          draggable={false} loading={index === 0 ? 'eager' : 'lazy'} />
      </button>
      {chapter.id === 'about' && (
        <div className="chapter-section__label" aria-hidden="true">
          <span>About Me</span>
          <span className="chapter-section__explore">
            <span>Click to explore</span>
            <svg viewBox="0 0 44 24" fill="none" aria-hidden="true">
              <path d="M40 12H4M14 3L4 12L14 21" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      )}
      {chapter.id === 'projects' && <span className="chapter-section__label" aria-hidden="true">Experience</span>}
    </section>
  );
}
