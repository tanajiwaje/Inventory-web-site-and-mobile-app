import { Request, Response } from 'express';

import * as companySettingsService from '../services/companySettingsService';

export const getCompanySettings = async (_req: Request, res: Response) => {
  const settings = await companySettingsService.getSettings();
  res.json(settings);
};

export const updateCompanySettings = async (req: Request, res: Response) => {
  const settings = await companySettingsService.updateSettings(req.body);
  res.json(settings);
};
