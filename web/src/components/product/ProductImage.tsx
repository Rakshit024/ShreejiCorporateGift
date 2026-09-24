import styles from './ProductImage.module.css';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ProductImage({ src, alt, className = '', priority = false }: ProductImageProps) {
  return (
    <div className={`${styles.wrap} ${className}`}>
      <img
        className={styles.img}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}
