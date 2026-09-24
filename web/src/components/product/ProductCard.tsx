import { motion } from 'framer-motion';
import { Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { formatPriceFrom } from '../../utils/formatCurrency';
import { useFavorites } from '../../context/FavoritesContext';
import { useQuoteCart } from '../../context/QuoteCartContext';
import { Badge } from '../common/Badge';
import { Button, ButtonLink } from '../common/Button';
import { ProductImage } from './ProductImage';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, index = 0, onQuickView }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useQuoteCart();
  const fav = isFavorite(product.id);

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
    >
      <div className={styles.media}>
        <div className={styles.badges}>
          {product.customizable && <Badge variant="gold">Custom Branding</Badge>}
          {product.bulkPricing && <Badge variant="navy">Bulk Pricing</Badge>}
        </div>
        <Button
          variant="ghost"
          iconOnly
          className={styles.fav}
          aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={fav}
          onClick={() => toggleFavorite(product.id)}
        >
          <Heart size={18} fill={fav ? 'var(--color-gold)' : 'none'} stroke={fav ? 'var(--color-gold)' : 'currentColor'} />
        </Button>
        <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}>
          <ProductImage src={product.image} alt={product.name} />
        </Link>
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.title}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className={styles.desc}>{product.shortDescription}</p>
        <p className={styles.price}>{formatPriceFrom(product.priceFrom, product.currency)}</p>
        <div className={styles.actions}>
          {onQuickView && (
            <Button variant="outline" size="sm" onClick={() => onQuickView(product)}>
              <Eye size={16} /> Quick View
            </Button>
          )}
          <ButtonLink
            to={`/products/${product.id}`}
            variant="outline"
            size="sm"
            fullWidth
            style={{ flex: 1 }}
          >
            View Details
          </ButtonLink>
          <Button
            variant="gold"
            size="sm"
            disabled={!product.available}
            fullWidth
            onClick={() =>
              addItem({ productId: product.id, quantity: 1 })
            }
          >
            {product.available ? 'Add to Quote' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
