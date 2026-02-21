import { Router } from 'express';

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer
} from '../controllers/customersController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];

router.get('/', getCustomers);
router.post('/', authorizeRoles(...adminRoles), createCustomer);
router.put('/:id', authorizeRoles(...adminRoles), updateCustomer);
router.delete('/:id', authorizeRoles(...adminRoles), deleteCustomer);

export default router;
