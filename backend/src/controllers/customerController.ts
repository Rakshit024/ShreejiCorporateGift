import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Customer } from '../models/Customer.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import type { CustomerInput, CustomerListInput } from '../validators/schemas.js';

const SORTABLE = { createdAt: 'desc', name: 'asc', totalSpent: 'desc', companyName: 'asc' } as const;
const SEARCHABLE = ['name', 'email', 'phone', 'companyName', 'companyWebsite'];

export const listCustomers = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as CustomerListInput;
  const filter: QueryFilter<unknown> = {};
  if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked;

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Customer.find(searchClause)
          .sort(parseSort(query.sort, SORTABLE, 'totalSpent', 'desc'))
          .skip(skip)
          .limit(limit)
          .lean(),
        Customer.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getCustomer = asyncHandler(async (_req: Request, res: Response) => {
  const customer = await Customer.findById(paramId(res)).lean();
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ customer });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CustomerInput;
  const customer = await Customer.create(input);
  res.status(201).json({ customer });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await Customer.findByIdAndUpdate(paramId(res), req.body, {
    new: true,
    runValidators: true,
  }).lean();
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({ customer });
});

export const deleteCustomer = asyncHandler(async (_req: Request, res: Response) => {
  const customer = await Customer.findByIdAndDelete(paramId(res)).lean();
  if (!customer) throw ApiError.notFound('Customer not found');
  res.json({
    message: `Deleted ${customer.name}`,
    deletedId: String(customer._id),
  });
});

export const toggleBlocked = asyncHandler(async (_req: Request, res: Response) => {
  const customer = await Customer.findById(paramId(res));
  if (!customer) throw ApiError.notFound('Customer not found');
  customer.isBlocked = !customer.isBlocked;
  await customer.save({ validateBeforeSave: false });
  res.json({ customer: { id: String(customer._id), isBlocked: customer.isBlocked } });
});
