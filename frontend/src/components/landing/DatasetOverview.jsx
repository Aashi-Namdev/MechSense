import { motion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";
import { kpiCards } from "../../data/dashboard.js";

const STATS = [
  { value: kpiCards.totalRecords.toLocaleString(), label: "Machine Records" },
  { value: "3", label: "Product Quality Types" },
  { value: "5", label: "Sensor Inputs" },
  { value: `${kpiCards.overallFailureRatePct}%`, label: "Failure Rate" },
];

function DatasetOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The data"
        title="Dataset Overview"
        subtitle="Trained on the AI4I 2020 Predictive Maintenance Dataset."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-xl border border-border-subtle bg-bg-card p-5"
          >
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-main">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 text-sm leading-relaxed text-text-muted"
      >
        In addition to the five raw sensor readings, MechSense uses the
        temperature difference between process and air temperature as an
        engineered feature. Because only 3.39% of the records are failures, the
        dataset is imbalanced — predicting the majority class is easy, catching
        an actual failure is the real challenge.
      </motion.p>
    </section>
  );
}

export default DatasetOverview;
