import { SalesOrder } from '../models/SalesOrder';

export const findAll = () =>
  SalesOrder.find()
    .sort({ createdAt: -1 })
    .populate('customer', 'name')
    .populate('items.item', 'name sku');

export const findPaged = (skip: number, limit: number) =>
  SalesOrder.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'name')
    .populate('items.item', 'name sku');

export const count = () => SalesOrder.countDocuments();

export const findPagedByCustomer = (customerId: string, skip: number, limit: number) =>
  SalesOrder.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('customer', 'name')
    .populate('items.item', 'name sku');

export const countByCustomer = (customerId: string) =>
  SalesOrder.countDocuments({ customer: customerId });

export const create = (data: Record<string, unknown>) => SalesOrder.create(data);

export const findById = (id: string) => SalesOrder.findById(id);

export const findByIdWithDetails = (id: string) =>
  SalesOrder.findById(id)
    .populate('customer', 'name contactName phone email address')
    .populate('items.item', 'name sku');

export const updateById = (id: string, data: Record<string, unknown>) =>
  SalesOrder.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('customer', 'name')
    .populate('items.item', 'name sku');

export const deleteById = (id: string) => SalesOrder.findByIdAndDelete(id);
