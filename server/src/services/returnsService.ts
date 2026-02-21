import * as returnsRepo from '../repositories/returnsRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as inventoryService from './inventoryService';
import * as auditLogService from './auditLogService';

export const getReturns = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    returnsRepo.findPaged(skip, limit),
    returnsRepo.count()
  ]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
export const createReturn = async (data: Record<string, unknown>) => {
  const entry = await returnsRepo.create(data);
  await auditLogService.log({
    entity: 'return',
    entityId: String(entry._id),
    action: 'create'
  });

  if (entry.status === 'received') {
    for (const line of entry.items) {
      await inventoryService.adjustStock({
        itemId: String(line.item),
        type: 'receive',
        quantity: line.quantity,
        reason: 'Return received'
      });
    }
  }

  return entry;
};
export const updateReturn = (id: string, data: Record<string, unknown>) =>
  (async () => {
    const existing = await returnsRepo.findById(id);
    const updated = await returnsRepo.updateById(id, data);
    if (updated) {
      await auditLogService.log({
        entity: 'return',
        entityId: String(updated._id),
        action: 'update'
      });
    }

    if (existing && updated && existing.status !== 'received' && updated.status === 'received') {
      for (const line of updated.items) {
        await inventoryService.adjustStock({
          itemId: String(line.item),
          type: 'receive',
          quantity: line.quantity,
          reason: 'Return received'
        });
      }
    }

    return updated;
  })();
export const deleteReturn = (id: string) =>
  (async () => {
    const entry = await returnsRepo.deleteById(id);
    if (entry) {
      await auditLogService.log({
        entity: 'return',
        entityId: String(entry._id),
        action: 'delete'
      });
    }
    return entry;
  })();
