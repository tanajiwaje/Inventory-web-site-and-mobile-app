import { AuditLog, PaginationMeta } from '../../../shared/types';
import { Pagination } from '../../../shared/Pagination';

type Props = {
  logs: AuditLog[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export const AuditLogTable = ({ logs, pagination, onPageChange }: Props) => (
  <div className="card shadow-sm">
    <div className="card-header bg-transparent border-0 pb-0">
      <h2>Audit Logs</h2>
    </div>
    <div className="table-wrap">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Entity</th>
            <th>Action</th>
            <th>Message</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.entity}</td>
              <td>{log.action}</td>
              <td>{log.message || '-'}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {!logs.length ? (
            <tr>
              <td colSpan={4}>No audit logs.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
    <Pagination meta={pagination} onPageChange={onPageChange} />
  </div>
);
