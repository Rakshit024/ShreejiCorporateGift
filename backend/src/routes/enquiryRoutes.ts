import { Router } from 'express';
import {
  createEnquiry,
  deleteEnquiry,
  enquirySummary,
  getEnquiry,
  listEnquiries,
  updateEnquiry,
} from '../controllers/enquiryController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  enquiryBodySchema,
  enquiryListSchema,
  enquiryUpdateSchema,
  idParamSchema,
} from '../validators/schemas.js';

export const enquiryRouter = Router();

enquiryRouter.use(requireAuth);

enquiryRouter.get('/', validate(enquiryListSchema, 'query'), listEnquiries);
enquiryRouter.get('/summary', enquirySummary);
enquiryRouter.get('/:id', validate(idParamSchema, 'params'), getEnquiry);
enquiryRouter.post('/', validate(enquiryBodySchema), createEnquiry);
enquiryRouter.patch('/:id', validate(idParamSchema, 'params'), validate(enquiryUpdateSchema), updateEnquiry);
enquiryRouter.delete('/:id', validate(idParamSchema, 'params'), deleteEnquiry);