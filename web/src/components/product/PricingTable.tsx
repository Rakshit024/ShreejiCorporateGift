import type { PricingSlab } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatQuantityRange } from '../../utils/pricing';
import styles from './PricingTable.module.css';

interface PricingTableProps {
  slabs: PricingSlab[];
  activeQuantity?: number;
  currency?: 'INR';
}

export function PricingTable({ slabs, activeQuantity, currency = 'INR' }: PricingTableProps) {
  if (!slabs.length) return null;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className="visually-hidden">Quantity-wise pricing</caption>
        <thead>
          <tr>
            <th scope="col">Quantity</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          {slabs.map((slab) => {
            const isActive =
              activeQuantity != null &&
              activeQuantity >= slab.min &&
              activeQuantity <= slab.max;
            return (
              <tr
                key={`${slab.min}-${slab.max}`}
                className={isActive ? styles.highlight : ''}
                aria-current={isActive ? 'true' : undefined}
              >
                <td>{formatQuantityRange(slab.min, slab.max)}</td>
                <td>{formatCurrency(slab.price, currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
