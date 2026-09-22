import Card from "../dashboard/Card.jsx";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const RESULT_STYLES = {
  Correct: { color: "var(--color-status-success)" },
  "False alarm": { color: "var(--color-status-warning)" },
  Missed: { color: "var(--color-status-danger)" },
};

function OutcomeCard({ machine }) {
  const resultStyle =
    RESULT_STYLES[machine.outcome] ?? { color: "var(--color-text-muted)" };

  return (
    <Card title="Prediction Outcome" delay={0.1}>
      <div className="space-y-3">
        {/* Predicted */}
        <div className="flex items-center justify-between rounded-lg bg-bg-card-elevated px-3.5 py-3">
          <span className="text-sm text-text-secondary">Predicted</span>
          {machine.predictedFailure === 1 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-main">
              <FiAlertTriangle className="shrink-0 text-status-warning" />
              Failure
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-main">
              <FiCheckCircle className="shrink-0 text-text-muted" />
              Normal
            </span>
          )}
        </div>

        {/* Actual */}
        <div className="flex items-center justify-between rounded-lg bg-bg-card-elevated px-3.5 py-3">
          <span className="text-sm text-text-secondary">Actual</span>
          {machine.actualFailure === 1 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-danger">
              <span className="h-2 w-2 rounded-full bg-status-danger" />
              Failure
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-success">
              <span className="h-2 w-2 rounded-full bg-status-success" />
              Normal
            </span>
          )}
        </div>

        {/* Result */}
        <div className="flex items-center justify-between rounded-lg bg-bg-card-elevated px-3.5 py-3">
          <span className="text-sm text-text-secondary">Result</span>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={resultStyle}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: resultStyle.color }}
            />
            {machine.outcome}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        &quot;Actual&quot; is the historical dataset label for this record. It
        compares what the model predicted with what the recorded data says.
      </p>
    </Card>
  );
}

export default OutcomeCard;