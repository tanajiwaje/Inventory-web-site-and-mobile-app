import { InventoryItem, PaginationMeta } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  readOnly?: boolean;
};

export const InventoryTable = ({ items, onEdit, onDelete, pagination, onPageChange, readOnly }: Props) => {
  if (!items.length) {
    return (
      <div className="card empty">
        <p>No items yet. Add the first inventory item.</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Inventory</h2>
        <span className="muted">{items.length} items</span>
      </div>
      <div className="table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Barcode</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Status</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.barcode || '-'}</td>
                <td>{item.category || '-'}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.cost ?? 0).toFixed(2)}</td>
                <td>{Number(item.price ?? 0).toFixed(2)}</td>
                <td>
                  {item.quantity <= item.lowStockThreshold ? (
                    <span className="status low">Low</span>
                  ) : (
                    <span className="status ok">Ok</span>
                  )}
                </td>
                <td>{item.description || '-'}</td>
                <td className="actions-cell">
                  {readOnly ? null : (
                    <>
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={pagination} onPageChange={onPageChange} />
    </div>
  );
};
