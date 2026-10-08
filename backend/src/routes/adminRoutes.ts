import { Router } from 'express';
import {
  dashboardStats,
  deleteImage,
  healthStatus,
  stockAlerts,
  uploadImages,
} from '../controllers/adminController.js';
import { getSettingsHandler, updateSettings } from '../controllers/settingController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { settingBodySchema } from '../validators/schemas.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);
settingsRouter.get('/', getSettingsHandler);
settingsRouter.put('/', validate(settingBodySchema), updateSettings);

export const uploadRouter = Router();
uploadRouter.use(requireAuth);
uploadRouter.post('/images', upload.array('images', 10), uploadImages);
uploadRouter.post('/image', upload.single('image'), uploadImages);
uploadRouter.delete('/image', deleteImage);

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.get('/dashboard', dashboardStats);
adminRouter.get('/stock-alerts', stockAlerts);
adminRouter.get('/health', healthStatus);