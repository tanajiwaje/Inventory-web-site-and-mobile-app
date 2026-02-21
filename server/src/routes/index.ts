import { Router } from 'express';

import inventoryRoutes from './inventory.routes';
import suppliersRoutes from './suppliers.routes';
import customersRoutes from './customers.routes';
import locationsRoutes from './locations.routes';
import purchaseOrdersRoutes from './purchase-orders.routes';
import salesOrdersRoutes from './sales-orders.routes';
import returnsRoutes from './returns.routes';
import auditLogsRoutes from './audit-logs.routes';
import usersRoutes from './users.routes';
import reportsRoutes from './reports.routes';
import companyRoutes from './company.routes';

const router = Router();

router.use('/inventory', inventoryRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/customers', customersRoutes);
router.use('/locations', locationsRoutes);
router.use('/purchase-orders', purchaseOrdersRoutes);
router.use('/sales-orders', salesOrdersRoutes);
router.use('/returns', returnsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/users', usersRoutes);
router.use('/reports', reportsRoutes);
router.use('/company', companyRoutes);

export default router;
