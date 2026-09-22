import { motion } from "motion/react";
import Card from "../dashboard/Card.jsx";
import { BAND_COLORS } from "./riskColors.js";

function PredictionCard({ machine }) {
  const percent = (machine.probability * 100).toFixed(2);
  const bandColor =
    BAND_COLORS[machine.riskBand] ?? "var(--color-text-muted)";

  return (
    <Card title="Failure Probability" delay={0.05}>
      <p className="text-4xl font-semibold tracking-tight tabular-nums text-text-main">
        {percent}%
      </p>
      <p className="mt-1.5 text-xs text-text-muted">
        Predicted failure probability for this record
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

      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="text-xs text-text-muted">Risk band</span>
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

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        Model prediction based on the recorded sensors. A high probability is a
        prediction, not proof that the machine has failed.
      </p>
    </Card>
  );
}

export default PredictionCard;