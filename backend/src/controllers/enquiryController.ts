import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Customer } from '../models/Customer.js';
import { Enquiry } from '../models/Enquiry.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import type { EnquiryInput, EnquiryListInput } from '../validators/schemas.js';

const SORTABLE = { createdAt: 'desc', name: 'asc', companyName: 'asc', status: 'asc' } as const;
const SEARCHABLE = ['name', 'companyName', 'email', 'phone', 'reference', 'product'];

/** Human-friendly enquiry reference, e.g. `ENQ-2026-0007`. */
async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ENQ-${year}-`;
  const latest = await Enquiry.findOne({ reference: new RegExp(`^${prefix}`) })
    .sort({ reference: -1 })
    .select('reference')
    .lean();
  const lastNumber = latest?.reference
    ? Number(latest.reference.slice(prefix.length))
    : 0;
  return `${prefix}${String((Number.isFinite(lastNumber) ? lastNumber : 0) + 1).padStart(4, '0')}`;
}

export const listEnquiries = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as EnquiryListInput;
  const filter: QueryFilter<unknown> = {};
  if (query.status) filter.status = query.status;

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Enquiry.find(searchClause)
          .sort(parseSort(query.sort, SORTABLE, 'createdAt', 'desc'))
          .skip(skip)
          .limit(limit)
          .lean(),
        Enquiry.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getEnquiry = asyncHandler(async (_req: Request, res: Response) => {
  const enquiry = await Enquiry.findById(paramId(res)).lean();
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  res.json({ enquiry });
});

/** Creates an enquiry and upserts the matching customer record. */
export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as EnquiryInput;
  const reference = await nextReference();
  const enquiry = await Enquiry.create({ ...input, reference });

  await Customer.findOneAndUpdate(
    { email: input.email },
    {
      $set: {
        name: input.name,
        phone: input.phone,
        ...(input.companyName ? { companyName: input.companyName } : {}),
      },
      $inc: { enquiryCount: 1 },
      $setOnInsert: { email: input.email },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  res.status(201).json({ enquiry });
});

export const updateEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    status?: string;
    adminNotes?: string;
    quotedAmount?: number | null;
  };

  const enquiry = await Enquiry.findByIdAndUpdate(
    paramId(res),
    { $set: body },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  if (!enquiry) throw ApiError.notFound('Enquiry not found');

  res.json({ enquiry });
});

export const deleteEnquiry = asyncHandler(async (_req: Request, res: Response) => {
  const enquiry = await Enquiry.findByIdAndDelete(paramId(res)).lean();
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  res.json({ message: `Deleted enquiry ${enquiry.reference ?? ''}`.trim(), deletedId: String(enquiry._id) });
});

/** Sales pipeline totals per status, for the dashboard. */
export const enquirySummary = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Enquiry.aggregate<{ _id: string; count: number; quotedAmount: number }>([
    { $group: { _id: '$status', count: { $sum: 1 }, quotedAmount: { $sum: { $ifNull: ['$quotedAmount', 0] } } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    items: rows.map((row) => ({
      status: row._id,
      count: row.count,
      quotedAmount: row.quotedAmount,
    })),
  });
});
