import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = (props: InputProps) => {
  const { label, error, helperText, leftIcon, rightIcon, className, id, ...rest } = props;
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {leftIcon && <span className={styles.icon} aria-hidden="true">{leftIcon}</span>}
        <input
          id={inputId}
          className={classNames(styles.input, error && styles.error, rightIcon && styles.hasRightIcon, className ?? '')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={classNames(errorId, helperId)}
          {...rest}
        />
        {rightIcon && <span className={styles.icon} aria-hidden="true">{rightIcon}</span>}
      </div>
      {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className={styles.helperText}>{helperText}</p>}
    </div>
  );
};

function classNames(...parts: Array<string | false | 0 | 0n | null | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ');
}