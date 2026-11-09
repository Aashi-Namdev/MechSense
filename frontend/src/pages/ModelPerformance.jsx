import { motion } from "motion/react";
import { FiInfo } from "react-icons/fi";
import Card from "../components/dashboard/Card.jsx";
import {
  finalConfusionMatrix,
  finalModel,
} from "../data/modelComparison.js";

function MetricCard({ label, value, unit = "%" }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-text-main">
        {typeof value === "number" ? value.toFixed(2) : value}
        {unit && (
          <span className="text-sm font-normal text-text-muted">{unit}</span>
        )}
      </p>
    </div>
  );
}

function MatrixCell({ value, label, tone }) {
  const toneClass = {
    correct:
      "border-status-success/30 bg-status-success/10 text-status-success",
    warning:
      "border-status-warning/30 bg-status-warning/10 text-status-warning",
    danger: "border-status-danger/30 bg-status-danger/10 text-status-danger",
  }[tone];

  return (
    <div
      className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-2 ${toneClass}`}
    >
      <span className="text-xl font-semibold tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

function PipelineStage({ label, title, description, isLast }) {
  return (
    <div className="relative">
      <div className="rounded-xl border border-border-subtle bg-bg-card-elevated px-4 py-3.5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-text-main">{title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      </div>

      {!isLast && (
        <div
          aria-hidden="true"
          className="mx-auto flex h-6 w-px items-center justify-center bg-border-subtle"
        >
          <span className="text-[10px] leading-none text-text-muted">
            &darr;
          </span>
        </div>
      )}
    </div>
  );
}

function ModelPerformance() {
  const testTotal =
    finalConfusionMatrix.support.normal + finalConfusionMatrix.support.failure;
  const stage1Threshold = finalModel.threshold.toFixed(2);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-text-main">
          Model Performance
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          An overview of the machine learning models used in MechSense and their
          evaluation results.
        </p>
      </motion.header>

      {/* Prediction pipeline */}
      <Card title="Prediction Pipeline" delay={0.05}>
        <div className="max-w-2xl space-y-1">
          <PipelineStage
            label="Stage 1"
            title="XGBoost Failure Classifier"
            description="Predicts the probability of machine failure using sensor readings. A probability of 0.40 or higher is treated as a predicted failure."
          />
          <PipelineStage
            label="Stage 2"
            title="Logistic Regression MultiOutputClassifier"
            description="Runs when Stage 1 predicts a failure. It estimates probabilities for five failure types: TWF, HDF, PWF, OSF and RNF. Multiple failure types can be predicted together."
          />
          <PipelineStage
            isLast
            label="Application logic"
            title="Maintenance Recommendation"
            description="Maintenance recommendations are generated using rule-based application logic, not a third trained ML model."
          />
        </div>
      </Card>

      {/* Reconstructed Stage 1 metrics */}
      <Card title="Reconstructed Stage 1 Evaluation">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Accuracy" value={finalModel.accuracy} />
          <MetricCard label="Precision" value={finalModel.precision} />
          <MetricCard label="Recall" value={finalModel.recall} />
          <MetricCard label="F1-score" value={finalModel.f1Score} />
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-lg border border-status-warning/30 bg-status-warning/10 px-3.5 py-3">
          <FiInfo className="mt-0.5 shrink-0 text-base text-status-warning" />
          <p className="text-xs leading-relaxed text-text-secondary">
            These results were reconstructed using a stratified 80/20 split
            (random state 42). The reconstructed split reproduces the reported
            confusion matrix, but the original training and test records could
            not be independently verified. These metrics should not be
            interpreted as confirmed independent test performance.
          </p>
        </div>
      </Card>

      {/* Confusion matrix */}
      <Card title="Confusion Matrix">
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          Confusion matrix from the reconstructed{" "}
          {testTotal.toLocaleString()}-record stratified evaluation split at a
          threshold of {stage1Threshold}. Original test records could not be
          verified.
        </p>
        <div className="mx-auto w-full max-w-md">
          <div className="grid grid-cols-3 items-stretch gap-2 text-center">
            <div className="flex min-h-12 items-center justify-center rounded-md bg-bg-card-elevated/50 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary" />
            <div className="flex min-h-12 items-center justify-center rounded-md bg-bg-card-elevated/50 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              Predicted Normal
            </div>
            <div className="flex min-h-12 items-center justify-center rounded-md bg-bg-card-elevated/50 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              Predicted Failure
            </div>

            <div className="flex min-h-16 items-center justify-center rounded-md bg-bg-card-elevated/50 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              Actual Normal
            </div>
            <MatrixCell
              tone="correct"
              value={finalConfusionMatrix.trueNegative}
              label="True Negative"
            />
            <MatrixCell
              tone="warning"
              value={finalConfusionMatrix.falsePositive}
              label="False Positive"
            />

            <div className="flex min-h-16 items-center justify-center rounded-md bg-bg-card-elevated/50 px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
              Actual Failure
            </div>
            <MatrixCell
              tone="danger"
              value={finalConfusionMatrix.falseNegative}
              label="False Negative"
            />
            <MatrixCell
              tone="correct"
              value={finalConfusionMatrix.truePositive}
              label="True Positive"
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            At the {stage1Threshold} threshold, the model missed{" "}
            {finalConfusionMatrix.falseNegative} of{" "}
            {finalConfusionMatrix.support.failure} actual failures in this
            reconstructed evaluation.
          </p>
        </div>
      </Card>

      {/* Model information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Stage 1 Threshold">
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-main">
            {stage1Threshold}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            XGBoost failure probability at or above this value triggers Stage 2.
          </p>
        </Card>
        <Card title="Stage 2 Threshold" delay={0.05}>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-main">
            0.50
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            A failure type is included when its predicted probability is at or
            above this value.
          </p>
        </Card>
      </div>

      <p className="text-xs leading-relaxed text-text-muted">
        Stage 1 runs for every sensor reading. Only readings classified as
        failures continue to Stage 2, where the multi-output classifier
        estimates the five failure-type probabilities. Maintenance
        recommendations are then selected by rule-based application logic.
      </p>
    </div>
  );
}

export default ModelPerformance;
