import * as suppliersRepo from '../repositories/suppliersRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as auditLogService from './auditLogService';

export const getSuppliers = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    suppliersRepo.findPaged(skip, limit),
    suppliersRepo.count()
  ]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
export const createSupplier = async (data: Record<string, unknown>) => {
  const supplier = await suppliersRepo.create(data);
  await auditLogService.log({
    entity: 'supplier',
    entityId: String(supplier._id),
    action: 'create'
  });
  return supplier;
};
export const updateSupplier = (id: string, data: Record<string, unknown>) =>
  (async () => {
    const supplier = await suppliersRepo.updateById(id, data);
    if (supplier) {
      await auditLogService.log({
        entity: 'supplier',
        entityId: String(supplier._id),
        action: 'update'
      });
    }
    return supplier;
  })();
export const deleteSupplier = (id: string) =>
  (async () => {
    const supplier = await suppliersRepo.deleteById(id);
    if (supplier) {
      await auditLogService.log({
        entity: 'supplier',
        entityId: String(supplier._id),
        action: 'delete'
      });
    }
    return supplier;
  })();
