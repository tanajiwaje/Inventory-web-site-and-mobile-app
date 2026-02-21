import { Request, Response } from 'express';

import * as reportsService from '../services/reportsService';

export const getAdminDashboard = async (_req: Request, res: Response) => {
  const dashboard = await reportsService.getAdminDashboard();
  res.json(dashboard);
};
