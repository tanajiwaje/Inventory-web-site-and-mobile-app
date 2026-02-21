import { Customer } from '../models/Customer';

export const findAll = () => Customer.find().sort({ createdAt: -1 });
export const findPaged = (skip: number, limit: number) =>
  Customer.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
export const count = () => Customer.countDocuments();
export const create = (data: Record<string, unknown>) => Customer.create(data);
export const updateById = (id: string, data: Record<string, unknown>) =>
  Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const deleteById = (id: string) => Customer.findByIdAndDelete(id);
