'use client';

import { useEffect, useRef } from 'react';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';

export interface ChapterDialogProps {
  chapter: ChapterViewModel | null;
  onClose: () => void;
}

export default function ChapterDialog({ chapter, onClose }: ChapterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (chapter && !dialog.open) dialog.showModal();
    if (!chapter && dialog.open) dialog.close();
  }, [chapter]);

  return (
    <dialog
      className="detail-dialog"
      ref={dialogRef}
      aria-labelledby="detail-title"
      aria-describedby="detail-intro"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      {chapter && (
        <div className="detail-dialog__content">
          <button type="button" className="detail-dialog__close" onClick={onClose} aria-label="Close information panel">×</button>
          <div className="detail-dialog__header">
            <p className="detail-dialog__eyebrow">{chapter.eyebrow}</p>
            <h2 id="detail-title">{chapter.title}</h2>
            <p className="detail-dialog__species">{chapter.fishName}</p>
            <p className="detail-dialog__intro" id="detail-intro">{chapter.intro}</p>
          </div>
          <div className="detail-dialog__items">
            {chapter.items.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="detail-dialog__links">
            {chapter.id === 'contact'
              ? <a href="mailto:ruoshui.deng@mail.utoronto.ca">SEND AN EMAIL <span aria-hidden="true">↗</span></a>
              : <a href="https://github.com/TropicalFish041" target="_blank" rel="noopener noreferrer">VIEW GITHUB <span aria-hidden="true">↗</span></a>
            }
          </div>
        </div>
      )}
    </dialog>
  );
}
