import type { ReactNode } from 'react';
import { PackageSearch } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <PackageSearch className={styles.icon} size={40} strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
