import { Request, Response, NextFunction } from 'express';

import * as inventoryService from '../services/inventoryService';

const respondServiceError = (res: Response, error: unknown) => {
  const status = (error as Error & { status?: number }).status;
  if (status) {
    res.status(status).json({ message: error instanceof Error ? error.message : 'Request failed' });
    return true;
  }
  return false;
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await inventoryService.getItems(req.query as {
      search?: string;
      category?: string;
      lowStock?: string;
      page?: string;
      limit?: string;
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    if (respondServiceError(res, error)) return;
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    if (respondServiceError(res, error)) return;
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.deleteItem(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId, type, quantity } = req.body as {
      itemId: string;
      type: 'receive' | 'issue' | 'adjust';
      quantity: number;
    };
    if (!itemId || !type || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'itemId, type, and quantity are required' });
    }

    const result = await inventoryService.adjustStock(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (respondServiceError(res, error)) return;
    next(error);
  }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await inventoryService.getTransactions(req.query as {
      itemId?: string;
      limit?: string;
      page?: string;
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getReportSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await inventoryService.getReportSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const getReportValuation = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const valuation = await inventoryService.getReportValuation();
    res.json(valuation);
  } catch (error) {
    next(error);
  }
};

export const getStockByLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await inventoryService.getStockByLocation(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const exportItemsCsv = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await inventoryService.exportItemsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="items.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const importItemsCsv = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }
    const result = await inventoryService.importItemsCsv(file.buffer);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
