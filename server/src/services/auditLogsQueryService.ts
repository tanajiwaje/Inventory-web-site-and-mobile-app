import * as auditRepo from '../repositories/auditLogsRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';

export const getAuditLogs = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([auditRepo.findPaged(skip, limit), auditRepo.count()]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
