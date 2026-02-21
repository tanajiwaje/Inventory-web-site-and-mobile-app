import { Request, Response, NextFunction } from 'express';

import * as returnsService from '../services/returnsService';

const handleServiceError = (res: Response, error: unknown) => {
  const status = (error as Error & { status?: number }).status;
  if (status) {
    res.status(status).json({ message: error instanceof Error ? error.message : 'Request failed' });
    return true;
  }
  return false;
};

export const getReturns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await returnsService.getReturns(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await returnsService.createReturn(req.body);
    res.status(201).json(entry);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const updateReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await returnsService.updateReturn(req.params.id, req.body);
    if (!entry) {
      return res.status(404).json({ message: 'Return not found' });
    }
    res.json(entry);
  } catch (error) {
    if (handleServiceError(res, error)) return;
    next(error);
  }
};

export const deleteReturn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await returnsService.deleteReturn(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Return not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
