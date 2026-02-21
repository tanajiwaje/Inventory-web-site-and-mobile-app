import { Router } from 'express';
import multer from 'multer';

import {
  adjustStock,
  createItem,
  deleteItem,
  exportItemsCsv,
  getItemById,
  getItems,
  getReportSummary,
  getReportValuation,
  getStockByLocation,
  getTransactions,
  importItemsCsv,
  updateItem
} from '../controllers/inventoryController';
import { authorizeRoles } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const adminRoles = ['admin', 'super_admin'];

router.get('/', getItems);
router.get('/report/summary', getReportSummary);
router.get('/report/valuation', getReportValuation);
router.get('/transactions', getTransactions);
router.get('/stocks', getStockByLocation);
router.get('/export', authorizeRoles(...adminRoles), exportItemsCsv);
router.post('/import', authorizeRoles(...adminRoles), upload.single('file'), importItemsCsv);
router.post('/adjust', authorizeRoles(...adminRoles), adjustStock);
router.get('/:id', getItemById);
router.post('/', authorizeRoles(...adminRoles), createItem);
router.put('/:id', authorizeRoles(...adminRoles), updateItem);
router.delete('/:id', authorizeRoles(...adminRoles), deleteItem);

export default router;

