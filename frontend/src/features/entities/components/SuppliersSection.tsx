import { useState } from 'react';

import { PaginationMeta, Supplier, SupplierPayload } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  suppliers: Supplier[];
  onCreate: (payload: SupplierPayload) => Promise<void>;
  onUpdate: (id: string, payload: SupplierPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  readOnly?: boolean;
  busy?: boolean;
};

const emptySupplier: SupplierPayload = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: ''
};

export const SuppliersSection = ({
  suppliers,
  onCreate,
  onUpdate,
  onDelete,
  pagination,
  onPageChange,
  readOnly,
  busy
}: Props) => {
  const [form, setForm] = useState<SupplierPayload>(emptySupplier);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await onUpdate(editingId, form);
      setEditingId(null);
    } else {
      await onCreate(form);
    }
    setForm(emptySupplier);
  };

  const startEdit = (supplier: Supplier) => {
    setEditingId(supplier._id);
    setForm({
      name: supplier.name ?? '',
      contactName: supplier.contactName ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? ''
    });
  };

  return (
    <section className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Suppliers</h2>
      </div>
      <div className="row g-4">
        {readOnly ? null : (
        <div className="col-12 col-lg-4">
      <form className="grid" onSubmit={handleSubmit}>
        <label className="form-label">
          Name
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>
        <label className="form-label">
          Contact
          <input
            className="form-control"
            value={form.contactName ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
          />
        </label>
        <label className="form-label">
          Phone
          <input
            className="form-control"
            value={form.phone ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </label>
        <label className="form-label">
          Email
          <input
            className="form-control"
            value={form.email ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </label>
        <label className="form-label full">
          Address
          <input
            className="form-control"
            value={form.address ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          />
        </label>
        <div className="actions d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {editingId ? 'Update Supplier' : 'Add Supplier'}
          </button>
          {editingId ? (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptySupplier);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
        </div>
        )}
        <div className="col-12 col-lg-8">
      <div className="table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>{supplier.contactName || '-'}</td>
                <td>{supplier.phone || '-'}</td>
                <td>{supplier.email || '-'}</td>
                <td className="actions-cell">
                  {readOnly ? null : (
                    <>
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEdit(supplier)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(supplier._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!suppliers.length ? (
              <tr>
                <td colSpan={5}>No suppliers yet.</td>
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
