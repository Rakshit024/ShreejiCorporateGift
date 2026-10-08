import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Banner } from '../models/Banner.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import type { BannerInput, BannerListInput } from '../validators/schemas.js';

const SORTABLE = { createdAt: 'desc', order: 'asc', title: 'asc', startsAt: 'desc' } as const;
const SEARCHABLE = ['title', 'subtitle', 'ctaLabel'];

function toDate(value: number | null | undefined): Date | null {
  if (value == null) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const listBanners = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as BannerListInput;
  const filter: QueryFilter<unknown> = {};
  if (query.placement) filter.placement = query.placement;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Banner.find(searchClause)
          .sort(parseSort(query.sort, SORTABLE, 'order', 'asc'))
          .skip(skip)
          .limit(limit)
          .lean(),
        Banner.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getBanner = asyncHandler(async (_req: Request, res: Response) => {
  const banner = await Banner.findById(paramId(res)).lean();
  if (!banner) throw ApiError.notFound('Banner not found');
  res.json({ banner });
});

export const createBanner = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as BannerInput;
  const banner = await Banner.create({
    ...input,
    startsAt: toDate(input.startsAt),
    endsAt: toDate(input.endsAt),
  });
  res.status(201).json({ banner });
});

export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Partial<BannerInput>;
  const update: Record<string, unknown> = { ...body };
  if ('startsAt' in body) update.startsAt = toDate(body.startsAt);
  if ('endsAt' in body) update.endsAt = toDate(body.endsAt);

  const banner = await Banner.findByIdAndUpdate(paramId(res), update, {
    new: true,
    runValidators: true,
  }).lean();
  if (!banner) throw ApiError.notFound('Banner not found');

  res.json({ banner });
});

export const deleteBanner = asyncHandler(async (_req: Request, res: Response) => {
  const banner = await Banner.findByIdAndDelete(paramId(res)).lean();
  if (!banner) throw ApiError.notFound('Banner not found');
  res.json({ message: `Deleted "${banner.title}"`, deletedId: String(banner._id) });
});

export const toggleBanner = asyncHandler(async (_req: Request, res: Response) => {
  const banner = await Banner.findById(paramId(res));
  if (!banner) throw ApiError.notFound('Banner not found');
  banner.isActive = !banner.isActive;
  await banner.save({ validateBeforeSave: false });
  res.json({ banner: { id: String(banner._id), isActive: banner.isActive } });
});
