import { Router } from 'express';

import { approveUser, getPendingUsers, rejectUser } from '../controllers/usersController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/pending', authorizeRoles(...adminRoles), getPendingUsers);
router.post('/:id/approve', authorizeRoles(...adminRoles), approveUser);
router.post('/:id/reject', authorizeRoles(...adminRoles), rejectUser);

export default router;
