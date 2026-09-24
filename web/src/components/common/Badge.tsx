import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'gold' | 'navy' | 'outline';
  children: ReactNode;
}

export function Badge({ variant = 'outline', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
