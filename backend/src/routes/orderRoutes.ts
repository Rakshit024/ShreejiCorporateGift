import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  orderSummary,
  updateOrder,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  idParamSchema,
  orderBodySchema,
  orderListSchema,
  orderUpdateSchema,
} from '../validators/schemas.js';

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.get('/', validate(orderListSchema, 'query'), listOrders);
orderRouter.get('/summary', orderSummary);
orderRouter.get('/:id', validate(idParamSchema, 'params'), getOrder);
orderRouter.post('/', validate(orderBodySchema), createOrder);
orderRouter.patch('/:id', validate(idParamSchema, 'params'), validate(orderUpdateSchema), updateOrder);
orderRouter.delete('/:id', validate(idParamSchema, 'params'), deleteOrder);