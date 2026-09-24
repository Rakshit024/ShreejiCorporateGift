import { COMPANY } from '../../data/company';
import styles from './AnnouncementBar.module.css';

export function AnnouncementBar() {
  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <span>{COMPANY.announcement}</span>
      <span className={styles.phone}>
        {COMPANY.phone} · WhatsApp Orders
      </span>
    </div>
  );
}
