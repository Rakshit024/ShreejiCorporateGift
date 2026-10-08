import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import type { CouponInput, PaginationInput } from '../validators/schemas.js';

const SORTABLE = { createdAt: 'desc', code: 'asc', discountValue: 'desc', validUntil: 'asc' } as const;
const SEARCHABLE = ['code', 'description'];

/** Accepts an ISO string or epoch ms from a date input. */
function toDate(value: number | null | undefined): Date | null {
  if (value == null) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const listCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as PaginationInput;
  const filter: QueryFilter<unknown> = {};

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Coupon.find(searchClause)
          .sort(parseSort(query.sort, SORTABLE, 'createdAt', 'desc'))
          .skip(skip)
          .limit(limit)
          .lean({ virtuals: true }),
        Coupon.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getCoupon = asyncHandler(async (_req: Request, res: Response) => {
  const coupon = await Coupon.findById(paramId(res)).lean({ virtuals: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  res.json({ coupon });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CouponInput;
  const coupon = await Coupon.create({
    ...input,
    validFrom: toDate(input.validFrom),
    validUntil: toDate(input.validUntil),
  });
  res.status(201).json({ coupon });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Partial<CouponInput>;
  const update: Record<string, unknown> = { ...body };
  if ('validFrom' in body) update.validFrom = toDate(body.validFrom);
  if ('validUntil' in body) update.validUntil = toDate(body.validUntil);

  const coupon = await Coupon.findByIdAndUpdate(paramId(res), update, {
    new: true,
    runValidators: true,
  }).lean({ virtuals: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');

  res.json({ coupon });
});

export const deleteCoupon = asyncHandler(async (_req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(paramId(res)).lean();
  if (!coupon) throw ApiError.notFound('Coupon not found');
  res.json({ message: `Deleted coupon ${coupon.code}`, deletedId: String(coupon._id) });
});

export const toggleCoupon = asyncHandler(async (_req: Request, res: Response) => {
  const coupon = await Coupon.findById(paramId(res));
  if (!coupon) throw ApiError.notFound('Coupon not found');
  coupon.isActive = !coupon.isActive;
  await coupon.save({ validateBeforeSave: false });
  res.json({ coupon: { id: String(coupon._id), isActive: coupon.isActive } });
});
