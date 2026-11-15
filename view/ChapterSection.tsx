import type { Chapter } from '../entity/Chapter';

export interface ChapterSectionProps {
  chapter: Chapter;
  index: number;
  total: number;
  onOpen: (chapterId: string) => void;
}

export default function ChapterSection({ chapter, index, total, onOpen }: ChapterSectionProps) {
  const alternate = index % 2 === 1;
  return (
    <section
      className={`chapter-section ${alternate ? 'chapter-section--reversed' : ''} chapter-section--${chapter.id}`}
      id={chapter.id}
      aria-labelledby={`title-${chapter.id}`}
    >
      <div className="chapter-content">
        <div className="chapter-text">
          <p className="chapter-eyebrow">{chapter.eyebrow}</p>
          <h2 id={`title-${chapter.id}`}>{chapter.title}</h2>
          <p className="chapter-subtitle">{chapter.subtitle}</p>
          <span className="chapter-rule" aria-hidden="true" />
          <p className="chapter-intro">{chapter.intro}</p>
          <p className="chapter-action">CLICK THE FISH TO EXPLORE <span aria-hidden="true">↗</span></p>
        </div>
        <button
          type="button"
          className="fish-button"
          onClick={() => onOpen(chapter.id)}
          aria-label={`Open ${chapter.title}: ${chapter.fishName}`}
          title={`Discover ${chapter.title}`}
        >
          <span className="fish-button__halo" aria-hidden="true" />
          <span className="fish-button__float">
            {/* Transparency is preserved. No masking or image replacement. */}
            <img className="fish-button__image" src={chapter.image} alt={chapter.imageDescription} loading="lazy" draggable={false} />
          </span>
          <span className="fish-button__hint" aria-hidden="true">DISCOVER <span>↗</span></span>
        </button>
      </div>
      <div className="chapter-footer" aria-hidden="true">
        <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <span>THE OCEAN IS DEEPER THAN IT SEEMS</span>
      </div>
    </section>
  );
}
