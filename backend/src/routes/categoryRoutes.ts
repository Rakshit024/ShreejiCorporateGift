import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  listCategoryOptions,
  pruneEmptyCategories,
  reorderCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  categoryBodySchema,
  categoryListSchema,
  categoryUpdateSchema,
  idParamSchema,
} from '../validators/schemas.js';

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get('/', validate(categoryListSchema, 'query'), listCategories);
categoryRouter.get('/options', listCategoryOptions);
categoryRouter.post('/prune-empty', pruneEmptyCategories);
categoryRouter.post('/reorder', reorderCategories);

categoryRouter.get('/:id', validate(idParamSchema, 'params'), getCategory);
categoryRouter.post('/', validate(categoryBodySchema), createCategory);
categoryRouter.patch('/:id', validate(idParamSchema, 'params'), validate(categoryUpdateSchema), updateCategory);
categoryRouter.delete('/:id', validate(idParamSchema, 'params'), deleteCategory);