import { Return } from '../models/Return';

export const findAll = () =>
  Return.find()
    .sort({ createdAt: -1 })
    .populate('items.item', 'name sku');

export const findPaged = (skip: number, limit: number) =>
  Return.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.item', 'name sku');

export const count = () => Return.countDocuments();

export const create = (data: Record<string, unknown>) => Return.create(data);

export const findById = (id: string) => Return.findById(id);

export const updateById = (id: string, data: Record<string, unknown>) =>
  Return.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
    'items.item',
    'name sku'
  );

export const deleteById = (id: string) => Return.findByIdAndDelete(id);
