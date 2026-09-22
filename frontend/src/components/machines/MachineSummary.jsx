import { motion } from "motion/react";
import { FiDatabase } from "react-icons/fi";

const BAND_COLORS = {
  Low: "var(--color-status-success)",
  Medium: "var(--color-status-warning)",
  High: "var(--color-status-danger)",
};

function MachineSummary({ machines }) {
  const total = machines.length;

  const highRisk = machines.filter((m) => m.riskBand === "High").length;
  const mediumRisk = machines.filter((m) => m.riskBand === "Medium").length;
  const lowRisk = machines.filter((m) => m.riskBand === "Low").length;

  const bandCounts = [
    { band: "High", count: highRisk, label: "high risk" },
    { band: "Medium", count: mediumRisk, label: "medium risk" },
    { band: "Low", count: lowRisk, label: "low risk" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border-subtle bg-bg-card px-4 py-3"
    >
      <span className="flex items-center gap-2">
        <FiDatabase className="text-base text-text-muted" />
        <span className="text-sm font-semibold tabular-nums text-text-main">
          {total.toLocaleString()}
        </span>
        <span className="text-xs text-text-muted">records</span>
      </span>

      <span className="hidden h-4 w-px bg-border-subtle sm:block" />

      {bandCounts.map(({ band, count, label }) => (
        <span key={band} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: BAND_COLORS[band] }}
          />
          <span className="font-medium tabular-nums text-text-main">
            {count.toLocaleString()}
          </span>
          <span className="text-text-muted">{label}</span>
        </span>
      ))}
    </motion.div>
  );
}

export default MachineSummary;