import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiAlertCircle, FiLoader, FiRefreshCw } from "react-icons/fi";
import { getMachines } from "../services/api.js";
import { toMachineViewModel } from "../data/machines.js";
import MachineSummary from "../components/machines/MachineSummary.jsx";
import MachineFilters from "../components/machines/MachineFilters.jsx";
import MachineTable from "../components/machines/MachineTable.jsx";
import MachinePagination from "../components/machines/MachinePagination.jsx";

const PAGE_SIZE = 50;

const EMPTY_PAGINATION = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  total_pages: 0,
};

const EMPTY_SUMMARY = {
  total: 0,
  actual_failures: 0,
  predicted_failures: 0,
  high_risk: 0,
  medium_risk: 0,
  low_risk: 0,
};

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FiLoader className="animate-spin text-xl text-primary" />
      <p className="text-sm font-medium text-text-secondary">
        Loading machines…
      </p>
      <p className="text-xs text-text-muted">
        Preparing machine records and predictions.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FiAlertCircle className="text-2xl text-status-danger" />
      <p className="text-sm font-medium text-text-main">
        Couldn&apos;t load machines
      </p>
      <p className="max-w-md text-xs text-text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-card px-3 py-1.5 text-xs font-medium text-text-main transition-colors hover:bg-bg-card-elevated cursor-pointer"
      >
        <FiRefreshCw className="text-sm" />
        Try again
      </button>
    </div>
  );
}

function Machines() {
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Debounce typing so search does not fire a request per keystroke.
    const timer = setTimeout(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await getMachines(
            {
              page,
              limit: PAGE_SIZE,
              search: searchText.trim(),
              type: typeFilter,
              risk: riskFilter,
              sort: sortDir,
            },
            controller.signal,
          );

          if (active) setData(response);
        } catch (requestError) {
          if (!active || requestError.name === "AbortError") return;
          setError(requestError.message || "Please try again.");
        } finally {
          if (active) setLoading(false);
        }
      },
      searchText ? 300 : 0,
    );

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [page, searchText, typeFilter, riskFilter, sortDir, reloadKey]);

  // Any filter change returns to the first page of the new result set.
  function updateFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  function handleToggleSortDir() {
    setSortDir((previous) => (previous === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  const machines = (data?.items ?? []).map(toMachineViewModel);
  const pagination = data?.pagination ?? EMPTY_PAGINATION;
  const summary = data?.summary ?? EMPTY_SUMMARY;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-text-main">Machines</h1>
        <p className="mt-1 text-sm text-text-muted">
          Review machine records, prediction risk, and actual failure status.
          Open a record to see the likely cause and recommended action.
        </p>
      </motion.header>

      {/* summary */}
      <MachineSummary summary={summary} />

      {/* Filters and search */}
      <MachineFilters
        riskFilter={riskFilter}
        setRiskFilter={updateFilter(setRiskFilter)}
        typeFilter={typeFilter}
        setTypeFilter={updateFilter(setTypeFilter)}
        searchText={searchText}
        setSearchText={updateFilter(setSearchText)}
        shown={pagination.total}
        total={summary.total}
      />

      {/* Machines table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card"
      >
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : loading && !data ? (
          <LoadingState />
        ) : (
          <>
            <MachineTable
              machines={machines}
              sortDir={sortDir}
              onToggleSort={handleToggleSortDir}
            />
            <MachinePagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              total={pagination.total}
              loading={loading}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() =>
                setPage((current) =>
                  Math.min(Math.max(pagination.total_pages, 1), current + 1),
                )
              }
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

export default Machines;
