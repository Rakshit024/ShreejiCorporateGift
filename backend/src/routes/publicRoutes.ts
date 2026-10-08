import { Router } from 'express';
import {
  publicBanners,
  publicCategories,
  publicEnquiry,
  publicProductBySlug,
  publicProducts,
  publicSettings,
} from '../controllers/publicController.js';
import { validate } from '../middleware/validate.js';
import { enquiryBodySchema } from '../validators/schemas.js';

export const publicRouter = Router();

publicRouter.get('/categories', publicCategories);
publicRouter.get('/products', publicProducts);
publicRouter.get('/products/:slug', publicProductBySlug);
publicRouter.get('/banners', publicBanners);
publicRouter.get('/settings', publicSettings);
publicRouter.post('/enquiries', validate(enquiryBodySchema), publicEnquiry);