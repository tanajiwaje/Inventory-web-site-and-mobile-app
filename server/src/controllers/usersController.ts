import { Request, Response, NextFunction } from 'express';

import * as usersService from '../services/usersService';

export const getPendingUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.listPendingUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.approveUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const rejectUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.rejectUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
