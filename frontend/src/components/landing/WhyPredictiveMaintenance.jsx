import { motion } from "motion/react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCpu,
} from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";

function WhyPredictiveMaintenance() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Text */}
        <div>
          <SectionHeading
            eyebrow="The problem"
            title="Why Predictive Maintenance?"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            Unplanned machine failure is costly and difficult to anticipate from
            raw sensor readings alone. MechSense uses machine learning to
            analyze operating conditions and flag high-risk machines before
            failure.
          </motion.p>
        </div>

        {/* Simple flow visual */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
              Sensor Readings &larr; Risk Detection
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex flex-1 flex-col items-center gap-2 rounded-lg bg-bg-card-elevated px-4 py-6">
                <FiActivity className="text-lg text-text-secondary" />
                <span className="text-center text-xs text-text-muted">
                  Sensor Readings
                </span>
              </div>
              <FiArrowRight className="shrink-0 text-primary" />
              <div className="flex flex-1 flex-col items-center gap-2 rounded-lg bg-bg-card-elevated px-4 py-6">
                <FiCpu className="text-lg text-text-secondary" />
                <span className="text-center text-xs text-text-muted">
                  Failure Prediction
                </span>
              </div>
              <FiArrowRight className="shrink-0 text-primary" />
              <div className="flex flex-1 flex-col items-center gap-2 rounded-lg bg-bg-card-elevated px-4 py-6">
                <FiAlertTriangle className="text-lg text-status-warning" />
                <span className="text-center text-xs text-text-muted">
                  Risk Detection
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default WhyPredictiveMaintenance;
