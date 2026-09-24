import { Layers, Palette, Truck } from 'lucide-react';
import styles from './HomeSections.module.css';

const items = [
  {
    icon: Layers,
    title: 'Bulk orders & variety',
    text: 'Quantity-wise pricing where configured, plus a growing product catalog.',
  },
  {
    icon: Palette,
    title: 'Custom logo printing',
    text: 'Mug, bottle, pen, diary and corporate logo branding services.',
  },
  {
    icon: Truck,
    title: 'Quote-based B2B ordering',
    text: 'Build a quote cart and enquire on WhatsApp — built for business buyers.',
  },
];

export function TrustBar() {
  return (
    <section className={styles.trust}>
      <div className="container">
        <div className={styles.trustGrid}>
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.trustItem}>
              <div className={styles.iconWrap}>
                <Icon size={22} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
