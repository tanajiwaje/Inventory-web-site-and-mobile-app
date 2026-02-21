import { Request, Response, NextFunction } from 'express';

import * as auditLogsService from '../services/auditLogsQueryService';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditLogsService.getAuditLogs(req.query as { page?: string; limit?: string });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
