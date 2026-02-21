import { Request, Response, NextFunction } from 'express';

import * as authService from '../services/authService';

const handleAuthError = (res: Response, error: unknown) => {
  const status = (error as Error & { status?: number }).status;
  if (status) {
    res.status(status).json({ message: error instanceof Error ? error.message : 'Request failed' });
    return true;
  }
  return false;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      gstNumber: user.gstNumber,
      supplierId: user.supplierId,
      customerId: user.customerId
    });
  } catch (error) {
    if (handleAuthError(res, error)) return;
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    res.json({
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status,
        phone: result.user.phone,
        address: result.user.address,
        companyName: result.user.companyName,
        gstNumber: result.user.gstNumber,
        supplierId: result.user.supplierId,
        customerId: result.user.customerId
      }
    });
  } catch (error) {
    if (handleAuthError(res, error)) return;
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await authService.getMe(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      gstNumber: user.gstNumber,
      supplierId: user.supplierId,
      customerId: user.customerId
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await authService.updateMe(userId, req.body ?? {});
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      gstNumber: user.gstNumber,
      supplierId: user.supplierId,
      customerId: user.customerId
    });
  } catch (error) {
    next(error);
  }
};
