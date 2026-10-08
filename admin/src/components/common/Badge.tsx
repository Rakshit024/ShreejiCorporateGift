import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Variant = 'gold' | 'navy' | 'outline' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

export function Badge({ variant = 'outline', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}