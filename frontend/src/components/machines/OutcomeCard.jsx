import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import Card from "../dashboard/Card.jsx";
import { FAILURE_MODES } from "../../data/constants.js";

const RESULT_STYLES = {
  Correct: { color: "var(--color-status-success)" },
  "False alarm": { color: "var(--color-status-warning)" },
  Missed: { color: "var(--color-status-danger)" },
};

function OutcomeCard({ machine }) {
  const resultStyle = RESULT_STYLES[machine.outcome] ?? {
    color: "var(--color-text-muted)",
  };

  const recordedModes =
    machine.actualFailure === 1 ? (machine.actualFailureModes ?? []) : [];

  return (
    <Card title="Actual Dataset Outcome" delay={0.1}>
      <p className="text-sm text-text-muted">
        Recorded label from the dataset for this record — ground truth, not a
        model output.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* Predicted */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-card-elevated px-3.5 py-3 sm:flex-col sm:items-start sm:gap-1.5">
          <span className="text-xs text-text-muted">Predicted</span>
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
        <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-card-elevated px-3.5 py-3 sm:flex-col sm:items-start sm:gap-1.5">
          <span className="text-xs text-text-muted">Actual</span>
          {machine.actualFailure === 1 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-danger">
              <span className="h-2 w-2 shrink-0 rounded-full bg-status-danger" />
              Failure
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-status-success">
              <span className="h-2 w-2 shrink-0 rounded-full bg-status-success" />
              Normal
            </span>
          )}
        </div>

        {/* Result */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-bg-card-elevated px-3.5 py-3 sm:flex-col sm:items-start sm:gap-1.5">
          <span className="text-xs text-text-muted">Result</span>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={resultStyle}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: resultStyle.color }}
            />
            {machine.outcome}
          </span>
        </div>
      </div>

      {recordedModes.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-bg-card-elevated px-3.5 py-3">
          <span className="text-xs text-text-muted">
            Recorded Failure Mode(s)
          </span>
          {recordedModes.map((mode) => (
            <span
              key={mode}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-card px-2 py-0.5 text-xs text-text-secondary"
            >
              <span className="font-medium text-text-main">{mode}</span>
              {FAILURE_MODES[mode]?.label}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        The dataset&apos;s recorded outcome and failure mode(s) are used to
        evaluate the model&apos;s predictions.
      </p>
    </Card>
  );
}

export default OutcomeCard;
