import { useMemo, useState } from 'react';

import { InventoryAdjustmentPayload, InventoryItem, Location } from '../../../shared/types';

type Props = {
  items: InventoryItem[];
  locations: Location[];
  onAdjust: (payload: InventoryAdjustmentPayload) => Promise<void>;
  busy?: boolean;
};

const defaultPayload: InventoryAdjustmentPayload = {
  itemId: '',
  locationId: '',
  type: 'receive',
  quantity: 0,
  reason: ''
};

export const StockAdjustment = ({ items, locations, onAdjust, busy }: Props) => {
  const [payload, setPayload] = useState<InventoryAdjustmentPayload>(defaultPayload);
  const [error, setError] = useState<string | null>(null);

  const itemOptions = useMemo(
    () =>
      items.map((item) => ({
        value: item._id,
        label: `${item.name} (${item.sku})`
      })),
    [items]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!payload.itemId) {
      setError('Select an item.');
      return;
    }

    if (!payload.quantity || Number.isNaN(payload.quantity)) {
      setError('Enter a valid quantity.');
      return;
    }

    await onAdjust({
      ...payload,
      reason: payload.reason?.trim() || undefined
    });
    setPayload(defaultPayload);
  };

  return (
    <form className="card shadow-sm" onSubmit={handleSubmit}>
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Stock Adjustment</h2>
      </div>
      <div className="grid">
        <label className="form-label">
          Item
          <select
            className="form-select"
            value={payload.itemId}
            onChange={(e) => setPayload((prev) => ({ ...prev, itemId: e.target.value }))}
          >
            <option value="">Select item</option>
            {itemOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Location
          <select
            className="form-select"
            value={payload.locationId ?? ''}
            onChange={(e) => setPayload((prev) => ({ ...prev, locationId: e.target.value }))}
          >
            <option value="">Default location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Type
          <select
            className="form-select"
            value={payload.type}
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, type: e.target.value as InventoryAdjustmentPayload['type'] }))
            }
          >
            <option value="receive">Receive</option>
            <option value="issue">Issue</option>
            <option value="adjust">Adjust</option>
          </select>
        </label>
        <label className="form-label">
          Quantity
          <input
            className="form-control"
            type="number"
            value={payload.quantity}
            onChange={(e) =>
              setPayload((prev) => ({ ...prev, quantity: Number(e.target.value) }))
            }
          />
        </label>
        <label className="form-label full">
          Reason
          <input
            className="form-control"
            value={payload.reason ?? ''}
            onChange={(e) => setPayload((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Optional note"
          />
        </label>
      </div>
      {error ? <p className="text-danger mt-2 mb-0">{error}</p> : null}
      <div className="actions d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={busy || items.length === 0}>
          {busy ? 'Saving...' : 'Apply Adjustment'}
        </button>
      </div>
    </form>
  );
};
