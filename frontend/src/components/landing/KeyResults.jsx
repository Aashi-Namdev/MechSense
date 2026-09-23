import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";
import { finalModel } from "../../data/modelComparison.js";

const METRICS = [
  {
    value: finalModel.recall.toFixed(2),
    label: "Recall",
    note: "of actual failures caught",
  },
  {
    value: finalModel.rocAuc.toFixed(2),
    label: "ROC-AUC",
    note: "discrimination quality",
  },
];

function KeyResults() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Performance"
        title="Key Results"
        subtitle="Final model — XGBoost, evaluated on the untouched test set."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-xl border border-border-subtle bg-bg-card p-6"
          >
            <p className="flex items-baseline gap-1 text-4xl font-semibold tabular-nums tracking-tight text-text-main">
              {metric.value}
              <span className="text-lg text-text-muted">%</span>
            </p>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              {metric.label}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{metric.note}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 max-w-3xl text-sm leading-relaxed text-text-muted"
      >
        Caught approximately 9 out of 10 actual failures on unseen test data.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.26 }}
        className="mt-6"
      >
        <Link
          to="/model-performance"
          onClick={window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-text-main"
        >
          See full model comparison
          <FiArrowRight />
        </Link>
      </motion.div>
    </section>
  );
}

export default KeyResults;
