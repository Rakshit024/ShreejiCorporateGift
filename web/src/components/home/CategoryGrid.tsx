import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { CategoryIcon } from '../category/CategoryIcon';
import styles from './HomeSections.module.css';

export function CategoryGrid() {
  const display = categories.filter(
    (c) => c.id !== 'custom-printing' && c.id !== 'corporate-hampers',
  );

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">
          Browse promotional products by category — filter the catalog instantly.
        </p>
        <div className={styles.catGrid}>
          {display.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <Link to={`/categories/${cat.slug}`} className={styles.catCard}>
                <CategoryIcon name={cat.icon} size={26} />
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/categories">View all categories →</Link>
        </div>
      </div>
    </section>
  );
}
