type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          className={`page-button ${value === page ? 'active' : ''}`}
          onClick={() => onPageChange(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
