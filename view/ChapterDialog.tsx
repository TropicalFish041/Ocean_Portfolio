'use client';

import { useEffect, useRef } from 'react';
import type { ChapterViewModel } from '../interface_adapter/ChapterViewModel';

interface Props {
  chapter: ChapterViewModel | null;
  onClose: () => void;
}

/** A single accessible dialog contains all visible text on the site. */
export default function ChapterDialog({ chapter, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (chapter && !dialog.open) dialog.showModal();
    if (!chapter && dialog.open) dialog.close();
  }, [chapter]);

  return (
    <dialog ref={ref} className="detail-dialog" aria-labelledby="detail-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      {chapter && (
        <div className="detail-dialog__content">
          <button className="detail-dialog__close" type="button" onClick={onClose} aria-label="Close information">×</button>
          <h2 id="detail-title">{chapter.title}</h2>
          {chapter.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      )}
    </dialog>
  );
}
