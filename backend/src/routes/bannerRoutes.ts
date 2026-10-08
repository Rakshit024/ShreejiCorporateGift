import { Router } from 'express';
import {
  createBanner,
  deleteBanner,
  getBanner,
  listBanners,
  toggleBanner,
  updateBanner,
} from '../controllers/bannerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bannerBodySchema,
  bannerListSchema,
  bannerUpdateSchema,
  idParamSchema,
} from '../validators/schemas.js';

export const bannerRouter = Router();

bannerRouter.use(requireAuth);

bannerRouter.get('/', validate(bannerListSchema, 'query'), listBanners);
bannerRouter.get('/:id', validate(idParamSchema, 'params'), getBanner);
bannerRouter.post('/', validate(bannerBodySchema), createBanner);
bannerRouter.patch('/:id', validate(idParamSchema, 'params'), validate(bannerUpdateSchema), updateBanner);
bannerRouter.patch('/:id/toggle', validate(idParamSchema, 'params'), toggleBanner);
bannerRouter.delete('/:id', validate(idParamSchema, 'params'), deleteBanner);