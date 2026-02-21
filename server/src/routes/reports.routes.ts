import { Router } from 'express';

import { getAdminDashboard } from '../controllers/reportsController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/dashboard', authorizeRoles(...adminRoles), getAdminDashboard);

export default router;
