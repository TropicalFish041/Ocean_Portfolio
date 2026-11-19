import gallery from '../data/artworks.json';
import styles from './ArtTimeline.module.css';

/** Add, remove or reorder works in data/artworks.json; no component edits needed. */
export default function ArtTimeline() {
  const years = [...new Set(gallery.works.map(work => work.year))].sort((a, b) => b - a);

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
                    aria-label={work.title} src={work.src}>
                    Your browser does not support MP4 video.
                  </video>
                ) : (
                  <img className={styles.media} src={work.src} alt={work.title} loading="lazy" />
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
    </div>
  );
}
