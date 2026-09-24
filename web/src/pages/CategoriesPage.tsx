import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageMeta } from '../components/common/PageMeta';
import { CategoryIcon } from '../components/category/CategoryIcon';
import { categories } from '../data/categories';
import { getProductsByCategory } from '../data/products';
import { pageTitle } from '../config/seo';
import styles from '../components/home/HomeSections.module.css';

export function CategoriesPage() {
  return (
    <>
      <PageMeta
        title={pageTitle('Categories')}
        description="Shop corporate gift categories — bottles, mugs, pens, diaries, bags and more."
      />
      <section className="section">
        <div className="container">
          <h1 className="section-title">Categories</h1>
          <p className="section-subtitle">Select a category to browse filtered products.</p>
          <div className={styles.catGrid}>
            {categories.map((cat, i) => {
              const count = getProductsByCategory(cat.id).length;
              const to =
                cat.id === 'corporate-hampers'
                  ? '/hampers'
                  : cat.id === 'custom-printing'
                    ? '/custom-branding'
                    : `/categories/${cat.slug}`;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Link to={to} className={styles.catCard}>
                    <CategoryIcon name={cat.icon} size={26} />
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                    {count > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {count} products
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
