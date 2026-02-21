import { InventoryStock } from '../models/InventoryStock';

export const findByItemAndLocation = (item: string, location: string) =>
  InventoryStock.findOne({ item, location });

export const create = (data: Record<string, unknown>) => InventoryStock.create(data);

export const updateById = (id: string, data: Record<string, unknown>) =>
  InventoryStock.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const findPaged = (skip: number, limit: number) =>
  InventoryStock.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('item', 'name sku')
    .populate('location', 'name code');

export const count = () => InventoryStock.countDocuments();
