import { InventoryItem } from '../models/InventoryItem';

export const findAll = (filter: Record<string, unknown>) =>
  InventoryItem.find(filter).sort({ createdAt: -1 });

export const findPaged = (filter: Record<string, unknown>, skip: number, limit: number) =>
  InventoryItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

export const count = (filter: Record<string, unknown>) => InventoryItem.countDocuments(filter);

export const findById = (id: string) => InventoryItem.findById(id);

export const findBySku = (sku: string) => InventoryItem.findOne({ sku });

export const create = (data: Record<string, unknown>) => InventoryItem.create(data);

export const updateById = (id: string, data: Record<string, unknown>) =>
  InventoryItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteById = (id: string) => InventoryItem.findByIdAndDelete(id);

export const aggregateSummary = () =>
  InventoryItem.aggregate([
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        lowStockCount: {
          $sum: {
            $cond: [{ $lte: ['$quantity', '$lowStockThreshold'] }, 1, 0]
          }
        }
      }
    }
  ]);

export const aggregateValuation = () =>
  InventoryItem.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
        totalCost: { $sum: { $multiply: ['$quantity', '$cost'] } }
      }
    }
  ]);

export const aggregateCategorySummary = () =>
  InventoryItem.aggregate([
    {
      $project: {
        category: { $ifNull: ['$category', 'Uncategorized'] },
        quantity: '$quantity',
        value: { $multiply: ['$quantity', '$price'] }
      }
    },
    {
      $group: {
        _id: '$category',
        quantity: { $sum: '$quantity' },
        value: { $sum: '$value' }
      }
    },
    { $sort: { value: -1 } }
  ]);

export const aggregateTopItems = () =>
  InventoryItem.aggregate([
    {
      $project: {
        name: 1,
        sku: 1,
        quantity: 1,
        value: { $multiply: ['$quantity', '$price'] }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: 10 }
  ]);
