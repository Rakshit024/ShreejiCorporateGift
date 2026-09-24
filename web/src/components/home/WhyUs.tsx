import {
  MessageCircle,
  Package,
  Printer,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';
import styles from './HomeSections.module.css';

const reasons = [
  {
    icon: ShoppingCart,
    title: 'Bulk orders',
    text: 'Designed for volume corporate gifting with quantity-wise pricing on selected products.',
  },
  {
    icon: Printer,
    title: 'Custom logo printing',
    text: 'Branding services across mugs, bottles, apparel, pens, diaries and more.',
  },
  {
    icon: Users,
    title: 'Corporate gifting',
    text: 'Products and hampers suited for clients, employees and business occasions.',
  },
  {
    icon: Package,
    title: 'Product variety',
    text: 'Drinkware, stationery, bags, tech gifts, gift sets and hampers in one catalog.',
  },
  {
    icon: Sparkles,
    title: 'Quote-based ordering',
    text: 'No checkout — request quotations tailored to your quantity and branding.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp enquiries',
    text: 'Fast enquiries on WhatsApp with product and quantity details pre-filled.',
  },
];

export function WhyUs() {
  return (
    <section className="section" id="why-us" tabIndex={-1}>
      <div className="container">
        <h2 className="section-title">Why Choose Corporate Gifting with Shreeji</h2>
        <p className="section-subtitle">
          Professional B2B catalog experience — discover, quote and enquire without unsupported claims.
        </p>
        <div className={styles.whyGrid}>
          {reasons.map(({ icon: Icon, title, text }) => (
            <article key={title} className={styles.whyCard}>
              <div className={styles.iconWrap}>
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
