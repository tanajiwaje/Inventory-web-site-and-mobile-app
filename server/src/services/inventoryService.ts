import * as inventoryRepo from '../repositories/inventoryRepository';
import * as transactionRepo from '../repositories/inventoryTransactionRepository';
import * as auditLogService from './auditLogService';
import * as inventoryStockService from './inventoryStockService';
import { buildPaginationResult, parsePagination } from '../utils/pagination';
import { parse } from 'csv-parse/sync';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getItems = async (query: {
  search?: string;
  category?: string;
  lowStock?: string;
  page?: string;
  limit?: string;
}) => {
  const { search, category, lowStock } = query;
  const filter: Record<string, unknown> = {};

  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { sku: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
  }

  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    inventoryRepo.findPaged(filter, skip, limit),
    inventoryRepo.count(filter)
  ]);

  return {
    data,
    pagination: buildPaginationResult(total, page, limit)
  };
};

export const getItemById = (id: string) => inventoryRepo.findById(id);

export const createItem = async (data: Record<string, unknown>) => {
  if (data.sku) {
    const existing = await inventoryRepo.findBySku(String(data.sku));
    if (existing) {
      const error = new Error('Item with this SKU already exists');
      (error as Error & { status?: number }).status = 409;
      throw error;
    }
  }
  const item = await inventoryRepo.create(data);
  const quantity = Number((data as { quantity?: number }).quantity ?? 0);
  if (quantity > 0) {
    await inventoryStockService.adjustStock({
      itemId: String(item._id),
      delta: quantity
    });
  }
  await auditLogService.log({
    entity: 'inventory_item',
    entityId: String(item._id),
    action: 'create'
  });
  return item;
};

export const updateItem = async (id: string, data: Record<string, unknown>) => {
  if (data.sku) {
    const existing = await inventoryRepo.findBySku(String(data.sku));
    if (existing && String(existing._id) !== id) {
      const error = new Error('Item with this SKU already exists');
      (error as Error & { status?: number }).status = 409;
      throw error;
    }
  }
  const item = await inventoryRepo.updateById(id, data);
  if (item) {
    await auditLogService.log({
      entity: 'inventory_item',
      entityId: String(item._id),
      action: 'update'
    });
  }
  return item;
};

export const deleteItem = async (id: string) => {
  const item = await inventoryRepo.deleteById(id);
  if (item) {
    await auditLogService.log({
      entity: 'inventory_item',
      entityId: String(item._id),
      action: 'delete'
    });
  }
  return item;
};

export const adjustStock = async (payload: {
  itemId: string;
  type: 'receive' | 'issue' | 'adjust';
  quantity: number;
  locationId?: string;
  reason?: string;
}) => {
  const { itemId, type, quantity, reason } = payload;
  const item = await inventoryRepo.findById(itemId);
  if (!item) {
    const error = new Error('Item not found');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  let delta = 0;
  if (type === 'receive') {
    delta = Math.abs(quantity);
  } else if (type === 'issue') {
    delta = -Math.abs(quantity);
  } else if (type === 'adjust') {
    delta = Number(quantity);
  } else {
    const error = new Error('Invalid adjustment type');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const newQuantity = item.quantity + delta;
  if (newQuantity < 0) {
    const error = new Error('Insufficient stock for this adjustment');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  item.quantity = newQuantity;
  await item.save();

  await inventoryStockService.adjustStock({
    itemId: payload.itemId,
    locationId: payload.locationId,
    delta
  });

  const transaction = await transactionRepo.create({
    item: item._id,
    type,
    quantityChange: delta,
    reason
  });

  await auditLogService.log({
    entity: 'inventory_adjustment',
    entityId: String(transaction._id),
    action: 'adjust',
    message: `Adjusted ${delta}`
  });

  return { item, transaction };
};

export const getTransactions = async (query: { itemId?: string; limit?: string; page?: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.itemId) {
    filter.item = query.itemId;
  }
  const { page, limit, skip } = parsePagination(query);
  const [data, total] = await Promise.all([
    transactionRepo.findPaged(filter, skip, limit),
    transactionRepo.count(filter)
  ]);
  return {
    data,
    pagination: buildPaginationResult(total, page, limit)
  };
};

export const getReportSummary = async () => {
  const result = await inventoryRepo.aggregateSummary();
  return result[0] ?? { totalItems: 0, totalQuantity: 0, lowStockCount: 0 };
};

export const getReportValuation = async () => {
  const result = await inventoryRepo.aggregateValuation();
  return result[0] ?? { totalValue: 0, totalCost: 0 };
};

export const getStockByLocation = (query: { page?: string; limit?: string }) =>
  inventoryStockService.getStockPaged(query);

export const exportItemsCsv = async () => {
  const items = await inventoryRepo.findAll({});
  const headers = [
    'name',
    'sku',
    'quantity',
    'cost',
    'price',
    'barcode',
    'category',
    'lowStockThreshold',
    'description'
  ];
  const lines = [headers.join(',')];
  for (const item of items) {
    const row = [
      item.name,
      item.sku,
      item.quantity,
      item.cost,
      item.price,
      item.barcode ?? '',
      item.category ?? '',
      item.lowStockThreshold ?? 0,
      item.description ?? ''
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
    lines.push(row);
  }
  return lines.join('\n');
};

export const importItemsCsv = async (fileBuffer: Buffer) => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  for (const record of records) {
    const payload = {
      name: record.name,
      sku: record.sku,
      quantity: Number(record.quantity || 0),
      cost: Number(record.cost || 0),
      price: Number(record.price || 0),
      barcode: record.barcode || undefined,
      category: record.category || undefined,
      lowStockThreshold: Number(record.lowStockThreshold || 0),
      description: record.description || undefined
    };

    const existing = await inventoryRepo.findBySku(payload.sku);
    if (existing) {
      const prevQty = existing.quantity;
      const updated = await inventoryRepo.updateById(String(existing._id), payload);
      if (updated) {
        const delta = updated.quantity - prevQty;
        if (delta !== 0) {
          await inventoryStockService.adjustStock({
            itemId: String(updated._id),
            delta
          });
        }
      }
    } else {
      const created = await inventoryRepo.create(payload);
      if (created.quantity > 0) {
        await inventoryStockService.adjustStock({
          itemId: String(created._id),
          delta: created.quantity
        });
      }
    }
  }

  await auditLogService.log({
    entity: 'inventory_item',
    entityId: 'bulk',
    action: 'import',
    message: `Imported ${records.length} items`
  });

  return { imported: records.length };
};
