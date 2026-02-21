import { Request, Response, NextFunction } from 'express';

import * as purchaseOrdersService from '../services/purchaseOrdersService';
import { streamPurchaseOrderPdf } from '../utils/pdf';

const handleServiceError = (res: Response, error: unknown) => {
  const status = (error as Error & { status?: number }).status;
  if (status) {
    res.status(status).json({ message: error instanceof Error ? error.message : 'Request failed' });
    return true;
  }
  return false;
};

export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } }).user;
    const result = await purchaseOrdersService.getPurchaseOrders(
      req.query as { page?: string; limit?: string },
      user
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await purchaseOrdersService.createPurchaseOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const updatePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req as Request & { user?: { role?: string } }).user?.role ?? 'unknown';
    const order = await purchaseOrdersService.updatePurchaseOrder(req.params.id, req.body, role);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await purchaseOrdersService.deletePurchaseOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrderPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await purchaseOrdersService.getPurchaseOrderForPdf(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    streamPurchaseOrderPdf(res, order);
  } catch (error) {
    next(error);
  }
};
