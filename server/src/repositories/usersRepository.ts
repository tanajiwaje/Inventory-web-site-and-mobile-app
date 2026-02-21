import { User } from '../models/User';

export const findByEmail = (email: string) => User.findOne({ email: email.toLowerCase() });
export const create = (data: Record<string, unknown>) => User.create(data);
export const findById = (id: string) => User.findById(id);
export const countByRole = (role: string) => User.countDocuments({ role });
export const findPending = () =>
  User.find({ status: 'pending' }).select('-passwordHash').sort({ createdAt: -1 });
export const updateById = (id: string, data: Record<string, unknown>) =>
  User.findByIdAndUpdate(id, data, { new: true });
