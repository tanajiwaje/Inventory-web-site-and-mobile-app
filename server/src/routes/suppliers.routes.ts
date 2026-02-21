import { Router } from 'express';

import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier
} from '../controllers/suppliersController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', getSuppliers);
router.post('/', authorizeRoles(...adminRoles), createSupplier);
router.put('/:id', authorizeRoles(...adminRoles), updateSupplier);
router.delete('/:id', authorizeRoles(...adminRoles), deleteSupplier);

export default router;
