import { Router } from 'express';

import {
  createPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderPdf,
  getPurchaseOrders,
  updatePurchaseOrder
} from '../controllers/purchaseOrdersController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const adminRoles = ['admin', 'super_admin'];
const sellerRoles = ['seller'];

router.get('/', getPurchaseOrders);
router.get('/:id/pdf', authorizeRoles(...adminRoles, ...sellerRoles), getPurchaseOrderPdf);
router.post('/', authorizeRoles(...adminRoles), createPurchaseOrder);
router.put('/:id', authorizeRoles(...adminRoles, ...sellerRoles), updatePurchaseOrder);
router.delete('/:id', authorizeRoles(...adminRoles), deletePurchaseOrder);

export default router;
