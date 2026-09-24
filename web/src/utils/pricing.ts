import type { PricingSlab, PrintingOption, Product } from '../types';

export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.floor(quantity));
}

export function getUnitPriceForQuantity(
  quantity: number,
  slabs?: PricingSlab[],
  fallbackPriceFrom?: number,
): number | null {
  const normalizedQuantity = normalizeQuantity(quantity);

  if (slabs?.length) {
    const slab = slabs.find(
      (candidate) => normalizedQuantity >= candidate.min && normalizedQuantity <= candidate.max,
    );
    if (slab) return slab.price;
  }

  if (fallbackPriceFrom != null) return fallbackPriceFrom;
  return null;
}

export function getPrintingOption(
  product: Product,
  optionId: string | null,
): PrintingOption | null {
  if (!product.printingOptions?.length || !optionId) {
    return product.printingOptions?.find((option) => option.id === 'none') ?? null;
  }
  return product.printingOptions.find((option) => option.id === optionId) ?? null;
}

export function estimateLineTotal(
  product: Product,
  quantity: number,
  brandingOptionId: string | null,
): { unitPrice: number | null; brandingPerUnit: number; total: number | null } {
  const normalizedQuantity = normalizeQuantity(quantity);
  const unitBase = getUnitPriceForQuantity(
    normalizedQuantity,
    product.pricingSlabs,
    product.priceFrom,
  );
  const printing =
    getPrintingOption(product, brandingOptionId) ??
    getPrintingOption(product, 'none');
  const brandingPerUnit = printing?.pricePerUnit ?? 0;

  if (unitBase == null) {
    return { unitPrice: null, brandingPerUnit, total: null };
  }

  const unitPrice = unitBase + brandingPerUnit;
  return {
    unitPrice,
    brandingPerUnit,
    total: unitPrice * normalizedQuantity,
  };
}

export function formatQuantityRange(min: number, max: number): string {
  if (max === Infinity) return `${min}+`;
  return `${min}–${max}`;
}
