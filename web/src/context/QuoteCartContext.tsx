import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProductById } from '../data/products';
import type { QuoteCartItem } from '../types';
import { estimateLineTotal } from '../utils/pricing';

const STORAGE_KEY = 'shreeji-quote-cart-v1';

interface AddToQuoteParams {
  productId: string;
  quantity?: number;
  brandingOptionId?: string | null;
  brandingLabel?: string;
}

interface QuoteCartContextValue {
  items: QuoteCartItem[];
  itemCount: number;
  addItem: (params: AddToQuoteParams) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  updateBranding: (
    lineId: string,
    brandingOptionId: string | null,
    brandingLabel: string,
  ) => void;
  clearCart: () => void;
  estimatedTotal: number | null;
  lineSummaries: Array<{
    lineId: string;
    productId: string;
    productName: string;
    quantity: number;
    branding: string;
    unitPrice: number | null;
    lineTotal: number | null;
  }>;
}

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function getLineId(productId: string, brandingOptionId: string | null | undefined): string {
  const normalizedBrandingId =
    typeof brandingOptionId === 'string' ? brandingOptionId.trim() : '';
  return `${productId}::${normalizedBrandingId || 'none'}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function loadStored(): QuoteCartItem[] {
  if (typeof localStorage === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const byLine = new Map<string, QuoteCartItem>();
    for (const entry of parsed) {
      if (!isRecord(entry) || typeof entry.productId !== 'string' || !entry.productId.trim()) {
        continue;
      }

      const productId = entry.productId.trim();
      const quantity = typeof entry.quantity === 'number' ? normalizeQuantity(entry.quantity) : 1;
      const brandingOptionId =
        typeof entry.brandingOptionId === 'string' && entry.brandingOptionId.trim()
          ? entry.brandingOptionId.trim()
          : null;
      const brandingLabel =
        typeof entry.brandingLabel === 'string' && entry.brandingLabel.trim()
          ? entry.brandingLabel.trim()
          : 'No Printing';
      const lineId = getLineId(productId, brandingOptionId);
      const existing = byLine.get(lineId);

      byLine.set(lineId, {
        lineId,
        productId,
        quantity: existing ? normalizeQuantity(existing.quantity + quantity) : quantity,
        brandingOptionId,
        brandingLabel,
      });
    }

    return [...byLine.values()];
  } catch {
    return [];
  }
}

function resolveBrandingLabel(
  productId: string,
  brandingOptionId: string | null,
  providedLabel?: string,
): string {
  if (providedLabel?.trim()) return providedLabel.trim();
  return (
    getProductById(productId)?.printingOptions?.find(
      (option) => option.id === brandingOptionId,
    )?.label ?? 'No Printing'
  );
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>(() => loadStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable in private browsing or when its quota is full.
    }
  }, [items]);

  const addItem = useCallback(
    ({
      productId,
      quantity = 1,
      brandingOptionId,
      brandingLabel,
    }: AddToQuoteParams) => {
      const normalizedProductId = productId.trim();
      if (!normalizedProductId) return;
      const quantityToAdd = normalizeQuantity(quantity);
      const requestedBrandingId =
        typeof brandingOptionId !== 'string' || !brandingOptionId.trim()
          ? 'none'
          : brandingOptionId;
      const lineId = getLineId(normalizedProductId, requestedBrandingId);
      const label = resolveBrandingLabel(normalizedProductId, requestedBrandingId, brandingLabel);

      setItems((prev) => {
        const existing = prev.find((item) => item.lineId === lineId);
        if (existing) {
          return prev.map((item) =>
            item.lineId === lineId
              ? {
                  ...item,
                  quantity: normalizeQuantity(item.quantity + quantityToAdd),
                  brandingLabel: label,
                }
              : item,
          );
        }

        return [
          ...prev,
          {
            lineId,
            productId: normalizedProductId,
            quantity: quantityToAdd,
            brandingOptionId: requestedBrandingId,
            brandingLabel: label,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((lineIdOrProductId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.lineId !== lineIdOrProductId && item.productId !== lineIdOrProductId,
      ),
    );
  }, []);

  const updateQuantity = useCallback((lineIdOrProductId: string, quantity: number) => {
    const nextQuantity = normalizeQuantity(quantity);
    setItems((prev) =>
      prev.map((item) =>
        item.lineId === lineIdOrProductId || item.productId === lineIdOrProductId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }, []);

  const updateBranding = useCallback(
    (lineIdOrProductId: string, brandingOptionId: string | null, brandingLabel: string) => {
      setItems((prev) => {
        const target =
          prev.find((item) => item.lineId === lineIdOrProductId) ??
          prev.find((item) => item.productId === lineIdOrProductId);
        if (!target) return prev;

        const normalizedBrandingId = brandingOptionId?.trim() || null;
        const nextBrandingId = normalizedBrandingId ?? 'none';
        const nextLineId = getLineId(target.productId, nextBrandingId);
        const nextLabel = resolveBrandingLabel(
          target.productId,
          normalizedBrandingId,
          brandingLabel,
        );

        if (target.lineId === nextLineId) {
          return prev.map((item) =>
            item.lineId === target.lineId
              ? { ...item, brandingOptionId: normalizedBrandingId, brandingLabel: nextLabel }
              : item,
          );
        }

        const existing = prev.find((item) => item.lineId === nextLineId);
        if (existing) {
          return prev
            .filter((item) => item.lineId !== target.lineId)
            .map((item) =>
              item.lineId === nextLineId
                ? {
                    ...item,
                    quantity: normalizeQuantity(item.quantity + target.quantity),
                    brandingOptionId: normalizedBrandingId,
                    brandingLabel: nextLabel,
                  }
                : item,
            );
        }

        return prev.map((item) =>
          item.lineId === target.lineId
            ? {
                ...item,
                lineId: nextLineId,
                brandingOptionId: normalizedBrandingId,
                brandingLabel: nextLabel,
              }
            : item,
        );
      });
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const lineSummaries = useMemo(
    () =>
      items.map((item) => {
        const product = getProductById(item.productId);
        if (!product) {
          return {
            lineId: item.lineId,
            productId: item.productId,
            productName: item.productId,
            quantity: item.quantity,
            branding: item.brandingLabel,
            unitPrice: null,
            lineTotal: null,
          };
        }

        const estimate = estimateLineTotal(product, item.quantity, item.brandingOptionId ?? 'none');
        return {
          lineId: item.lineId,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          branding: item.brandingLabel,
          unitPrice: estimate.unitPrice,
          lineTotal: estimate.total,
        };
      }),
    [items],
  );

  const estimatedTotal = useMemo(() => {
    const totals = lineSummaries.map((line) => line.lineTotal);
    if (!totals.length || totals.some((total) => total == null)) return null;
    return totals.reduce<number>((sum, total) => sum + (total ?? 0), 0);
  }, [lineSummaries]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value: QuoteCartContextValue = {
    items,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    updateBranding,
    clearCart,
    estimatedTotal,
    lineSummaries,
  };

  return (
    <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error('useQuoteCart must be used within QuoteCartProvider');
  return ctx;
}
