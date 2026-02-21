import { useMemo, useState } from 'react';

import {
  Customer,
  InventoryItem,
  PaginationMeta,
  SalesOrder,
  SalesOrderPayload
} from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  customers: Customer[];
  items: InventoryItem[];
  orders: SalesOrder[];
  onCreate: (payload: SalesOrderPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, payload: Partial<SalesOrderPayload>) => Promise<void>;
  onViewPdf: (id: string) => Promise<void>;
  onDownloadPdf: (id: string) => Promise<void>;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  canViewPdf?: (order: SalesOrder) => boolean;
  readOnly?: boolean;
  role?: string;
  customerId?: string;
  busy?: boolean;
};

const emptyLine = { item: '', quantity: 1, price: 0 };

export const SalesOrdersSection = ({
  customers,
  items,
  orders,
  onCreate,
  onDelete,
  onUpdateStatus,
  onViewPdf,
  onDownloadPdf,
  pagination,
  onPageChange,
  canViewPdf,
  readOnly,
  role,
  customerId,
  busy
}: Props) => {
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState<SalesOrderPayload['status']>('requested');
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [taxRate, setTaxRate] = useState('0.18');
  const [shippingAddress, setShippingAddress] = useState('');
  const [lines, setLines] = useState<Array<typeof emptyLine>>([emptyLine]);
  const [editingLine, setEditingLine] = useState<number | null>(null);

  const itemOptions = useMemo(
    () => items.map((item) => ({ value: item._id, label: `${item.name} (${item.sku})` })),
    [items]
  );

  const selectedItems = useMemo(
    () => new Set(lines.map((line) => line.item).filter(Boolean)),
    [lines]
  );

  const totals = useMemo(() => {
    const totalQty = lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
    const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    return { totalQty, totalAmount };
  }, [lines]);

  const addLine = () => setLines((prev) => [...prev, emptyLine]);
  const removeLine = (index: number) =>
    setLines((prev) => prev.filter((_, idx) => idx !== index));

  const updateLine = (index: number, field: keyof typeof emptyLine, value: string) => {
    setLines((prev) =>
      prev.map((line, idx) => {
        if (idx !== index) return line;
        if (field === 'item') {
          const alreadySelected = prev.some(
            (existing, existingIdx) => existingIdx !== index && existing.item === value
          );
          if (alreadySelected) {
            return line;
          }
          const selected = items.find((item) => item._id === value);
          return {
            ...line,
            item: value,
            price: selected?.price ?? line.price
          };
        }
        return {
          ...line,
          [field]: Number(value)
        };
      })
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const customerValue = role === 'buyer' ? customerId ?? '' : customer;
    if (!customerValue) return;
    const cleaned = lines.filter((line) => line.item && line.quantity > 0);
    if (!cleaned.length) return;
    await onCreate({
      customer: customerValue,
      status: role === 'buyer' ? 'requested' : status,
      deliveryDate: deliveryDate || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      taxRate: taxRate ? Number(taxRate) : undefined,
      shippingAddress: shippingAddress.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cleaned.map((line) => ({
        item: line.item,
        quantity: line.quantity,
        price: line.price
      }))
    });
    setCustomer('');
    setStatus('requested');
    setNotes('');
    setDeliveryDate('');
    setPaymentTerms('');
    setTaxRate('0.18');
    setShippingAddress('');
    setLines([emptyLine]);
  };

  return (
    <section className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Sales Orders</h2>
      </div>
      <div className="row g-4">
        {readOnly ? null : (
        <div className="col-12 col-lg-4">
      <form className="grid" onSubmit={handleSubmit}>
        <label className="form-label">
          Customer
          {role === 'buyer' ? (
            <input className="form-control" value="Current Customer" disabled />
          ) : (
            <select className="form-select" value={customer} onChange={(e) => setCustomer(e.target.value)} required>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </label>
        <label className="form-label">
          Status
          {role === 'buyer' ? (
            <input className="form-control" value="requested" disabled />
          ) : (
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as SalesOrderPayload['status'])}
            >
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="received">Received</option>
            </select>
          )}
        </label>
        <label className="form-label">
          Delivery Date
          <input className="form-control" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
        </label>
        <label className="form-label">
          Payment Terms
          <input className="form-control" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
        </label>
        <label className="form-label">
          Tax Rate
          <input
            className="form-control"
            type="number"
            min="0"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
        </label>
        <label className="form-label full">
          Shipping Address
          <input className="form-control" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
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
                {itemOptions
                  .filter((opt) => !selectedItems.has(opt.value) || opt.value === line.item)
                  .map((opt) => (
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
                type="number"
                min="0"
                step="0.01"
                value={
                  role === 'buyer'
                    ? items.find((item) => item._id === line.item)?.price ?? line.price
                    : line.price
                }
                onChange={(e) => updateLine(idx, 'price', e.target.value)}
                disabled={role === 'buyer'}
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
        <div className="full">
          <p className="muted">Added line items</p>
          <div className="table-wrap">
            <table className="table table-sm table-bordered align-middle mb-2">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Line Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const item = items.find((item) => item._id === line.item);
                  const isEditing = editingLine === idx;
                  return (
                    <tr key={`summary-${idx}`}>
                      <td>{item ? item.name : '-'}</td>
                      <td>
                        {isEditing ? (
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                          />
                        ) : (
                          line.quantity
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.price}
                            onChange={(e) => updateLine(idx, 'price', e.target.value)}
                            disabled={role === 'buyer'}
                          />
                        ) : (
                          line.price.toFixed(2)
                        )}
                      </td>
                      <td>{(line.quantity * line.price).toFixed(2)}</td>
                      <td className="text-end">
                        {isEditing ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setEditingLine(null)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setEditingLine(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setEditingLine(idx)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeLine(idx)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!lines.length ? (
                  <tr>
                    <td colSpan={5}>No line items added.</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th>{totals.totalQty}</th>
                  <th></th>
                  <th>{totals.totalAmount.toFixed(2)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="actions d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Create Sales Order
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
              <th>Customer</th>
              <th>Status</th>
              <th>Items</th>
              <th>PDF</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.customer?.name ?? '-'}</td>
                <td>
                  {readOnly ? (
                    order.status
                  ) : (
                    role === 'buyer' ? (
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={async (e) => {
                          const next = e.target.value as SalesOrderPayload['status'];
                          if (next === 'received') {
                            const Swal = window.Swal;
                            if (!Swal) return;
                            const result = await Swal.fire({
                              title: 'Received date',
                              input: 'date',
                              inputLabel: 'Select received date',
                              inputPlaceholder: 'YYYY-MM-DD',
                              showCancelButton: true
                            });
                            if (!result.isConfirmed || !result.value) return;
                          onUpdateStatus(order._id, { status: next, receivedDate: result.value });
                          return;
                        }
                          onUpdateStatus(order._id, { status: next });
                        }}
                        disabled={order.status !== 'approved'}
                      >
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                      </select>
                    ) : (
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) =>
                        onUpdateStatus(order._id, {
                          status: e.target.value as SalesOrderPayload['status']
                        })
                        }
                      >
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="received">Received</option>
                      </select>
                    )
                  )}
                </td>
                <td>{order.items?.length ?? 0}</td>
                <td>
                  {canViewPdf && canViewPdf(order) ? (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onViewPdf(order._id)}
                        title="View PDF"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => onDownloadPdf(order._id)}
                        title="Download PDF"
                      >
                        Download
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td className="actions-cell">
                  {readOnly ? null : (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(order._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={5}>No sales orders yet.</td>
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
