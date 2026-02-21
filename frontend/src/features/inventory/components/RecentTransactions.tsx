import { InventoryTransaction, PaginationMeta } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  transactions: InventoryTransaction[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

const formatType = (type: InventoryTransaction['type']) => {
  if (type === 'receive') return 'Receive';
  if (type === 'issue') return 'Issue';
  return 'Adjust';
};

export const RecentTransactions = ({ transactions, pagination, onPageChange }: Props) => {
  if (!transactions.length) {
    return (
      <div className="card empty">
        <p>No adjustments yet.</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-transparent border-0 pb-0">
        <h2>Recent Adjustments</h2>
      </div>
      <div className="table-wrap">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Change</th>
              <th>Reason</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>
                  {tx.item?.name} ({tx.item?.sku})
                </td>
                <td>{formatType(tx.type)}</td>
                <td>{tx.quantityChange}</td>
                <td>{tx.reason || '-'}</td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination meta={pagination} onPageChange={onPageChange} />
    </div>
  );
};
