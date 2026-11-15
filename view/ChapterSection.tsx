'use client';

import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import type { Chapter } from '../entity/Chapter';

interface Props {
  chapter: Chapter;
  index: number;
  onOpen: (chapterId: string) => void;
}

/** The artwork itself is the interactive surface. Text is available to assistive technology only. */
export default function ChapterSection({ chapter, index, onOpen }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const pixelsRef = useRef<ImageData | null>(null);

  // Pixel-accurate pointer hit testing prevents transparent portions of a PNG from opening the panel.
  // Keyboard activation always works, even when the browser does not expose canvas pixel data.
  useEffect(() => {
    let cancelled = false;
    const image = imageRef.current;
    if (!image) return;
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
  }, [chapter.image]);

  const openIfPainted = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) { onOpen(chapter.id); return; } // Enter / Space
    const image = imageRef.current;
    const pixels = pixelsRef.current;
    if (!image || !pixels) { onOpen(chapter.id); return; }
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = Math.floor((event.clientX - bounds.left) / bounds.width * pixels.width);
    const y = Math.floor((event.clientY - bounds.top) / bounds.height * pixels.height);
    if (x >= 0 && y >= 0 && x < pixels.width && y < pixels.height
      && pixels.data[(y * pixels.width + x) * 4 + 3] > 28) onOpen(chapter.id);
  };

  return (
    <section className={`chapter-section chapter-section--${chapter.id} ${index % 2 ? 'chapter-section--alternate' : ''}`} id={chapter.id} aria-label={chapter.fishName}>
      <button className="fish-button" type="button" onClick={openIfPainted} aria-label={`Open ${chapter.title} via ${chapter.fishName}`}>
        <img ref={imageRef} className="fish-button__image" src={chapter.image} alt="" draggable={false} loading={index === 0 ? 'eager' : 'lazy'} />
      </button>
      {chapter.id === 'about' && (
  <div className="chapter-section__label" aria-hidden="true">
    <span>About Me</span>

    <span className="chapter-section__explore">
      <span>Click to explore</span>

      <svg viewBox="0 0 44 24" fill="none" aria-hidden="true">
        <path
          d="M40 12H4M14 3L4 12L14 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </div>
)}
      {chapter.id === 'projects' && <span className="chapter-section__label" aria-hidden="true">Experience</span>}
    </section>
  );
}
