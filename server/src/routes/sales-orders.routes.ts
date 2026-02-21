import { Router } from 'express';

import {
  createSalesOrder,
  deleteSalesOrder,
  getSalesOrderPdf,
  getSalesOrders,
  updateSalesOrder
} from '../controllers/salesOrdersController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];
const buyerRoles = ['buyer'];

router.get('/', getSalesOrders);
router.get('/:id/pdf', authorizeRoles(...adminRoles, ...buyerRoles), getSalesOrderPdf);
router.post('/', authorizeRoles(...adminRoles, ...buyerRoles), createSalesOrder);
router.put('/:id', authorizeRoles(...adminRoles, ...buyerRoles), updateSalesOrder);
router.delete('/:id', authorizeRoles(...adminRoles), deleteSalesOrder);

export default router;
