type PendingUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  address?: string;
  companyName?: string;
  gstNumber?: string;
  createdAt?: string;
};

type Props = {
  users: PendingUser[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  busy?: boolean;
};

export const UserOnboardingTable = ({ users, onApprove, onReject, busy }: Props) => (
  <div className="table-wrap">
    <table className="table table-striped table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Email</th>
          <th>Company</th>
          <th>Phone</th>
          <th>Address</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>{user.email}</td>
            <td>{user.companyName ?? '-'}</td>
            <td>{user.phone ?? '-'}</td>
            <td>{user.address ?? '-'}</td>
            <td className="actions-cell">
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => onApprove(user._id)}
                  disabled={busy}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onReject(user._id)}
                  disabled={busy}
                >
                  Reject
                </button>
              </div>
            </td>
          </tr>
        ))}
        {!users.length ? (
          <tr>
            <td colSpan={7}>No pending users.</td>
          </tr>
        ) : null}
      </tbody>
    </table>
  </div>
);
