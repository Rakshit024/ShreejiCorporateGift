import { Router } from 'express';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  toggleBlocked,
  updateCustomer,
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  customerBodySchema,
  customerListSchema,
  customerUpdateSchema,
  idParamSchema,
} from '../validators/schemas.js';

export const customerRouter = Router();

customerRouter.use(requireAuth);

customerRouter.get('/', validate(customerListSchema, 'query'), listCustomers);
customerRouter.get('/:id', validate(idParamSchema, 'params'), getCustomer);
customerRouter.post('/', validate(customerBodySchema), createCustomer);
customerRouter.patch('/:id', validate(idParamSchema, 'params'), validate(customerUpdateSchema), updateCustomer);
customerRouter.patch('/:id/block', validate(idParamSchema, 'params'), toggleBlocked);
customerRouter.delete('/:id', validate(idParamSchema, 'params'), deleteCustomer);