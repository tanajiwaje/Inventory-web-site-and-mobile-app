import { InventoryStock, PaginationMeta } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  stocks: InventoryStock[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export const LocationStockTable = ({ stocks, pagination, onPageChange }: Props) => (
  <div className="card shadow-sm">
    <div className="card-header bg-transparent border-0 pb-0">
      <h2>Stock by Location</h2>
    </div>
    <div className="table-wrap">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th>Location</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock._id}>
              <td>{stock.item?.name ?? '-'}</td>
              <td>{stock.item?.sku ?? '-'}</td>
              <td>{stock.location?.name ?? '-'}</td>
              <td>{stock.quantity}</td>
            </tr>
          ))}
          {!stocks.length ? (
            <tr>
              <td colSpan={4}>No stock records.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
    <Pagination meta={pagination} onPageChange={onPageChange} />
  </div>
);
