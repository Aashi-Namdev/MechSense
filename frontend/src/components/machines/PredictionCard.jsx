import { motion } from "motion/react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import Card from "../dashboard/Card.jsx";
import { CLASSIFICATION_THRESHOLD } from "../../data/constants.js";
import { BAND_COLORS } from "./riskColors.js";

function PredictionCard({ machine }) {
  const percent = (machine.probability * 100).toFixed(2);
  const bandColor = BAND_COLORS[machine.riskBand] ?? "var(--color-text-muted)";
  const predictedFailure = machine.predictedFailure === 1;

  return (
    <Card title="Failure Prediction" delay={0.05}>
      <p className="text-xs text-text-muted">Failure Probability</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-text-main">
        {percent}%
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-card-elevated">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${machine.probability * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: bandColor }}
        />
      </div>

      <div className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-text-muted">Risk</span>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: bandColor }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: bandColor }}
            />
            {machine.riskBand}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-text-muted">Predicted Failure</span>
          {predictedFailure ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-warning">
              <FiAlertTriangle className="shrink-0" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <FiCheckCircle className="shrink-0 text-status-success" />
              No
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-xs text-text-muted">Threshold</span>
          <span className="text-sm font-medium tabular-nums text-text-secondary">
            {(CLASSIFICATION_THRESHOLD * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        A high probability is a prediction, not proof that the machine has
        failed.
      </p>
    </Card>
  );
}

export default PredictionCard;
