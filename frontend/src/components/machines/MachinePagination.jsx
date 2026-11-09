import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-card px-3 py-1.5 text-xs font-medium text-text-main transition-colors hover:bg-bg-card-elevated disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

function MachinePagination({
  page,
  totalPages,
  total,
  loading,
  onPrevious,
  onNext,
}) {
  if (total === 0) return null;

  const lastPage = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
      <span className="text-xs text-text-muted">
        Page <span className="font-medium text-text-secondary">{page}</span> of{" "}
        <span className="font-medium text-text-secondary">{lastPage}</span>
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading || page <= 1}
          className={buttonClass}
        >
          <FiChevronLeft className="text-sm" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={loading || page >= lastPage}
          className={buttonClass}
        >
          Next
          <FiChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}

export default MachinePagination;
