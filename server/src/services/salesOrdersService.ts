import * as salesRepo from '../repositories/salesOrdersRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as inventoryRepo from '../repositories/inventoryRepository';
import * as inventoryService from './inventoryService';
import * as auditLogService from './auditLogService';
import * as usersRepo from '../repositories/usersRepository';

export const getSalesOrders = async (
  query: { page?: string; limit?: string },
  user?: { id: string; role: string }
) => {
  const { page, limit, skip } = parsePagination(query);
  if (user?.role === 'buyer') {
    const userRecord = await usersRepo.findById(user.id);
    if (!userRecord?.customerId) {
      return { data: [], pagination: buildPaginationResult(0, page, limit) };
    }
    const [data, total] = await Promise.all([
      salesRepo.findPagedByCustomer(String(userRecord.customerId), skip, limit),
      salesRepo.countByCustomer(String(userRecord.customerId))
    ]);
    return { data, pagination: buildPaginationResult(total, page, limit) };
  }

  const [data, total] = await Promise.all([salesRepo.findPaged(skip, limit), salesRepo.count()]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};

export const getSalesOrderForPdf = (id: string) => salesRepo.findByIdWithDetails(id);

export const createSalesOrder = async (data: Record<string, unknown>, role: string) => {
  if (role === 'buyer') {
    if (data.status && data.status !== 'requested') {
      const error = new Error('Buyers can only create requested sales orders');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }
    data = { ...data, status: 'requested' };
  }

  const order = await salesRepo.create(data);
  await auditLogService.log({
    entity: 'sales_order',
    entityId: String(order._id),
    action: 'create'
  });

  if (order.status === 'received') {
    for (const line of order.items) {
      const item = await inventoryRepo.findById(String(line.item));
      if (item && item.quantity < line.quantity) {
        const error = new Error('Insufficient stock to fulfill order');
        (error as Error & { status?: number }).status = 400;
        throw error;
      }
      await inventoryService.adjustStock({
        itemId: String(line.item),
        type: 'issue',
        quantity: line.quantity,
        reason: 'SO received'
      });
    }
  }

  return order;
};
const sanitizeBuyerUpdate = (data: Record<string, unknown>) => {
  const allowedKeys = new Set([
    'items',
    'notes',
    'paymentTerms',
    'deliveryDate',
    'taxRate',
    'shippingAddress'
  ]);
  return Object.fromEntries(Object.entries(data).filter(([key]) => allowedKeys.has(key)));
};

export const updateSalesOrder = (id: string, data: Record<string, unknown>, role: string) =>
  (async () => {
    const existing = await salesRepo.findById(id);
    if (!existing) {
      return null;
    }
    let payload = data;
    if (role === 'buyer') {
      const nextStatus = payload.status as string | undefined;
      if (nextStatus && nextStatus !== existing.status) {
        if (existing.status !== 'approved' || nextStatus !== 'received') {
          const error = new Error('Sales order cannot be updated at this stage');
          (error as Error & { status?: number }).status = 400;
          throw error;
        }
        if (!payload.receivedDate) {
          const error = new Error('Received date is required');
          (error as Error & { status?: number }).status = 400;
          throw error;
        }
        payload = { status: 'received', receivedDate: payload.receivedDate };
      } else {
        if (existing.status !== 'requested') {
          const error = new Error('Sales order cannot be updated at this stage');
          (error as Error & { status?: number }).status = 400;
          throw error;
        }
        payload = sanitizeBuyerUpdate(data);
      }
    } else {
      const nextStatus = payload.status as string | undefined;
      if (nextStatus && nextStatus !== existing.status) {
        const allowed: Record<string, string[]> = {
          requested: ['approved'],
          approved: ['received'],
          received: []
        };
        const allowedNext = allowed[existing.status] ?? [];
        if (!allowedNext.includes(nextStatus)) {
          const error = new Error('Invalid sales order status transition');
          (error as Error & { status?: number }).status = 400;
          throw error;
        }
        if (nextStatus === 'approved') {
          for (const line of existing.items) {
            const item = await inventoryRepo.findById(String(line.item));
            if (item && item.quantity < line.quantity) {
              const error = new Error('Out of stock for one or more items');
              (error as Error & { status?: number }).status = 400;
              throw error;
            }
          }
          for (const line of existing.items) {
            await inventoryService.adjustStock({
              itemId: String(line.item),
              type: 'issue',
              quantity: line.quantity,
              reason: 'SO approved'
            });
          }
          payload = { ...payload, approvedDate: new Date() };
        }
        if (nextStatus === 'received') {
          const receivedDate = payload.receivedDate as Date | string | undefined;
          if (!receivedDate) {
            const error = new Error('Received date is required');
            (error as Error & { status?: number }).status = 400;
            throw error;
          }
        }
      }
    }

    const updated = await salesRepo.updateById(id, payload);
    if (updated) {
      await auditLogService.log({
        entity: 'sales_order',
        entityId: String(updated._id),
        action: 'update'
      });
    }

    return updated;
  })();
export const deleteSalesOrder = (id: string) =>
  (async () => {
    const order = await salesRepo.deleteById(id);
    if (order) {
      await auditLogService.log({
        entity: 'sales_order',
        entityId: String(order._id),
        action: 'delete'
      });
    }
    return order;
  })();
