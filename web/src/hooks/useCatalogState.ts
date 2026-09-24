import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductFilters, SortOption } from '../types';

export const defaultFilters: ProductFilters = {
  categoryIds: [],
  priceMin: null,
  priceMax: null,
  customizable: null,
  featured: null,
  available: null,
  search: '',
};

const sortOptions = new Set<SortOption>([
  'featured',
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
]);

function parseSort(value: string | null): SortOption {
  return value && sortOptions.has(value as SortOption) ? (value as SortOption) : 'featured';
}

function parsePrice(value: string | null): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null): void {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function useCatalogState(initialCategoryId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: ProductFilters = useMemo(() => {
    const categoryParam = searchParams.get('category');
    const categoryIds = initialCategoryId
      ? [initialCategoryId]
      : categoryParam
        ? [...new Set(categoryParam.split(',').map((id) => id.trim()).filter(Boolean))]
        : [];

    return {
      ...defaultFilters,
      categoryIds,
      priceMin: parsePrice(searchParams.get('min') || searchParams.get('priceMin')),
      priceMax: parsePrice(searchParams.get('max') || searchParams.get('priceMax')),
      search: searchParams.get('search') ?? '',
      featured: searchParams.get('featured') === '1' ? true : null,
      customizable: searchParams.get('custom') === '1' ? true : null,
      available: searchParams.get('available') === '1' ? true : null,
    };
  }, [searchParams, initialCategoryId]);

  const sort = useMemo(
    () => parseSort(searchParams.get('sort')),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: ProductFilters) => {
      const params = new URLSearchParams(searchParams);

      setOrDelete(params, 'search', next.search.trim() || null);
      if (initialCategoryId) {
        params.delete('category');
      } else {
        setOrDelete(params, 'category', next.categoryIds.join(',') || null);
      }
      setOrDelete(
        params,
        'min',
        next.priceMin != null && next.priceMin >= 0 ? String(next.priceMin) : null,
      );
      setOrDelete(
        params,
        'max',
        next.priceMax != null && next.priceMax >= 0 ? String(next.priceMax) : null,
      );
      setOrDelete(params, 'featured', next.featured ? '1' : null);
      setOrDelete(params, 'custom', next.customizable ? '1' : null);
      setOrDelete(params, 'available', next.available ? '1' : null);

      setSearchParams(params, { replace: true, preventScrollReset: true });
    },
    [initialCategoryId, searchParams, setSearchParams],
  );

  const setSort = useCallback(
    (next: SortOption) => {
      const params = new URLSearchParams(searchParams);
      setOrDelete(params, 'sort', next === 'featured' ? null : next);
      setSearchParams(params, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    for (const key of [
      'search',
      'category',
      'min',
      'priceMin',
      'max',
      'priceMax',
      'featured',
      'custom',
      'available',
    ]) {
      params.delete(key);
    }
    if (initialCategoryId) params.set('category', initialCategoryId);
    setSearchParams(params, { replace: true, preventScrollReset: true });
  }, [initialCategoryId, searchParams, setSearchParams]);

  return {
    filters,
    setFilters,
    clearFilters,
    sort,
    setSort,
    mobileFiltersOpen,
    setMobileFiltersOpen,
  };
}
