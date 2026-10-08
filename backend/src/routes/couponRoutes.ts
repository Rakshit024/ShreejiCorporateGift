import { Router } from 'express';
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  listCoupons,
  toggleCoupon,
  updateCoupon,
} from '../controllers/couponController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  couponBodySchema,
  couponUpdateSchema,
  idParamSchema,
  paginationSchema,
} from '../validators/schemas.js';

export const couponRouter = Router();

couponRouter.use(requireAuth);

couponRouter.get('/', validate(paginationSchema, 'query'), listCoupons);
couponRouter.get('/:id', validate(idParamSchema, 'params'), getCoupon);
couponRouter.post('/', validate(couponBodySchema), createCoupon);
couponRouter.patch('/:id', validate(idParamSchema, 'params'), validate(couponUpdateSchema), updateCoupon);
couponRouter.patch('/:id/toggle', validate(idParamSchema, 'params'), toggleCoupon);
couponRouter.delete('/:id', validate(idParamSchema, 'params'), deleteCoupon);