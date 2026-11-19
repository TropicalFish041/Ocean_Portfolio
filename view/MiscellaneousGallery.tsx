import content from '../data/miscellaneous.json';
import styles from './MiscellaneousGallery.module.css';

/** Edit data/miscellaneous.json and the two JPEG files to update this section. */
export default function MiscellaneousGallery() {
  return (
    <div className={styles.gallery}>
      <p className={styles.introduction}>{content.introduction}</p>
      <div className={styles.images}>
        {content.images.map(image => (
          <a key={image.src} href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${image.alt}`}>
            <img src={image.src} alt={image.alt} loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}
