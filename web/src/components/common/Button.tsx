import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'whatsapp';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconOnly?: boolean;
  children: ReactNode;
}

interface ButtonLinkProps extends Omit<LinkProps, 'children' | 'className'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

function getButtonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth,
  iconOnly,
  className = '',
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconOnly?: boolean;
  className?: string;
}): string {
  return [
    styles.btn,
    styles[variant],
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    fullWidth ? styles.full : '',
    iconOnly ? styles.iconOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant,
  size,
  fullWidth,
  iconOnly,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={getButtonClassName({ variant, size, fullWidth, iconOnly, className })}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...rest}
    >
      {children}
    </Link>
  );
}
