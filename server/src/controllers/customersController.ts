import { Request, Response, NextFunction } from 'express';

import * as customersService from '../services/customersService';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customersService.getCustomers(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customersService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customersService.updateCustomer(req.params.id, req.body);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await customersService.deleteCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
