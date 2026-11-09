import { motion } from "motion/react";
import { FiSearch } from "react-icons/fi";

const RISK_OPTIONS = [
  { value: "All", label: "All risks" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];
const TYPE_OPTIONS = [
  { value: "All", label: "All types" },
  { value: "H", label: "H" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
];

const selectClass =
  "rounded-md border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-main focus:border-primary focus:outline-none cursor-pointer";

function MachineFilters({
  riskFilter,
  setRiskFilter,
  typeFilter,
  setTypeFilter,
  searchText,
  setSearchText,
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
        <span className="text-xs text-text-muted">Risk level</span>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className={selectClass}
        >
          {RISK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Machine type</span>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </motion.div>
  );
}

export default MachineFilters;
