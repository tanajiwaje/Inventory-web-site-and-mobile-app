import { useMemo, useState } from 'react';

import {
  InventoryItem,
  PaginationMeta,
  ReturnEntry,
  ReturnPayload
} from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  items: InventoryItem[];
  returns: ReturnEntry[];
  onCreate: (payload: ReturnPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ReturnPayload['status']) => Promise<void>;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  readOnly?: boolean;
  busy?: boolean;
};

const emptyLine = { item: '', quantity: 1, reason: '' };

export const ReturnsSection = ({
  items,
  returns,
  onCreate,
  onDelete,
  onUpdateStatus,
  pagination,
  onPageChange,
  readOnly,
  busy
}: Props) => {
  const [type, setType] = useState<ReturnPayload['type']>('customer');
  const [status, setStatus] = useState<ReturnPayload['status']>('requested');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<typeof emptyLine>>([emptyLine]);

  const itemOptions = useMemo(
    () => items.map((item) => ({ value: item._id, label: `${item.name} (${item.sku})` })),
    [items]
  );

  const addLine = () => setLines((prev) => [...prev, emptyLine]);
  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== index));

  const updateLine = (index: number, field: keyof typeof emptyLine, value: string) => {
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === index
          ? {
              ...line,
              [field]: field === 'item' ? value : field === 'quantity' ? Number(value) : value
            }
          : line
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = lines.filter((line) => line.item && line.quantity > 0);
    if (!cleaned.length) return;
    await onCreate({
      type,
      status,
      notes: notes.trim() || undefined,
      items: cleaned.map((line) => ({
        item: line.item,
        quantity: line.quantity,
        reason: line.reason.trim() || undefined
      }))
    });
    setType('customer');
    setStatus('requested');
    setNotes('');
    setLines([emptyLine]);
  };

  return (
    <section className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Returns</h2>
      </div>
      <div className="row g-4">
        {readOnly ? null : (
        <div className="col-12 col-lg-4">
      <form className="grid" onSubmit={handleSubmit}>
        <label className="form-label">
          Type
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as ReturnPayload['type'])}
          >
            <option value="customer">Customer Return</option>
            <option value="supplier">Supplier Return</option>
          </select>
        </label>
        <label className="form-label">
          Status
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnPayload['status'])}
          >
            <option value="requested">Requested</option>
            <option value="received">Received</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="form-label full">
          Notes
          <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <div className="full">
          <p className="muted">Line items</p>
          {lines.map((line, idx) => (
            <div key={`${idx}-line`} className="line-row">
              <select className="form-select" value={line.item} onChange={(e) => updateLine(idx, 'item', e.target.value)}>
                <option value="">Select item</option>
                {itemOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                className="form-control"
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
              />
              <input
                className="form-control"
                value={line.reason}
                onChange={(e) => updateLine(idx, 'reason', e.target.value)}
                placeholder="Reason"
              />
              {lines.length > 1 ? (
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => removeLine(idx)}>
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={addLine}>
            Add Line
          </button>
        </div>
        <div className="actions d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Create Return
          </button>
        </div>
      </form>
        </div>
        )}
        <div className="col-12 col-lg-8">
      <div className="table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Items</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {returns.map((entry) => (
              <tr key={entry._id}>
                <td>{entry.type}</td>
                <td>
                  {readOnly ? (
                    entry.status
                  ) : (
                    <select
                      className="form-select form-select-sm"
                      value={entry.status}
                      onChange={(e) =>
                        onUpdateStatus(entry._id, e.target.value as ReturnPayload['status'])
                      }
                    >
                      <option value="requested">Requested</option>
                      <option value="received">Received</option>
                      <option value="closed">Closed</option>
                    </select>
                  )}
                </td>
                <td>{entry.items?.length ?? 0}</td>
                <td className="actions-cell">
                  {readOnly ? null : (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(entry._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!returns.length ? (
              <tr>
                <td colSpan={4}>No returns yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pagination meta={pagination} onPageChange={onPageChange} />
        </div>
      </div>
    </section>
  );
};
