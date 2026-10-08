import { Router } from 'express';
import { changePassword, login, me, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, loginSchema } from '../validators/schemas.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', requireAuth, me);
authRouter.patch('/me', requireAuth, updateProfile);
authRouter.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);