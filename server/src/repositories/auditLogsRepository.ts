import { AuditLog } from '../models/AuditLog';

export const create = (data: Record<string, unknown>) => AuditLog.create(data);
export const findPaged = (skip: number, limit: number) =>
  AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
export const count = () => AuditLog.countDocuments();
