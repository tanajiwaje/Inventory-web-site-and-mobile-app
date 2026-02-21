import { Request, Response, NextFunction } from 'express';

import * as salesOrdersService from '../services/salesOrdersService';
import { streamSalesOrderPdf } from '../utils/pdf';

const handleServiceError = (res: Response, error: unknown) => {
  const status = (error as Error & { status?: number }).status;
  if (status) {
    res.status(status).json({ message: error instanceof Error ? error.message : 'Request failed' });
    return true;
  }
  return false;
};

export const getSalesOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as Request & { user?: { id: string; role: string } }).user;
    const result = await salesOrdersService.getSalesOrders(
      req.query as { page?: string; limit?: string },
      user
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req as Request & { user?: { role?: string } }).user?.role ?? 'unknown';
    const order = await salesOrdersService.createSalesOrder(req.body, role);
    res.status(201).json(order);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const updateSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req as Request & { user?: { role?: string } }).user?.role ?? 'unknown';
    const order = await salesOrdersService.updateSalesOrder(req.params.id, req.body, role);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }
    res.json(order);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const deleteSalesOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await salesOrdersService.deleteSalesOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSalesOrderPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await salesOrdersService.getSalesOrderForPdf(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }
    streamSalesOrderPdf(res, order);
  } catch (error) {
    next(error);
  }
};
