import { motion } from "motion/react";
import { FiSearch } from "react-icons/fi";

const RISK_OPTIONS = ["All", "Low", "Medium", "High"];
const TYPE_OPTIONS = ["All", "H", "M", "L"];

const selectClass =
  "rounded-md border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none cursor-pointer";

function MachineFilters({
  riskFilter,
  setRiskFilter,
  typeFilter,
  setTypeFilter,
  searchText,
  setSearchText,
  shown,
  total,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="flex flex-wrap items-center gap-2.5"
    >
      <div className="relative w-full flex-1 sm:max-w-xs">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by product ID"
          className="w-full rounded-md border border-border-subtle bg-bg-card py-2 pl-9 pr-3 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none "
        />
      </div>

      <label className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Risk</span>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className={selectClass}
        >
          {RISK_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Type</span>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <span className="ml-auto whitespace-nowrap text-xs text-text-muted">
        Showing <span className="font-medium text-text-secondary">{shown}</span>{" "}
        of {total} records
      </span>
    </motion.div>
  );
}

export default MachineFilters;
