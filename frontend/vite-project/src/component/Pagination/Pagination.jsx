import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      <p className="pagination__summary">
        Showing {startItem}-{endItem} of {totalItems} entries
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__nav-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination__page-btn${
              page === currentPage ? " pagination__page-btn--active" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="pagination__nav-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
