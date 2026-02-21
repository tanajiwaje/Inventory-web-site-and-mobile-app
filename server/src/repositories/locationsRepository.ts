import { Location } from '../models/Location';

export const findAll = () => Location.find().sort({ createdAt: -1 });
export const findPaged = (skip: number, limit: number) =>
  Location.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
export const count = () => Location.countDocuments();
export const create = (data: Record<string, unknown>) => Location.create(data);
export const updateById = (id: string, data: Record<string, unknown>) =>
  Location.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const deleteById = (id: string) => Location.findByIdAndDelete(id);
