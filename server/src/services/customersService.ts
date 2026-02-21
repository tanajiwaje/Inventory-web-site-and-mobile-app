import * as customersRepo from '../repositories/customersRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as auditLogService from './auditLogService';

export const getCustomers = async (query: { page?: string; limit?: string }) => {
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    customersRepo.findPaged(skip, limit),
    customersRepo.count()
  ]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};
export const createCustomer = async (data: Record<string, unknown>) => {
  const customer = await customersRepo.create(data);
  await auditLogService.log({
    entity: 'customer',
    entityId: String(customer._id),
    action: 'create'
  });
  return customer;
};
export const updateCustomer = (id: string, data: Record<string, unknown>) =>
  (async () => {
    const customer = await customersRepo.updateById(id, data);
    if (customer) {
      await auditLogService.log({
        entity: 'customer',
        entityId: String(customer._id),
        action: 'update'
      });
    }
    return customer;
  })();
export const deleteCustomer = (id: string) =>
  (async () => {
    const customer = await customersRepo.deleteById(id);
    if (customer) {
      await auditLogService.log({
        entity: 'customer',
        entityId: String(customer._id),
        action: 'delete'
      });
    }
    return customer;
  })();
