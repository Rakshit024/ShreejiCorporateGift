import { categories } from '../../data/categories';
import type { ProductFilters as Filters } from '../../types';
import { Button } from '../common/Button';
import styles from './ProductFilters.module.css';

function parsePriceInput(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

interface ProductFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  showActions?: boolean;
  onApply?: () => void;
  className?: string;
}

export function ProductFiltersPanel({
  filters,
  onChange,
  onClear,
  showActions,
  onApply,
  className = '',
}: ProductFiltersProps) {
  const toggleCategory = (id: string) => {
    const set = new Set(filters.categoryIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ ...filters, categoryIds: [...set] });
  };

  return (
    <aside className={`${styles.sidebar} ${className}`} aria-label="Product filters">
      <div className={styles.filters}>
        <div className={styles.group}>
          <h3>Categories</h3>
          <div className={styles.list}>
            {categories
              .filter((c) => c.id !== 'custom-printing' && c.id !== 'corporate-hampers')
              .map((cat) => (
                <label key={cat.id} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={filters.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
          </div>
        </div>

        <div className={styles.group}>
          <h3>Price range (from)</h3>
          <div className={styles.priceRow}>
            <input
              type="number"
              min={0}
              placeholder="Min ₹"
              aria-label="Minimum price"
              value={filters.priceMin ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMin: parsePriceInput(e.target.value),
                })
              }
            />
            <input
              type="number"
              min={0}
              placeholder="Max ₹"
              aria-label="Maximum price"
              value={filters.priceMax ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMax: parsePriceInput(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className={styles.group}>
          <h3>Options</h3>
          <div className={styles.list}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={filters.customizable === true}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    customizable: e.target.checked ? true : null,
                  })
                }
              />
              Customizable only
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={filters.featured === true}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    featured: e.target.checked ? true : null,
                  })
                }
              />
              Featured only
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={filters.available === true}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    available: e.target.checked ? true : null,
                  })
                }
              />
              Available only
            </label>
          </div>
        </div>

        {showActions && (
          <div className={styles.actions}>
            <Button variant="gold" fullWidth onClick={onApply}>
              Apply Filters
            </Button>
            <Button variant="outline" fullWidth onClick={onClear}>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
