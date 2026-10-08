import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';
import { Enquiry } from '../models/Enquiry.js';
import { getSettings } from '../models/Setting.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseSort, withSearch } from '../utils/listQuery.js';
import type { EnquiryInput } from '../validators/schemas.js';

/**
 * Read-only endpoints for the storefront. These intentionally expose only the
 * fields the site renders and never require a token.
 */

export const publicCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true })
    .select('name slug description icon image order')
    .sort({ order: 1, name: 1 })
    .lean();

  const counts = await Product.aggregate<{ _id: string; count: number }>([
    { $match: { available: true } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const countByCategory = new Map(counts.map((row) => [String(row._id), row.count]));

  res.json({
    items: categories.map((category) => ({
      ...category,
      productCount: countByCategory.get(String(category._id)) ?? 0,
    })),
  });
});

export const publicProducts = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined;
  const featuredOnly = req.query.featured === 'true';
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));
  const page = Math.max(1, Number(req.query.page) || 1);
  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;

  const SORTABLE = {
    name: 'asc',
    priceFrom: 'asc',
    createdAt: 'desc',
  } as const;

  const filter: QueryFilter<unknown> = { available: true };
  if (featuredOnly) filter.featured = true;

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug, isActive: true })
      .select('_id')
      .lean();
    if (!category) throw ApiError.notFound('Category not found');
    filter.categoryId = category._id;
  }

  const searchClause = withSearch(filter, search, [
    'name',
    'description',
    'shortDescription',
    'tags',
  ]);

  const [docs, total] = await Promise.all([
    Product.find(searchClause)
      .select('-stock -lowStockThreshold -minimumOrderQuantity -leadTimeDays')
      .sort(
        featuredOnly
          ? { featured: -1, name: 1 }
          : parseSort(sort, SORTABLE, 'createdAt', 'desc'),
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(searchClause),
  ]);

  res.json({
    items: docs,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const publicProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, available: true })
    .select('-stock -lowStockThreshold -minimumOrderQuantity -leadTimeDays')
    .populate('categoryId', 'name slug')
    .lean();
  if (!product) throw ApiError.notFound('Product not found');
  res.json({ product });
});

/** Storefront quote form posts here â€” no auth required. */
export const publicEnquiry = asyncHandler(async (req: Request, res: Response) => {
  // The route already ran this through enquiryBodySchema, so the body is typed.
  const body = req.body as EnquiryInput;

  const year = new Date().getFullYear();
  const prefix = `ENQ-${year}-`;
  const latest = await Enquiry.findOne({ reference: new RegExp(`^${prefix}`) })
    .sort({ reference: -1 })
    .select('reference')
    .lean();
  const lastNumber = latest?.reference ? Number(latest.reference.slice(prefix.length)) : 0;
  const reference = `${prefix}${String((Number.isFinite(lastNumber) ? lastNumber : 0) + 1).padStart(4, '0')}`;

  const enquiry = await Enquiry.create({
    reference,
    source: body.source ?? 'quote-form',
    name: body.name,
    companyName: body.companyName ?? '',
    phone: body.phone,
    email: body.email,
    product: body.product ?? '',
    quantity: body.quantity ?? '',
    brandingRequired: body.brandingRequired ?? '',
    deliveryLocation: body.deliveryLocation ?? '',
    requiredDate: body.requiredDate ?? '',
    message: body.message ?? '',
    items: Array.isArray(body.items) ? body.items : [],
  });

  res.status(201).json({ reference: enquiry.reference });
});

export const publicBanners = asyncHandler(async (req: Request, res: Response) => {
  const placement = String(req.query.placement ?? 'home-hero');
  const now = new Date();

  const banners = await Banner.find({
    isActive: true,
    placement: placement as 'home-hero',
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ order: 1 })
    .lean();

  res.json({ items: banners });
});

/** Public subset of settings â€” safe to expose for the storefront footer/contact. */
export const publicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.json({
    business: settings.business,
    commerce: settings.commerce,
    seo: settings.seo,
    social: settings.social,
  });
});