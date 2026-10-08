import type { Request, Response } from 'express';
import fs from 'node:fs';
import { Banner } from '../models/Banner.js';
import { Category } from '../models/Category.js';
import { Coupon } from '../models/Coupon.js';
import { Customer } from '../models/Customer.js';
import { Enquiry } from '../models/Enquiry.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteUpload, publicUrl, resolveUploadPath } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';

/* -------------------------------- uploads -------------------------------- */

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw ApiError.badRequest('No files were uploaded');

  res.status(201).json({
    files: files.map((file) => ({
      filename: file.filename,
      url: publicUrl(file.filename),
      size: file.size,
      mimeType: file.mimetype,
    })),
  });
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const url = (req.body as { url?: unknown }).url;
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) {
    throw ApiError.badRequest('Provide a /uploads/... path');
  }
  const full = resolveUploadPath(url.replace('/uploads/', ''));
  if (!full || !fs.existsSync(full)) throw ApiError.notFound('File not found on disk');

  deleteUpload(url);
  res.json({ message: 'Image deleted', url });
});

/* ------------------------------- dashboard ------------------------------- */

/** Everything the admin dashboard renders, in one round trip. */
export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    availableProducts,
    featuredProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCategories,
    activeCategories,
    newEnquiries,
    totalEnquiries,
    wonEnquiries,
    revenueAgg,
    revenueThirtyDays,
    customers,
    newCustomers,
    activeCoupons,
    activeBanners,
    recentEnquiries,
    lowStockItems,
    topProducts,
    revenueTrend,
    categoryBreakdown,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ available: true }),
    Product.countDocuments({ featured: true }),
    Product.countDocuments({ available: true, stock: { $gt: 0, $lte: 5 } }),
    Product.countDocuments({ available: true, stock: 0 }),
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Enquiry.countDocuments({ status: 'new' }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'won' }),
    Order.aggregate<{ revenue: number; orders: number }>([
      { $match: { status: { $ne: 'cancelled' }, paymentStatus: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate<{ revenue: number; orders: number }>([
      {
        $match: {
          status: { $ne: 'cancelled' },
          paymentStatus: { $in: ['paid', 'partial'] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),
    Customer.countDocuments(),
    Customer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Coupon.countDocuments({ isActive: true }),
    Banner.countDocuments({ isActive: true }),
    Enquiry.find().sort({ createdAt: -1 }).limit(6).select('reference name companyName status createdAt').lean(),
    Product.find({ available: true, stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(6)
      .select('name slug image stock lowStockThreshold category')
      .lean(),
    Product.aggregate<{ _id: string; name: string; sold: number; revenue: number }>([
      { $unwind: '$items' },
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
    ]),
    Category.aggregate<{ _id: string; name: string; products: number }>([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'products',
        },
      },
      { $project: { name: 1, products: { $size: '$products' } } },
      { $sort: { products: -1 } },
      { $limit: 6 },
    ]),
  ]);

  const lifetime = revenueAgg[0] ?? { revenue: 0, orders: 0 };
  const recent = revenueThirtyDays[0] ?? { revenue: 0, orders: 0 };

  res.json({
    catalog: {
      totalProducts,
      availableProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      activeCategories,
    },
    enquiries: { newEnquiries, totalEnquiries, wonEnquiries },
    sales: {
      lifetimeRevenue: lifetime.revenue,
      lifetimeOrders: lifetime.orders,
      revenueLast30Days: recent.revenue,
      ordersLast30Days: recent.orders,
    },
    customers: { total: customers, newLast7Days: newCustomers },
    marketing: { activeCoupons, activeBanners },
    recentEnquiries,
    lowStockItems,
    topProducts: topProducts.map((row) => ({
      id: row._id,
      name: row.name,
      sold: row.sold,
      revenue: row.revenue,
    })),
    revenueTrend: revenueTrend
      .reverse()
      .map((row) => ({ date: row._id, revenue: row.revenue, orders: row.orders })),
    categoryBreakdown: categoryBreakdown.map((row) => ({
      id: row._id,
      name: row.name,
      products: row.products,
    })),
  });
});

/** Lowest stock items plus slow movers, for the dashboard's action list. */
export const stockAlerts = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Product.find({ available: true, stock: { $lte: 5 } })
    .sort({ stock: 1 })
    .select('name slug image stock lowStockThreshold category')
    .lean();

  res.json({ items });
});

/** Verifies the database connection, surfaced on the admin settings page. */
export const healthStatus = asyncHandler(async (_req: Request, res: Response) => {
  const [users, products, categories] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
  ]);
  res.json({
    status: 'ok',
    database: 'connected',
    counts: { users, products, categories },
    serverTime: new Date().toISOString(),
  });
});