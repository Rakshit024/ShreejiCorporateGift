import type { QueryFilter } from 'mongoose';
import type { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.js';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { paramId } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate, parseSort, withSearch } from '../utils/listQuery.js';
import type { OrderInput, OrderListInput } from '../validators/schemas.js';

const SORTABLE = { createdAt: 'desc', total: 'desc', customerName: 'asc', status: 'asc' } as const;
const SEARCHABLE = ['reference', 'customerName', 'customerEmail', 'companyName', 'customerPhone'];

/** Human-friendly order reference, e.g. `ORD-2026-0007`. */
async function nextReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const latest = await Order.findOne({ reference: new RegExp(`^${prefix}`) })
    .sort({ reference: -1 })
    .select('reference')
    .lean();
  const lastNumber = latest?.reference ? Number(latest.reference.slice(prefix.length)) : 0;
  return `${prefix}${String((Number.isFinite(lastNumber) ? lastNumber : 0) + 1).padStart(4, '0')}`;
}

/** Turns the admin's lean item input into fully denormalised order lines. */
async function buildItems(
  items: OrderInput['items'],
): Promise<Array<Record<string, unknown>>> {
  const ids = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((product) => [String(product._id), product]));

  return items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw ApiError.badRequest(`Product ${item.productId} no longer exists`);
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    return {
      productId: product._id,
      name: product.name,
      sku: product.sku ?? '',
      image: product.image ?? '',
      quantity,
      unitPrice,
      brandingOptionId: item.brandingOptionId ?? null,
      brandingLabel: item.brandingLabel ?? '',
      lineTotal: Math.round(unitPrice * quantity),
    };
  });
}

function computeTotals(order: {
  items: Array<Record<string, unknown>>;
  discount?: number;
  shipping?: number;
  tax?: number;
}): { subtotal: number; total: number } {
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.lineTotal ?? 0),
    0,
  );
  const total = Math.max(
    0,
    subtotal - (order.discount ?? 0) + (order.shipping ?? 0) + (order.tax ?? 0),
  );
  return { subtotal, total: Math.round(total) };
}

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  const query = res.locals.query as OrderListInput;
  const filter: QueryFilter<unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

  const result = await paginate(
    async (skip, limit) => {
      const searchClause = withSearch(filter, query.search, SEARCHABLE);
      const [docs, total] = await Promise.all([
        Order.find(searchClause)
          .sort(parseSort(query.sort, SORTABLE, 'createdAt', 'desc'))
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(searchClause),
      ]);
      return { docs, total };
    },
    query.page,
    query.limit,
  );

  res.json(result);
});

export const getOrder = asyncHandler(async (_req: Request, res: Response) => {
  const order = await Order.findById(paramId(res)).populate('customer', 'name email companyName').lean();
  if (!order) throw ApiError.notFound('Order not found');
  res.json({ order });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as OrderInput;
  const reference = await nextReference();
  const items = await buildItems(input.items);
  const totals = computeTotals({ items, discount: input.discount, shipping: input.shipping, tax: input.tax });

  const customer = await Customer.findOneAndUpdate(
    { email: input.customerEmail },
    {
      $set: {
        name: input.customerName,
        phone: input.customerPhone,
        ...(input.companyName ? { companyName: input.companyName } : {}),
      },
      $inc: { orderCount: 1, totalSpent: totals.total },
      $setOnInsert: { email: input.customerEmail },
      lastOrderAt: new Date(),
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  const order = await Order.create({
    ...input,
    reference,
    items,
    subtotal: totals.subtotal,
    total: totals.total,
    customer: customer?._id,
  });

  res.status(201).json({ order });
});

/** Recomputes totals after a status/payment edit so money never drifts. */
export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const existing = await Order.findById(paramId(res)).lean();
  if (!existing) throw ApiError.notFound('Order not found');

  const merged = {
    items: existing.items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    })),
    discount: (body.discount as number | undefined) ?? existing.discount,
    shipping: (body.shipping as number | undefined) ?? existing.shipping,
    tax: (body.tax as number | undefined) ?? existing.tax,
  };
  const totals = computeTotals(merged);

  const order = await Order.findByIdAndUpdate(
    paramId(res),
    { $set: { ...body, subtotal: totals.subtotal, total: totals.total } },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  if (!order) throw ApiError.notFound('Order not found');

  res.json({ order });
});

export const deleteOrder = asyncHandler(async (_req: Request, res: Response) => {
  const order = await Order.findByIdAndDelete(paramId(res)).lean();
  if (!order) throw ApiError.notFound('Order not found');

  if (order.paymentStatus === 'paid') {
    await Customer.updateOne(
      { email: order.customerEmail },
      { $inc: { orderCount: -1, totalSpent: -order.total } },
    );
  }

  res.json({ message: `Deleted order ${order.reference ?? ''}`.trim(), deletedId: String(order._id) });
});

/** Revenue totals for the dashboard's trend chart. */
export const orderSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [statusRows, revenueRows, couponCount] = await Promise.all([
    Order.aggregate<{ _id: string; count: number; total: number }>([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate<{ _id: string; revenue: number; orders: number }>([
      {
        $match: {
          status: { $ne: 'cancelled' },
          paymentStatus: { $in: ['paid', 'partial'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]),
    Coupon.countDocuments({ isActive: true }),
  ]);

  res.json({
    byStatus: statusRows.map((row) => ({ status: row._id, count: row.count, total: row.total })),
    monthly: revenueRows.reverse().map((row) => ({
      month: row._id,
      revenue: row.revenue,
      orders: row.orders,
    })),
    activeCoupons: couponCount,
  });
});
