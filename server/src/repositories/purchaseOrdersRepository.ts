import { PurchaseOrder } from '../models/PurchaseOrder';

export const findAll = () =>
  PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .populate('supplier', 'name')
    .populate('items.item', 'name sku');

export const findPaged = (skip: number, limit: number) =>
  PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('supplier', 'name')
    .populate('items.item', 'name sku');

export const count = () => PurchaseOrder.countDocuments();

export const findPagedBySupplier = (supplierId: string, skip: number, limit: number) =>
  PurchaseOrder.find({ supplier: supplierId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('supplier', 'name')
    .populate('items.item', 'name sku');

export const countBySupplier = (supplierId: string) =>
  PurchaseOrder.countDocuments({ supplier: supplierId });

export const create = (data: Record<string, unknown>) => PurchaseOrder.create(data);

export const findById = (id: string) => PurchaseOrder.findById(id);

export const findByIdWithDetails = (id: string) =>
  PurchaseOrder.findById(id)
    .populate('supplier', 'name contactName phone email address')
    .populate('items.item', 'name sku');

export const updateById = (id: string, data: Record<string, unknown>) =>
  PurchaseOrder.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('supplier', 'name')
    .populate('items.item', 'name sku');

export const deleteById = (id: string) => PurchaseOrder.findByIdAndDelete(id);
