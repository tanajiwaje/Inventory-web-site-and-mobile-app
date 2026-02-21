import { Router } from 'express';

import { getCompanySettings } from '../controllers/companySettingsController';

const router = Router();

router.get('/company', getCompanySettings);

export default router;
