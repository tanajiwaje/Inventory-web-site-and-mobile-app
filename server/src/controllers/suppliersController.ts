import { Request, Response, NextFunction } from 'express';

import * as suppliersService from '../services/suppliersService';

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await suppliersService.getSuppliers(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await suppliersService.createSupplier(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await suppliersService.updateSupplier(req.params.id, req.body);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await suppliersService.deleteSupplier(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
