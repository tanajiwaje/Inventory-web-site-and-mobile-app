import { useState } from 'react';

import { Location, LocationPayload, PaginationMeta } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  locations: Location[];
  onCreate: (payload: LocationPayload) => Promise<void>;
  onUpdate: (id: string, payload: LocationPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  readOnly?: boolean;
  busy?: boolean;
};

const emptyLocation: LocationPayload = {
  name: '',
  code: '',
  address: '',
  isDefault: false
};

export const LocationsSection = ({
  locations,
  onCreate,
  onUpdate,
  onDelete,
  pagination,
  onPageChange,
  readOnly,
  busy
}: Props) => {
  const [form, setForm] = useState<LocationPayload>(emptyLocation);
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
    setForm(emptyLocation);
  };

  const startEdit = (location: Location) => {
    setEditingId(location._id);
    setForm({
      name: location.name ?? '',
      code: location.code ?? '',
      address: location.address ?? '',
      isDefault: location.isDefault ?? false
    });
  };

  return (
    <section className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Locations</h2>
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
          Code
          <input
            className="form-control"
            value={form.code ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
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
        <label className="toggle form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
          />
          Default location
        </label>
        <div className="actions d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {editingId ? 'Update Location' : 'Add Location'}
          </button>
          {editingId ? (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyLocation);
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
              <th>Code</th>
              <th>Default</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location._id}>
                <td>{location.name}</td>
                <td>{location.code || '-'}</td>
                <td>{location.isDefault ? 'Yes' : 'No'}</td>
                <td className="actions-cell">
                  {readOnly ? null : (
                    <>
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEdit(location)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(location._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!locations.length ? (
              <tr>
                <td colSpan={4}>No locations yet.</td>
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
