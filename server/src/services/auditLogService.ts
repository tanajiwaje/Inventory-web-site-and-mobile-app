import * as auditRepo from '../repositories/auditLogsRepository';

export const log = (payload: {
  entity: string;
  entityId: string;
  action: string;
  message?: string;
  userId?: string;
}) => auditRepo.create(payload);
