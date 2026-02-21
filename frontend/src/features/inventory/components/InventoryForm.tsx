import { useEffect, useMemo, useState } from 'react';

import { InventoryItem, InventoryPayload } from '../../../shared/types';

type Props = {
  initial?: InventoryItem | null;
  onSubmit: (payload: InventoryPayload) => Promise<void>;
  onCancel?: () => void;
  busy?: boolean;
};

  const emptyPayload: InventoryPayload = {
    name: '',
    sku: '',
    quantity: 0,
    cost: 0,
    price: 0,
    barcode: '',
    category: '',
    lowStockThreshold: 0,
    description: ''
  };

const toNumber = (value: string) => (value === '' ? 0 : Number(value));

export const InventoryForm = ({ initial, onSubmit, onCancel, busy }: Props) => {
  const [payload, setPayload] = useState<InventoryPayload>(emptyPayload);
  const [error, setError] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(initial?._id), [initial]);

  useEffect(() => {
    if (initial) {
      setPayload({
        name: initial.name ?? '',
        sku: initial.sku ?? '',
        quantity: initial.quantity ?? 0,
        cost: initial.cost ?? 0,
        price: initial.price ?? 0,
        barcode: initial.barcode ?? '',
        category: initial.category ?? '',
        lowStockThreshold: initial.lowStockThreshold ?? 0,
        description: initial.description ?? ''
      });
      return;
    }
    setPayload(emptyPayload);
  }, [initial]);

  const handleChange = (field: keyof InventoryPayload, value: string) => {
    setPayload((prev) => ({
      ...prev,
      [field]:
        field === 'quantity' ||
        field === 'price' ||
        field === 'cost' ||
        field === 'lowStockThreshold'
          ? toNumber(value)
          : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!payload.name.trim() || !payload.sku.trim()) {
      setError('Name and SKU are required.');
      return;
    }

    if (payload.quantity < 0 || payload.price < 0 || payload.cost < 0) {
      setError('Quantity, cost, and price must be 0 or greater.');
      return;
    }

    if ((payload.lowStockThreshold ?? 0) < 0) {
      setError('Low stock threshold must be 0 or greater.');
      return;
    }

    await onSubmit({
      ...payload,
      description: payload.description?.trim() || undefined
    });
    if (!isEdit) {
      setPayload(emptyPayload);
    }
  };

  return (
    <form className="card shadow-sm" onSubmit={handleSubmit}>
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>{isEdit ? 'Edit Item' : 'Add Item'}</h2>
      </div>
      <div className="grid">
        <label className="form-label">
          Name
          <input
            className="form-control"
            value={payload.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Rice - Basmati"
            required
          />
        </label>
        <label className="form-label">
          SKU
          <input
            className="form-control"
            value={payload.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="SKU-001"
            required
          />
        </label>
        <label className="form-label">
          Barcode / QR
          <input
            className="form-control"
            value={payload.barcode ?? ''}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="Scan or enter barcode"
          />
        </label>
        <label className="form-label">
          Category
          <input
            className="form-control"
            value={payload.category ?? ''}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Grains"
          />
        </label>
        <label className="form-label">
          Quantity
          <input
            className="form-control"
            type="number"
            min="0"
            value={payload.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
          />
        </label>
        <label className="form-label">
          Cost
          <input
            className="form-control"
            type="number"
            min="0"
            step="0.01"
            value={payload.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
          />
        </label>
        <label className="form-label">
          Price
          <input
            className="form-control"
            type="number"
            min="0"
            step="0.01"
            value={payload.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
        </label>
        <label className="form-label">
          Low Stock Threshold
          <input
            className="form-control"
            type="number"
            min="0"
            value={payload.lowStockThreshold ?? 0}
            onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
          />
        </label>
        <label className="form-label full">
          Description
          <input
            className="form-control"
            value={payload.description ?? ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Optional details"
          />
        </label>
      </div>
      {error ? <p className="text-danger mt-2 mb-0">{error}</p> : null}
      <div className="actions d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
        {isEdit ? (
          <button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};
