import { PaginationMeta } from './types';

type Props = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ meta, onPageChange }: Props) => {
  const { page, totalPages } = meta;
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="d-flex align-items-center justify-content-between mt-3">
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <div className="btn-group">
        <button
          className="btn btn-outline-primary btn-sm"
          type="button"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        <button
          className="btn btn-outline-primary btn-sm"
          type="button"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
