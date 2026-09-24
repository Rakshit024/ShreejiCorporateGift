import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COMPANY } from '../../data/company';
import { products } from '../../data/products';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { openWhatsApp, generateGeneralEnquiryMessage } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../common/Button';
import styles from './HomeSections.module.css';

const heroImages = products.filter((product) => product.featured).slice(0, 4);
const AUTOPLAY_DELAY = 4500;

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const imageCount = heroImages.length;
  const activeProduct = imageCount ? heroImages[activeIndex % imageCount] : undefined;
  const slideshowPaused = isPaused || prefersReducedMotion;

  useEffect(() => {
    if (isPaused || prefersReducedMotion || imageCount < 2) return;

    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % imageCount);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [imageCount, isPaused, prefersReducedMotion]);

  const changeSlide = (nextDirection: -1 | 1) => {
    if (imageCount < 2) return;
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + imageCount) % imageCount);
  };

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
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured corporate gifts"
          >
            <div className={styles.heroStage}>
              {activeProduct && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeProduct.id}
                    className={styles.heroImage}
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    loading="eager"
                    initial={{ opacity: 0, x: direction * 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -48 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              )}
              {activeProduct && (
                <div className={styles.heroImageInfo} aria-live="polite">
                  <span>Featured collection</span>
                  <strong>{activeProduct.name}</strong>
                  <small>Corporate gifting, made memorable</small>
                </div>
              )}
            </div>

            <div className={styles.heroControls}>
              <button
                type="button"
                className={styles.heroControl}
                aria-label="Show previous featured product"
                disabled={imageCount < 2}
                onClick={() => changeSlide(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className={styles.heroDots} role="group" aria-label="Choose featured product">
                {heroImages.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`${styles.heroDot} ${
                      index === (activeIndex % imageCount) ? styles.heroDotActive : ''
                    }`}
                    aria-label={`Show ${product.name}`}
                    aria-pressed={index === (activeIndex % imageCount)}
                    onClick={() => {
                      setDirection(index > activeIndex ? 1 : -1);
                      setActiveIndex(index);
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.heroControl}
                aria-label={
                  prefersReducedMotion
                    ? 'Automatic slideshow disabled by reduced motion preference'
                    : isPaused
                      ? 'Resume featured product slideshow'
                      : 'Pause featured product slideshow'
                }
                aria-pressed={slideshowPaused}
                disabled={prefersReducedMotion || imageCount < 2}
                onClick={() => setIsPaused((paused) => !paused)}
              >
                {slideshowPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                type="button"
                className={styles.heroControl}
                aria-label="Show next featured product"
                disabled={imageCount < 2}
                onClick={() => changeSlide(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
