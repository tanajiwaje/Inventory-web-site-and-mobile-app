import * as purchaseRepo from '../repositories/purchaseOrdersRepository';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import * as inventoryService from './inventoryService';
import * as auditLogService from './auditLogService';
import * as usersRepo from '../repositories/usersRepository';

export const getPurchaseOrders = async (
  query: { page?: string; limit?: string },
  user?: { id: string; role: string }
) => {
  const { page, limit, skip } = parsePagination(query);
  if (user?.role === 'seller') {
    const userRecord = await usersRepo.findById(user.id);
    if (!userRecord?.supplierId) {
      return { data: [], pagination: buildPaginationResult(0, page, limit) };
    }
    const [data, total] = await Promise.all([
      purchaseRepo.findPagedBySupplier(String(userRecord.supplierId), skip, limit),
      purchaseRepo.countBySupplier(String(userRecord.supplierId))
    ]);
    return { data, pagination: buildPaginationResult(total, page, limit) };
  }

  const [data, total] = await Promise.all([purchaseRepo.findPaged(skip, limit), purchaseRepo.count()]);
  return { data, pagination: buildPaginationResult(total, page, limit) };
};

export const getPurchaseOrderForPdf = (id: string) => purchaseRepo.findByIdWithDetails(id);

export const createPurchaseOrder = async (data: Record<string, unknown>) => {
  const order = await purchaseRepo.create({ ...data, status: 'requested' });
  await auditLogService.log({
    entity: 'purchase_order',
    entityId: String(order._id),
    action: 'create'
  });

  if (order.status === 'received') {
    for (const line of order.items) {
      await inventoryService.adjustStock({
        itemId: String(line.item),
        type: 'receive',
        quantity: line.quantity,
        reason: 'PO received'
      });
    }
  }

  return order;
};
const sanitizeSupplierUpdate = (data: Record<string, unknown>) => {
  const allowedKeys = new Set([
    'items',
    'expectedDate',
    'deliveryDate',
    'paymentTerms',
    'taxRate',
    'shippingAddress',
    'notes',
    'status'
  ]);
  return Object.fromEntries(Object.entries(data).filter(([key]) => allowedKeys.has(key)));
};

export const updatePurchaseOrder = (id: string, data: Record<string, unknown>, role: string) =>
  (async () => {
    const existing = await purchaseRepo.findById(id);
    if (!existing) {
      return null;
    }
    if (existing.status === 'received') {
      const error = new Error('Purchase order is completed and locked');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }

    let payload = data;
    if (role === 'seller') {
      if (existing.status !== 'requested') {
        const error = new Error('Purchase order cannot be updated at this stage');
        (error as Error & { status?: number }).status = 400;
        throw error;
      }
      payload = sanitizeSupplierUpdate(data);
      payload = { ...payload, status: 'supplier_submitted' };
    } else {
      const nextStatus = payload.status as string | undefined;
      if (nextStatus && nextStatus !== existing.status) {
        const allowed: Record<string, string[]> = {
          requested: ['supplier_submitted'],
          supplier_submitted: ['approved'],
          approved: ['received'],
          received: []
        };
        const allowedNext = allowed[existing.status] ?? [];
        if (!allowedNext.includes(nextStatus)) {
          const error = new Error('Invalid purchase order status transition');
          (error as Error & { status?: number }).status = 400;
          throw error;
        }
      }
    }

    if (payload.status === 'received') {
      const receivedDate = payload.receivedDate as Date | string | undefined;
      if (!receivedDate) {
        const error = new Error('Received date is required');
        (error as Error & { status?: number }).status = 400;
        throw error;
      }
    }

    const updated = await purchaseRepo.updateById(id, payload);
    if (updated) {
      await auditLogService.log({
        entity: 'purchase_order',
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
          reason: 'PO received'
        });
      }
    }

    return updated;
  })();
export const deletePurchaseOrder = (id: string) =>
  (async () => {
    const order = await purchaseRepo.deleteById(id);
    if (order) {
      await auditLogService.log({
        entity: 'purchase_order',
        entityId: String(order._id),
        action: 'delete'
      });
    }
    return order;
  })();
