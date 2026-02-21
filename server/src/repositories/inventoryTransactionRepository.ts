import { InventoryTransaction } from '../models/InventoryTransaction';

export const create = (data: Record<string, unknown>) => InventoryTransaction.create(data);

export const findPaged = (filter: Record<string, unknown>, skip: number, limit: number) =>
  InventoryTransaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('item', 'name sku');

export const count = (filter: Record<string, unknown>) => InventoryTransaction.countDocuments(filter);
