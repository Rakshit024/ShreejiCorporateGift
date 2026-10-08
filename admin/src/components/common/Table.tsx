import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './Table.module.css';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
  loading,
  emptyMessage = 'No data',
  striped = true,
  hoverable = true,
}: TableProps<T>) {
  

  const handleSort = (key: string) => {
    if (onSort) onSort(key);
  };

  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table} role="grid">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }} className={styles.th}>
                  <div className={styles.thContent}>{col.header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={columns.length} className={styles.loadingCell}><div className={styles.spinner} /></td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table} role="grid">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }} className={styles.th}>
                  <div className={styles.thContent}>{col.header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={columns.length} className={styles.emptyCell}>{emptyMessage}</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table} role="grid">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={classNames(styles.th, col.sortable && styles.sortable, col.align && styles[col.align])}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className={styles.thContent}>
                  <span>{col.header}</span>
                  {col.sortable && sortBy === col.key && (
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              className={classNames(
                styles.tr,
                striped && index % 2 === 1 && styles.striped,
                hoverable && onRowClick && styles.hoverable,
                onRowClick && styles.clickable
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={classNames(styles.td, col.align && styles[col.align])}>
                  {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function classNames(...parts: Array<string | false | undefined | null>): string {
  return parts.filter(Boolean).join(' ');
}