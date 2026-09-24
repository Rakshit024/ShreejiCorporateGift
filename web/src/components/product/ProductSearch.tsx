import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import styles from './ProductSearch.module.css';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  id?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'id' | 'className' | 'type'>;
}

export function ProductSearch({
  value,
  onChange,
  placeholder = 'Search products, categories, tags…',
  compact,
  id = 'product-search',
  inputProps,
}: ProductSearchProps) {
  return (
    <div className={`${styles.search} ${compact ? styles.compact : ''}`}>
      <Search className={styles.icon} size={18} aria-hidden />
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        {...inputProps}
      />
    </div>
  );
}
