import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import { slugify } from '../utils/slugify.js';
import type { CategoryInput, CategoryListInput } from '../validators/schemas.js';

const SORTABLE = { name: 'asc', order: 'asc', createdAt: 'desc', productCount: 'desc' } as const;
const SEARCHABLE = ['name', 'description', 'slug'];

/** Picks a slug that is not already taken, appending -2, -3, ... when needed. */
async function uniqueSlug(
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired) || 'category';
  let candidate = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await Category.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!clash) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as CategoryListInput;

  const filter: QueryFilter<unknown> = {};
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Category.find(searchClause)
          .populate('productCount')
          .sort(parseSort(query.sort, SORTABLE, 'order', 'asc'))
          .skip(skip)
          .limit(limit)
          .lean(),
        Category.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

/** Lightweight list used to populate category dropdowns in the admin forms. */
export const listCategoryOptions = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true })
    .select('name slug order isActive')
    .sort({ order: 1, name: 1 })
    .lean();
  res.json({ items: categories });
});

export const getCategory = asyncHandler(async (_req: Request, res: Response) => {
  const category = await Category.findById(paramId(res))
    .populate('productCount')
    .lean();
  if (!category) throw ApiError.notFound('Category not found');
  res.json({ category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CategoryInput;
  const slug = await uniqueSlug(input.slug?.trim() || input.name);

  const category = await Category.create({ ...input, slug });
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as Partial<CategoryInput>;

  const existing = await Category.findById(paramId(res)).lean();
  if (!existing) throw ApiError.notFound('Category not found');

  const update: Record<string, unknown> = { ...input };
  if (input.slug !== undefined || input.name !== undefined) {
    update.slug = await uniqueSlug(input.slug?.trim() || input.name || '', paramId(res));
  }

  const category = await Category.findByIdAndUpdate(paramId(res), update, {
    new: true,
    runValidators: true,
  })
    .populate('productCount')
    .lean();
  if (!category) throw ApiError.notFound('Category not found');

  // Keep the denormalised product.category label in sync with the rename.
  if (input.name && input.name !== existing.name) {
    await Product.updateMany({ categoryId: category._id }, { $set: { category: input.name } });
  }

  res.json({ category });
});

export const deleteCategory = asyncHandler(async (_req: Request, res: Response) => {
  const category = await Category.findById(paramId(res)).lean();
  if (!category) throw ApiError.notFound('Category not found');

  const productCount = await Product.countDocuments({ categoryId: category._id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete "${category.name}" while ${productCount} product(s) still reference it. Move or delete those products first.`,
    );
  }

  await Category.deleteOne({ _id: category._id });
  res.json({ message: `Deleted "${category.name}"`, deletedId: String(category._id) });
});

/** Removes every category that has no products, in one call. */
export const pruneEmptyCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().select('_id name').lean();
  const orphaned: string[] = [];
  for (const category of categories) {
    const count = await Product.countDocuments({ categoryId: category._id });
    if (count === 0) orphaned.push(String(category._id));
  }
  if (orphaned.length) await Category.deleteMany({ _id: { $in: orphaned } });
  res.json({ deleted: orphaned.length });
});

/** Applies a new 0..n-1 ordering to match the order the admin sent. */
export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const ids = (req.body as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    throw ApiError.badRequest('Expected an array of category ids');
  }

  await Promise.all(
    ids.map((id, index) => Category.findByIdAndUpdate(id, { order: index }, { returnDocument: 'before' })),
  );
  res.json({ message: 'Category order updated', count: ids.length });
});
