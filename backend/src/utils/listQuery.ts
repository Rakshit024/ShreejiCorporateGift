import type { QueryFilter, SortOrder } from 'mongoose';

export interface ListOptions<T> {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  filter?: QueryFilter<T>;
  searchFields?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Escapes user input so it is safe to embed inside a RegExp. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns a `"-createdAt,name"` style sort string into a Mongoose sort object,
 * ignoring any field that is not in the allow-list.
 */
export function parseSort(
  sort: string | undefined,
  allowed: Record<string, SortOrder>,
  fallbackKey: string,
  fallbackOrder: SortOrder = 'desc',
): Record<string, SortOrder> {
  const raw = sort?.split(',')[0]?.trim();
  if (raw) {
    const descending = raw.startsWith('-');
    const key = descending ? raw.slice(1) : raw;
    if (allowed[key]) {
      return { [key]: descending ? 'desc' : 'asc' };
    }
  }
  return { [fallbackKey]: fallbackOrder };
}

/** Runs a paginated find and returns a uniform envelope for the admin panel. */
export async function paginate<T>(
  run: (skip: number, limit: number) => Promise<{ docs: T[]; total: number }>,
  page: number,
  limit: number,
): Promise<PaginatedResult<T>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const { docs, total } = await run((safePage - 1) * safeLimit, safeLimit);
  return {
    items: docs,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

/** Builds a case-insensitive OR filter across the given document fields. */
export function searchFilter<T>(
  search: string | undefined,
  fields: string[],
): QueryFilter<T> | undefined {
  const term = search?.trim();
  if (!term) return undefined;
  const rx = new RegExp(escapeRegex(term), 'i');
  return { $or: fields.map((field) => ({ [field]: rx })) } as QueryFilter<T>;
}

/** Merges the caller's filter with a search filter, keeping both. */
export function withSearch<T>(
  filter: QueryFilter<T>,
  search: string | undefined,
  fields: string[],
): QueryFilter<T> {
  const searchClause = searchFilter<T>(search, fields);
  if (!searchClause) return filter;
  return { $and: [filter, searchClause] } as QueryFilter<T>;
}