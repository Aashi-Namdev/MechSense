import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";

const STEPS = [
  { label: "Preprocessing & Feature Engineering", number: "01" },
  { label: "Model Training", number: "02" },
  { label: "Model Comparison", number: "03" },
  { label: "XGBoost Selection", number: "04" },
  { label: "Threshold Tuning", number: "05" },
];

function ModelApproach() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Modeling"
        title="Model Approach"
        subtitle="Four models were trained and compared — Logistic Regression, Decision Tree, Random Forest, and XGBoost. XGBoost was selected as the final model."
      />

      {/* Horizontal pipeline on desktop, stacked on mobile */}
      <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative rounded-xl border border-border-subtle bg-bg-card p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
              {step.number}
            </p>
            <p className="mt-1 text-sm font-medium text-text-main">
              {step.label}
            </p>
            {index < STEPS.length - 1 && (
              <FiArrowRight className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-sm bg-bg-base p-0.5 text-sm text-text-muted lg:block" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 space-y-3 max-w-3xl text-sm leading-relaxed text-text-muted"
      >
        <p>
          <strong className="text-text-main">Stage 1:</strong> XGBoost failure
          prediction.
        </p>
        <p>
          <strong className="text-text-main">Stage 2:</strong> Failure-mode
          identification (estimates the likely failure mode(s) when Stage 1
          predicts failure).
        </p>
        <p>
          <strong className="text-text-main">Maintenance logic:</strong> The
          predicted mode is passed to a rule-based layer that calculates a
          quantitative target from the project&apos;s simulated dataset rules.
          These targets are deterministic application logic, not ML
          predictions.
        </p>
        <p>
          The classification threshold was tuned to 0.40 to maintain high failure
          recall while accepting additional false alarms. At this threshold,
          predictions classified as failure are passed to the second stage for
          likely failure-mode analysis.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="mt-6"
      >
        <Link
          to="/model-performance"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-text-main"
        >
          View Model Performance
          <FiArrowRight />
        </Link>
      </motion.div>
    </section>
  );
}

export default ModelApproach;
