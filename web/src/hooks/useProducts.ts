import { useMemo } from 'react';
import { products } from '../data/products';
import type { Product, ProductFilters, SortOption } from '../types';

function matchesSearch(product: Product, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  const haystack = [
    product.name,
    product.category,
    product.description,
    product.shortDescription,
    ...product.tags,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export function filterAndSortProducts(
  list: Product[],
  filters: ProductFilters,
  sort: SortOption,
): Product[] {
  let result = list.filter((p) => {
    if (filters.categoryIds.length && !filters.categoryIds.includes(p.categoryId)) {
      return false;
    }
    if (filters.priceMin != null && p.priceFrom < filters.priceMin) return false;
    if (filters.priceMax != null && p.priceFrom > filters.priceMax) return false;
    if (filters.customizable === true && !p.customizable) return false;
    if (filters.featured === true && !p.featured) return false;
    if (filters.available === true && !p.available) return false;
    if (!matchesSearch(p, filters.search)) return false;
    return true;
  });

  result = [...result].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.priceFrom - b.priceFrom;
      case 'price-desc':
        return b.priceFrom - a.priceFrom;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'featured':
      default:
        return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    }
  });

  return result;
}

export function useProducts(filters: ProductFilters, sort: SortOption) {
  return useMemo(() => filterAndSortProducts(products, filters, sort), [filters, sort]);
}

export function useProduct(id: string | undefined) {
  return useMemo(() => products.find((p) => p.id === id), [id]);
}

export { products };
