import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, helperText, options, placeholder, className, id, ...rest }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
      <div className={styles.selectWrap}>
        <select
          id={selectId}
          className={classNames(styles.select, error && styles.error, className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={classNames(errorId, helperId)}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className={styles.helperText}>{helperText}</p>}
    </div>
  );
}

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}