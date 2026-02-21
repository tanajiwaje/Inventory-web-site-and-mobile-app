import { Router } from 'express';

import { getCompanySettings, updateCompanySettings } from '../controllers/companySettingsController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', authorizeRoles(...adminRoles), getCompanySettings);
router.put('/', authorizeRoles(...adminRoles), updateCompanySettings);

export default router;
