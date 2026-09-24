import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { COMPANY } from '../../data/company';
import { products } from '../../data/products';
import { openWhatsApp, generateGeneralEnquiryMessage } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../common/Button';
import styles from './HomeSections.module.css';

const heroImages = products.filter((p) => p.featured).slice(0, 4);

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Premium Corporate Gifts for Every Business Occasion</h1>
            <p className={styles.heroLead}>
              Corporate gifting made simple — discover branded products, bulk gifting options and
              custom solutions for teams, clients and business occasions.
            </p>
            <p className={styles.heroSub}>
              Custom Gifts · Branded Products · Corporate Hampers
              <br />
              {COMPANY.heroSupporting}
            </p>
            <div className={styles.heroCtas}>
              <ButtonLink to="/products" variant="primary" size="lg">
                Explore Products
              </ButtonLink>
              <ButtonLink to="/quote" variant="gold" size="lg">
                Get Bulk Quote
              </ButtonLink>
              <Button
                variant="whatsapp"
                size="lg"
                onClick={() => openWhatsApp(generateGeneralEnquiryMessage())}
              >
                <MessageCircle size={18} /> WhatsApp Us
              </Button>
            </div>
          </motion.div>
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className={styles.heroProducts}>
              {heroImages.map((p) => (
                <img key={p.id} src={p.image} alt={p.name} loading="eager" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
