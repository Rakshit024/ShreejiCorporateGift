import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import { slugify } from '../utils/slugify.js';
import type { BulkProductActionInput, ProductInput, ProductListInput } from '../validators/schemas.js';

const SORTABLE = {
  name: 'asc',
  priceFrom: 'asc',
  createdAt: 'desc',
  updatedAt: 'desc',
  stock: 'asc',
} as const;
const SEARCHABLE = ['name', 'sku', 'description', 'shortDescription', 'category', 'tags'];

/** Picks a slug that is not already taken, appending -2, -3, ... when needed. */
async function uniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired) || 'product';
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const clash = await Product.exists({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!clash) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

/** Reads the category name to denormalise onto the product. */
async function resolveCategoryName(categoryId: string): Promise<string> {
  const category = await Category.findById(categoryId).select('name').lean();
  if (!category) throw ApiError.badRequest('The selected category no longer exists');
  return category.name;
}

function buildFilter(query: ProductListInput): QueryFilter<unknown> {
  const filter: QueryFilter<unknown> = {};
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.available !== undefined) filter.available = query.available;
  if (query.customizable !== undefined) filter.customizable = query.customizable;
  if (query.priceMin != null || query.priceMax != null) {
    filter.priceFrom = {
      ...(query.priceMin != null ? { $gte: query.priceMin } : {}),
      ...(query.priceMax != null ? { $lte: query.priceMax } : {}),
    };
  }
  if (query.stock === 'out') filter.stock = 0;
  if (query.stock === 'low') filter.stock = { $gt: 0, $lte: 5 };
  return filter;
}

export const listProducts = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as ProductListInput;
  const filter = buildFilter(query);

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Product.find(searchClause)
          .populate('categoryId', 'name slug')
          .sort(parseSort(query.sort, SORTABLE, 'createdAt', 'desc'))
          .skip(skip)
          .limit(limit)
          .lean({ virtuals: true }),
        Product.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getProduct = asyncHandler(async (_req: Request, res: Response) => {
  const product = await Product.findById(paramId(res)).populate('categoryId', 'name slug').lean();
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as ProductInput;
  const categoryName = await resolveCategoryName(input.categoryId);
  const slug = await uniqueSlug(input.slug?.trim() || input.name);

  const product = await Product.create({ ...input, category: categoryName, slug });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as Partial<ProductInput>;

  const existing = await Product.findById(paramId(res)).lean();
  if (!existing) throw ApiError.notFound('Product not found');

  const update: Record<string, unknown> = { ...input };

  if (input.categoryId && String(input.categoryId) !== String(existing.categoryId)) {
    update.category = await resolveCategoryName(input.categoryId);
  }
  if (input.slug !== undefined || input.name !== undefined) {
    update.slug = await uniqueSlug(input.slug?.trim() || input.name || '', paramId(res));
  }

  const product = await Product.findByIdAndUpdate(paramId(res), update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!product) throw ApiError.notFound('Product not found');

  res.json({ product });
});

export const deleteProduct = asyncHandler(async (_req: Request, res: Response) => {
  const product = await Product.findById(paramId(res)).select('name').lean();
  if (!product) throw ApiError.notFound('Product not found');
  await Product.deleteOne({ _id: product._id });
  res.json({ message: `Deleted "${product.name}"`, deletedId: String(product._id) });
});

/** Flips `available` without opening the full edit form. */
export const toggleAvailability = asyncHandler(async (_req: Request, res: Response) => {
  const product = await Product.findById(paramId(res));
  if (!product) throw ApiError.notFound('Product not found');
  product.available = !product.available;
  await product.save({ validateBeforeSave: false });
  res.json({ product: { id: String(product._id), available: product.available } });
});

export const toggleFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const product = await Product.findById(paramId(res));
  if (!product) throw ApiError.notFound('Product not found');
  product.featured = !product.featured;
  await product.save({ validateBeforeSave: false });
  res.json({ product: { id: String(product._id), featured: product.featured } });
});

/** Adjusts stock by a signed delta, e.g. { delta: -5 } or { set: 40 }. */
export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { delta?: number; set?: number };
  const product = await Product.findById(paramId(res));
  if (!product) throw ApiError.notFound('Product not found');

  if (typeof body.set === 'number') {
    product.stock = Math.max(0, Math.trunc(body.set));
  } else if (typeof body.delta === 'number') {
    product.stock = Math.max(0, product.stock + Math.trunc(body.delta));
  } else {
    throw ApiError.badRequest('Provide either a stock "set" value or a "delta"');
  }

  await product.save({ validateBeforeSave: false });
  res.json({ product: { id: String(product._id), stock: product.stock } });
});

/** Multi-select actions from the products table toolbar. */
export const bulkAction = asyncHandler(async (req: Request, res: Response) => {
  const { ids, action, value } = req.body as BulkProductActionInput;

  const set: Record<string, unknown> = {};
  switch (action) {
    case 'feature':
      set.featured = true;
      break;
    case 'unfeature':
      set.featured = false;
      break;
    case 'available':
      set.available = true;
      break;
    case 'unavailable':
      set.available = false;
      break;
    case 'category':
      if (!value || !/^[a-f\d]{24}$/i.test(value)) throw ApiError.badRequest('Select a category');
      set.category = await resolveCategoryName(value);
      set.categoryId = value;
      break;
    case 'delete':
      await Product.deleteMany({ _id: { $in: ids } });
      res.json({ message: `Deleted ${ids.length} product(s)`, affected: ids.length });
      return;
  }

  const result = await Product.updateMany({ _id: { $in: ids } }, { $set: set });
  res.json({ message: `Updated ${result.modifiedCount} product(s)`, affected: result.modifiedCount });
});

/** Bulk price change by percentage, for catalog-wide promotions. */
export const bulkAdjustPrices = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { ids?: unknown; percent?: unknown };
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    throw ApiError.badRequest('Select at least one product');
  }
  const percent = Number(body.percent);
  if (!Number.isFinite(percent) || percent <= -100) {
    throw ApiError.badRequest('Provide a percentage greater than -100');
  }

  const products = await Product.find({ _id: { $in: body.ids as string[] } });
  const updates = products.map((product) => {
    const nextPrice = Math.max(0, Math.round(product.priceFrom * (1 + percent / 100)));
    const set: Record<string, unknown> = { priceFrom: nextPrice };
    if (product.pricingSlabs?.length) {
      set.pricingSlabs = product.pricingSlabs.map((slab) => ({
        min: slab.min,
        max: slab.max,
        price: Math.max(0, Math.round(slab.price * (1 + percent / 100))),
      }));
    }
    return { updateOne: { filter: { _id: product._id }, update: { $set: set } } };
  });

  if (updates.length) await Product.bulkWrite(updates);
  res.json({ message: `Repriced ${updates.length} product(s)`, affected: updates.length });
});

/** Duplicates a product so a variant can be created without retyping. */
export const duplicateProduct = asyncHandler(async (_req: Request, res: Response) => {
  const source = await Product.findById(paramId(res)).lean();
  if (!source) throw ApiError.notFound('Product not found');

  const { _id, createdAt, updatedAt, ...rest } = source;
  void _id;
  void createdAt;
  void updatedAt;

  const copy = {
    ...rest,
    name: `${source.name} (copy)`.slice(0, 140),
    slug: await uniqueSlug(`${source.slug}-copy`),
    featured: false,
  };
  delete (copy as Record<string, unknown>).id;

  const created = await Product.create(copy);
  res.status(201).json({ product: created.toJSON() });
});
