import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { categoryRouter } from './categoryRoutes.js';
import { productRouter } from './productRoutes.js';
import { enquiryRouter } from './enquiryRoutes.js';
import { orderRouter } from './orderRoutes.js';
import { customerRouter } from './customerRoutes.js';
import { couponRouter } from './couponRoutes.js';
import { bannerRouter } from './bannerRoutes.js';
import { adminRouter, settingsRouter, uploadRouter } from './adminRoutes.js';
import { publicRouter } from './publicRoutes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({
    name: 'Shreeji Corporate Gift API',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/categories', '/api/products', '/api/enquiries', '/api/orders', '/api/customers', '/api/coupons', '/api/banners', '/api/settings', '/api/uploads', '/api/admin', '/api/public'],
  });
});

// Authenticated admin surface.
apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/enquiries', enquiryRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/banners', bannerRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/admin', adminRouter);

// Open surface for the storefront.
apiRouter.use('/public', publicRouter);