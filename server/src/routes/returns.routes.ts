import { Router } from 'express';

import {
  createReturn,
  deleteReturn,
  getReturns,
  updateReturn
} from '../controllers/returnsController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', getReturns);
router.post('/', authorizeRoles(...adminRoles), createReturn);
router.put('/:id', authorizeRoles(...adminRoles), updateReturn);
router.delete('/:id', authorizeRoles(...adminRoles), deleteReturn);

export default router;
