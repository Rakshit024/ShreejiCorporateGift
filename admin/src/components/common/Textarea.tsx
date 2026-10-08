import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = (props: TextareaProps) => {
  const { label, error, helperText, className, id, ...rest } = props;
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;

  return (
    <div className={styles.wrapper}>
      {label && <label htmlFor={textareaId} className={styles.label}>{label}</label>}
      <textarea
        id={textareaId}
        className={classNames(styles.textarea, error && styles.error, className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={classNames(errorId, helperId)}
        {...rest}
      />
      {error && <p id={errorId} className={styles.errorText} role="alert">{error}</p>}
      {helperText && !error && <p id={helperId} className={styles.helperText}>{helperText}</p>}
    </div>
  );
};

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}