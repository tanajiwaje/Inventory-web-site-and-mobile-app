import { Supplier } from '../models/Supplier';

export const findAll = () => Supplier.find().sort({ createdAt: -1 });
export const findPaged = (skip: number, limit: number) =>
  Supplier.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
export const count = () => Supplier.countDocuments();
export const create = (data: Record<string, unknown>) => Supplier.create(data);
export const updateById = (id: string, data: Record<string, unknown>) =>
  Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const deleteById = (id: string) => Supplier.findByIdAndDelete(id);
