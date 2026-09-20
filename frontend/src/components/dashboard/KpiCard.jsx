import { motion } from "motion/react";

function KpiCard({ icon: Icon, label, value, accent, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border-subtle bg-bg-card p-4"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-md bg-bg-card-elevated text-base ${accent}`}
        >
          <Icon />
        </span>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-main">
        {value.toLocaleString()}
      </p>
    </motion.div>
  );
}

export default KpiCard;
