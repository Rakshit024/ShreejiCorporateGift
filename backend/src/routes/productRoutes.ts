import { Router } from 'express';
import {
  adjustStock,
  bulkAction,
  bulkAdjustPrices,
  createProduct,
  deleteProduct,
  duplicateProduct,
  getProduct,
  listProducts,
  toggleAvailability,
  toggleFeatured,
  updateProduct,
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  bulkProductActionSchema,
  idParamSchema,
  productBodySchema,
  productListSchema,
  productUpdateSchema,
} from '../validators/schemas.js';

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get('/', validate(productListSchema, 'query'), listProducts);
productRouter.post('/bulk-action', validate(bulkProductActionSchema), bulkAction);
productRouter.post('/bulk-adjust-prices', bulkAdjustPrices);

productRouter.get('/:id', validate(idParamSchema, 'params'), getProduct);
productRouter.post('/', validate(productBodySchema), createProduct);
productRouter.patch('/:id', validate(idParamSchema, 'params'), validate(productUpdateSchema), updateProduct);
productRouter.delete('/:id', validate(idParamSchema, 'params'), deleteProduct);
productRouter.post('/:id/duplicate', validate(idParamSchema, 'params'), duplicateProduct);
productRouter.patch('/:id/availability', validate(idParamSchema, 'params'), toggleAvailability);
productRouter.patch('/:id/featured', validate(idParamSchema, 'params'), toggleFeatured);
productRouter.patch('/:id/stock', validate(idParamSchema, 'params'), adjustStock);