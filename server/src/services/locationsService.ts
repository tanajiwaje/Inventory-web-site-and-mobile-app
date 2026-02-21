import * as locationsRepo from '../repositories/locationsRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as auditLogService from './auditLogService';

export const getLocations = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    locationsRepo.findPaged(skip, limit),
    locationsRepo.count()
  ]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
export const createLocation = async (data: Record<string, unknown>) => {
  const location = await locationsRepo.create(data);
  await auditLogService.log({
    entity: 'location',
    entityId: String(location._id),
    action: 'create'
  });
  return location;
};
export const updateLocation = (id: string, data: Record<string, unknown>) =>
  (async () => {
    const location = await locationsRepo.updateById(id, data);
    if (location) {
      await auditLogService.log({
        entity: 'location',
        entityId: String(location._id),
        action: 'update'
      });
    }
    return location;
  })();
export const deleteLocation = (id: string) =>
  (async () => {
    const location = await locationsRepo.deleteById(id);
    if (location) {
      await auditLogService.log({
        entity: 'location',
        entityId: String(location._id),
        action: 'delete'
      });
    }
    return location;
  })();
