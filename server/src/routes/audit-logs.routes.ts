import { Router } from 'express';

import { getAuditLogs } from '../controllers/auditLogsController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', authorizeRoles(...adminRoles), getAuditLogs);

export default router;
