import { useMemo, useState } from 'react';

import {
  InventoryItem,
  PaginationMeta,
  PurchaseOrder,
  PurchaseOrderPayload,
  Supplier
} from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  suppliers: Supplier[];
  items: InventoryItem[];
  orders: PurchaseOrder[];
  onCreate: (payload: PurchaseOrderPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, payload: Partial<PurchaseOrderPayload>) => Promise<void>;
  onSupplierRespond?: (id: string, payload: Partial<PurchaseOrderPayload>) => Promise<void>;
  onViewPdf: (id: string) => Promise<void>;
  onDownloadPdf: (id: string) => Promise<void>;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  canViewPdf?: boolean;
  readOnly?: boolean;
  role?: string;
  busy?: boolean;
};

const emptyLine = { item: '', quantity: 1, cost: 0 };

export const PurchaseOrdersSection = ({
  suppliers,
  items,
  orders,
  onCreate,
  onDelete,
  onUpdateStatus,
  onSupplierRespond,
  onViewPdf,
  onDownloadPdf,
  pagination,
  onPageChange,
  canViewPdf,
  readOnly,
  role,
  busy
}: Props) => {
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState<PurchaseOrderPayload['status']>('requested');
  const [expectedDate, setExpectedDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [taxRate, setTaxRate] = useState('0.18');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Array<typeof emptyLine>>([emptyLine]);
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [responseOrderId, setResponseOrderId] = useState('');
  const [responseLines, setResponseLines] = useState<Array<typeof emptyLine>>([]);
  const [responseDeliveryDate, setResponseDeliveryDate] = useState('');
  const [responsePaymentTerms, setResponsePaymentTerms] = useState('');
  const [responseTaxRate, setResponseTaxRate] = useState('0.18');
  const [responseShippingAddress, setResponseShippingAddress] = useState('');
  const [responseNotes, setResponseNotes] = useState('');

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
    const totalAmount = lines.reduce((sum, line) => sum + line.quantity * line.cost, 0);
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
            cost: selected?.cost ?? selected?.price ?? line.cost
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
    if (!supplier) return;
    const cleaned = lines.filter((line) => line.item && line.quantity > 0);
    if (!cleaned.length) return;
    await onCreate({
      supplier,
      status,
      expectedDate: expectedDate || undefined,
      deliveryDate: deliveryDate || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      taxRate: taxRate ? Number(taxRate) : undefined,
      shippingAddress: shippingAddress.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cleaned.map((line) => ({
        item: line.item,
        quantity: line.quantity,
        cost: line.cost
      }))
    });
    setSupplier('');
    setStatus('requested');
    setExpectedDate('');
    setDeliveryDate('');
    setPaymentTerms('');
    setTaxRate('0.18');
    setShippingAddress('');
    setNotes('');
    setLines([emptyLine]);
  };

  const handleResponseSelect = (id: string) => {
    setResponseOrderId(id);
    const order = orders.find((o) => o._id === id);
    if (!order) {
      setResponseLines([]);
      return;
    }
    setResponseLines(
      (order.items ?? []).map((line) => ({
        item: line.item?._id ?? '',
        quantity: line.quantity,
        cost: line.cost
      }))
    );
    setResponseDeliveryDate(order.deliveryDate ?? '');
    setResponsePaymentTerms(order.paymentTerms ?? '');
    setResponseTaxRate(order.taxRate ? String(order.taxRate) : '0.18');
    setResponseShippingAddress(order.shippingAddress ?? '');
    setResponseNotes(order.notes ?? '');
  };

  const updateResponseLine = (index: number, value: string) => {
    setResponseLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, cost: Number(value) } : line))
    );
  };

  const handleSupplierSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!responseOrderId || !onSupplierRespond) return;
    await onSupplierRespond(responseOrderId, {
      items: responseLines.map((line) => ({
        item: line.item,
        quantity: line.quantity,
        cost: line.cost
      })),
      deliveryDate: responseDeliveryDate || undefined,
      paymentTerms: responsePaymentTerms.trim() || undefined,
      taxRate: responseTaxRate ? Number(responseTaxRate) : undefined,
      shippingAddress: responseShippingAddress.trim() || undefined,
      notes: responseNotes.trim() || undefined
    });
  };

  return (
    <section className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Purchase Orders</h2>
      </div>
      <div className="row g-4">
        {readOnly ? null : (
        <div className="col-12 col-lg-4">
      <form className="grid" onSubmit={handleSubmit}>
        <label className="form-label">
          Supplier
          <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)} required>
            <option value="">Select supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Status
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as PurchaseOrderPayload['status'])}
          >
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
          </select>
        </label>
        <label className="form-label">
          Expected Date
          <input className="form-control" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
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
              <select
                className="form-select"
                value={line.item}
                onChange={(e) => updateLine(idx, 'item', e.target.value)}
              >
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
                value={line.cost}
                onChange={(e) => updateLine(idx, 'cost', e.target.value)}
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
                  <th>Cost</th>
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
                            value={line.cost}
                            onChange={(e) => updateLine(idx, 'cost', e.target.value)}
                          />
                        ) : (
                          line.cost.toFixed(2)
                        )}
                      </td>
                      <td>{(line.quantity * line.cost).toFixed(2)}</td>
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
            Create Purchase Order
          </button>
        </div>
      </form>
        </div>
        )}
        {role === 'seller' && onSupplierRespond ? (
          <div className="col-12 col-lg-4">
            <form className="grid" onSubmit={handleSupplierSubmit}>
              <label className="form-label">
                Purchase Order
                <select
                  className="form-select"
                  value={responseOrderId}
                  onChange={(e) => handleResponseSelect(e.target.value)}
                  required
                >
                  <option value="">Select request</option>
                  {orders
                    .filter((order) => order.status === 'requested' || order.status === 'supplier_submitted')
                    .map((order) => (
                      <option key={order._id} value={order._id}>
                        {order._id.slice(-6)} - {order.supplier?.name ?? 'Supplier'}
                      </option>
                    ))}
                </select>
              </label>
              <label className="form-label">
                Delivery Date
                <input
                  className="form-control"
                  type="date"
                  value={responseDeliveryDate}
                  onChange={(e) => setResponseDeliveryDate(e.target.value)}
                />
              </label>
              <label className="form-label">
                Payment Terms
                <input
                  className="form-control"
                  value={responsePaymentTerms}
                  onChange={(e) => setResponsePaymentTerms(e.target.value)}
                />
              </label>
              <label className="form-label">
                Tax Rate
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={responseTaxRate}
                  onChange={(e) => setResponseTaxRate(e.target.value)}
                />
              </label>
              <label className="form-label full">
                Shipping Address
                <input
                  className="form-control"
                  value={responseShippingAddress}
                  onChange={(e) => setResponseShippingAddress(e.target.value)}
                />
              </label>
              <label className="form-label full">
                Notes
                <input
                  className="form-control"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                />
              </label>
              <div className="full">
                <p className="muted">Item costs</p>
                {responseLines.map((line, idx) => {
                  const itemName = items.find((item) => item._id === line.item)?.name ?? 'Item';
                  return (
                    <div key={`resp-${idx}`} className="line-row">
                      <span className="muted">{itemName}</span>
                      <span className="muted">Qty: {line.quantity}</span>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.cost}
                        onChange={(e) => updateResponseLine(idx, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="actions d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={busy || !responseOrderId}>
                  Submit Details
                </button>
              </div>
            </form>
          </div>
        ) : null}
        <div className="col-12 col-lg-8">
      <div className="table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Status</th>
              <th>Items</th>
              <th>PDF</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.supplier?.name ?? '-'}</td>
                <td>
                  {readOnly ? (
                    order.status
                  ) : (
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={async (e) => {
                        const nextStatus = e.target.value as PurchaseOrderPayload['status'];
                        if (nextStatus === 'received') {
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
                          onUpdateStatus(order._id, { status: nextStatus, receivedDate: result.value });
                          return;
                        }
                        onUpdateStatus(order._id, { status: nextStatus });
                      }}
                    >
                      <option value="requested">Requested</option>
                      <option value="supplier_submitted">Supplier Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="received">Received</option>
                    </select>
                  )}
                </td>
                <td>{order.items?.length ?? 0}</td>
                <td>
                  {canViewPdf ? (
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
                <td colSpan={5}>No purchase orders yet.</td>
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
