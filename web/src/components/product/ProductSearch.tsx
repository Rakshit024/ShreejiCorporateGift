import { Search } from 'lucide-react';
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react';
import styles from './ProductSearch.module.css';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  submitLabel?: ReactNode;
  showSubmit?: boolean;
  placeholder?: string;
  compact?: boolean;
  id?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'id' | 'className' | 'type'>;
}

export function ProductSearch({
  value,
  onChange,
  onSubmit,
  submitLabel = 'Search',
  showSubmit = false,
  placeholder = 'Search products, categories, tags…',
  compact,
  id = 'product-search',
  inputProps,
}: ProductSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      className={`${styles.search} ${compact ? styles.compact : ''} ${showSubmit ? styles.withButton : ''}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <Search className={styles.icon} size={18} aria-hidden />
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        {...inputProps}
      />
      {showSubmit && (
        <button type="submit" className={styles.submitButton}>
          <Search size={16} aria-hidden />
          <span>{submitLabel}</span>
        </button>
      )}
    </form>
  );
}
