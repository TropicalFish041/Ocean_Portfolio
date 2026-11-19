'use client';

import { useEffect, useRef, useState } from 'react';
import gallery from '../data/artworks.json';
import styles from './ArtTimeline.module.css';

type Preview = { src: string; title: string };

function ArtworkImage({ src, originalSrc, title, id, warning, onZoom }: Preview & {
  id: string; originalSrc?: string; warning?: string; onZoom: (source: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [source, setSource] = useState(src);
  if (warning && !revealed) return (
    <button className={styles.warningGate} type="button" onClick={() => setRevealed(true)}
      aria-label={`Reveal ${title}: ${warning}`}>
      <strong>Content Warning: Graphic Violence &amp; Gore</strong>
      <span>Click to View</span>
    </button>
  );
  return failed ? (
    <div className={styles.imageFallback}>
      <span>Image could not be displayed.</span>
      <button type="button" onClick={() => { setRetry(value => value + 1); setSource(src); setFailed(false); }}>Retry image</button>
      <a href={originalSrc ?? src} target="_blank" rel="noopener noreferrer">Open original file</a>
    </div>
  ) : (
    <button className={styles.imageButton} type="button" onClick={() => onZoom(source)}
      aria-label={`Enlarge ${title}`}>
      <img className={styles.media} src={retry ? `${source}?retry=${retry}` : source}
        alt={title} loading={id === 'image-08' ? 'eager' : 'lazy'}
        decoding="async" onError={() => {
          if (originalSrc && source !== originalSrc) setSource(originalSrc);
          else setFailed(true);
        }} />
    </button>
  );
}

/** Add, remove or reorder works in data/artworks.json; no component edits needed. */
export default function ArtTimeline() {
  const years = [...new Set(gallery.works.map(work => work.year))].sort((a, b) => b - a);
  const [preview, setPreview] = useState<Preview | null>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = previewDialog.current;
    if (!dialog) return;
    if (preview && !dialog.open) dialog.showModal();
    if (!preview && dialog.open) dialog.close();
  }, [preview]);

  // Unmounting Arts also stops its videos, e.g. when the dialog closes.
  useEffect(() => () => {
    document.querySelectorAll<HTMLVideoElement>('video[data-art-video]')
      .forEach(video => video.pause());
    window.dispatchEvent(new Event('ocean:gallery-closed'));
  }, []);

  const onVideoPlay = (current: HTMLVideoElement) => {
    // Keep a single work's audio playing at a time.
    document.querySelectorAll<HTMLVideoElement>('video[data-art-video]')
      .forEach(video => { if (video !== current && !video.paused) video.pause(); });
  };

  return (
    <div className={styles.timeline}>
      <p className={styles.introduction}>{gallery.introduction}</p>
      {gallery.links?.length > 0 && (
        <p className={styles.archiveLinks}>
          {gallery.links.map((link, index) => (
            <span key={link.href}>
              {index > 0 && ' · '}
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            </span>
          ))}
        </p>
      )}
      {years.map(year => (
        <section className={styles.year} key={year} aria-labelledby={`art-year-${year}`}>
          <h3 className={styles.yearTitle} id={`art-year-${year}`}>{year}</h3>
          <div className={styles.grid}>
            {gallery.works.filter(work => work.year === year).map(work => (
              <figure className={styles.work} key={work.id}>
                {work.type === 'video' ? (
                  <video className={styles.media} controls playsInline preload="none"
                    data-art-video="true" onPlay={event => onVideoPlay(event.currentTarget)}
                    aria-label={work.title} poster={'poster' in work ? work.poster : undefined}
                    src={work.src}>
                    Your browser does not support MP4 video.
                  </video>
                ) : (
                  <ArtworkImage id={work.id} src={work.src} title={work.title}
                    originalSrc={'originalSrc' in work ? work.originalSrc : undefined}
                    warning={'contentWarning' in work && typeof work.contentWarning === 'string' ? work.contentWarning : undefined}
                    onZoom={source => setPreview({ src: source, title: work.title })} />
                )}
                <figcaption className={styles.caption}>
                  <span className={styles.workTitle}>{work.title}</span>
                  <time dateTime={String(work.year)} className={styles.date}>{work.date}</time>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
      <dialog ref={previewDialog} className={styles.zoomDialog}
        aria-label={preview ? `Enlarged artwork: ${preview.title}` : 'Artwork preview'}
        onCancel={event => { event.preventDefault(); setPreview(null); }}
        onClose={() => setPreview(null)}
        onClick={event => { if (event.target === event.currentTarget) setPreview(null); }}>
        <button className={styles.zoomClose} type="button" onClick={() => setPreview(null)}
          aria-label="Close enlarged artwork">×</button>
        {preview && <img className={styles.zoomImage} src={preview.src} alt={preview.title} />}
      </dialog>
    </div>
  );
}
