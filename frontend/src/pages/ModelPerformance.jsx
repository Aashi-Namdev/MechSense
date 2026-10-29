import { motion } from "motion/react";
import { FiTrendingUp } from "react-icons/fi";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/dashboard/Card.jsx";
import {
  finalConfusionMatrix,
  finalModel,
  modelComparisonTable,
  prCurves,
  rocCurves,
  thresholdTable,
} from "../data/modelComparison.js";

// Color per model
const MODEL_COLORS = {
  "Logistic Regression": "var(--color-text-muted)",
  "Decision Tree": "var(--color-status-warning)",
  "Random Forest": "var(--color-secondary)",
  XGBoost: "var(--color-primary)",
};

const ROC_SERIES = [
  { name: "Logistic Regression", data: rocCurves.logisticRegression },
  { name: "Decision Tree", data: rocCurves.decisionTree },
  { name: "Random Forest", data: rocCurves.randomForest },
  { name: "XGBoost", data: rocCurves.xgboost },
];

const PR_SERIES = [
  { name: "Logistic Regression", data: prCurves.logisticRegression },
  { name: "Decision Tree", data: prCurves.decisionTree },
  { name: "Random Forest", data: prCurves.randomForest },
  { name: "XGBoost", data: prCurves.xgboost },
];

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: "var(--color-bg-card-elevated)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "8px",
  padding: "8px 12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

const TOOLTIP_LABEL_STYLE = {
  color: "var(--color-text-main)",
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 4,
};

const TOOLTIP_ITEM_STYLE = {
  color: "var(--color-text-secondary)",
  fontSize: 12,
  padding: 0,
};

const LEGEND_STYLE = {
  paddingBottom: 8,
  fontSize: 12,
  color: "var(--color-text-secondary)",
};

function MetricCard({ label, value, unit = "%" }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-text-main">
        {value}
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
  const selectedModel = finalModel.name.split(" (")[0];

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
          Evaluation of the Stage-1 predictive maintenance model on the test
          dataset.
        </p>
      </motion.header>

      {/* Model selection statement */}
      <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-card px-4 py-3.5">
        <FiTrendingUp className="mt-0.5 shrink-0 text-base text-primary" />
        <p className="text-sm leading-relaxed text-text-secondary">
          {selectedModel} selected for its recall-precision balance, achieving{" "}
          {finalModel.rocAuc}% ROC-AUC.
        </p>
      </div>

      {/* Prediction pipeline */}
      <Card title="Prediction Pipeline" delay={0.05}>
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          The application runs a two-stage pipeline. The metrics on this page
          describe Stage 1.
        </p>

        <div className="max-w-2xl space-y-1">
          <PipelineStage
            label="Stage 1"
            title="Failure Risk"
            description="XGBoost estimates the probability of machine failure."
          />
          <PipelineStage
            label="Stage 2"
            title="Failure Mode"
            description="If the Stage-1 threshold is crossed, the system estimates the likely failure mode(s)."
          />
          <PipelineStage
            isLast
            label="Application logic"
            title="Recommendation"
            description="A rule-based layer calculates quantitative maintenance targets from the simulated dataset rules."
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-text-muted">
          Stage 1 metrics describe the XGBoost model only. Stage 2 and the
          maintenance targets are rule-based application logic, not a trained
          model, so no accuracy metrics are reported for them.
        </p>
      </Card>

      {/* Final model metrics */}
      <Card title="Final Model Metrics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          <MetricCard label="Accuracy" value={finalModel.accuracy} />
          <MetricCard label="Precision" value={finalModel.precision} />
          <MetricCard label="Recall" value={finalModel.recall} />
          <MetricCard label="F1" value={finalModel.f1Score} />
          <MetricCard label="ROC-AUC" value={finalModel.rocAuc} />
          <MetricCard label="PR-AUC" value={finalModel.prAuc} />
          <MetricCard
            label="Threshold"
            value={finalModel.threshold.toFixed(2)}
            unit=""
          />
        </div>
      </Card>

      {/* Model comparison table */}
      <Card title="Model Comparison">
        <p className="mb-4 text-xs text-text-muted">
          All models evaluated at the default 0.50 threshold.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead className="border-b border-border-subtle bg-bg-card-elevated/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Model
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Precision
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Recall
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  F1
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  ROC-AUC
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  PR-AUC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {modelComparisonTable.map((row) => {
                const isSelected = row.model === "XGBoost";
                return (
                  <tr
                    key={row.model}
                    className={isSelected ? "bg-bg-card-elevated" : ""}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-main">
                      {row.model}
                      {isSelected && (
                        <span className="ml-2 inline-flex rounded-md bg-primary/15 px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-primary">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.accuracy}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.precision}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.recall}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.f1Score}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.rocAuc}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {row.prAuc}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confusion matrix */}
      <Card title="Confusion Matrix">
        <p className="mb-4 text-xs text-text-muted">
          Final Model — Test Set ({testTotal.toLocaleString()} records),
          Threshold {finalModel.threshold.toFixed(2)}
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
            At the {finalModel.threshold.toFixed(2)} threshold, the model missed{" "}
            {finalConfusionMatrix.falseNegative} of{" "}
            {finalConfusionMatrix.support.failure} actual failures.
          </p>
        </div>
      </Card>

      {/* ROC and PR curves */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="ROC Curve">
          <p className="mb-4 text-xs text-text-muted">
            True positive rate vs false positive rate.
          </p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  dataKey="fpr"
                  domain={[0, 1]}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border-subtle)" }}
                  label={{
                    value: "False Positive Rate",
                    position: "outsideBottom",
                    offset: -16,
                    fill: "var(--color-text-muted)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, 1]}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  label={{
                    value: "True Positive Rate",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "var(--color-text-muted)",
                      fontSize: 11,
                    },
                  }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                />
                <Legend verticalAlign="top" wrapperStyle={LEGEND_STYLE} />
                {ROC_SERIES.map((series) => (
                  <Line
                    key={series.name}
                    name={series.name}
                    data={series.data}
                    dataKey="tpr"
                    type="monotone"
                    stroke={MODEL_COLORS[series.name]}
                    strokeWidth={series.name === "XGBoost" ? 2.5 : 1.75}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Precision-Recall Curve">
          <p className="mb-4 text-xs text-text-muted">
            Precision vs recall. Baseline is the dataset failure rate.
          </p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 10, right: 12, bottom: 8, left: 4 }}>
                <CartesianGrid
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  dataKey="recall"
                  domain={[0, 1]}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border-subtle)" }}
                  label={{
                    value: "Recall",
                    position: "ousideBottom",
                    offset: -16,
                    fill: "var(--color-text-muted)",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  domain={[0, 1]}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  label={{
                    value: "Precision",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "var(--color-text-muted)",
                      fontSize: 11,
                    },
                  }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                />
                <Legend verticalAlign="top" wrapperStyle={LEGEND_STYLE} />
                <ReferenceLine
                  y={prCurves.baselinePrecision}
                  stroke="var(--color-text-muted)"
                  strokeDasharray="4 4"
                  label={{
                    value: "Baseline",
                    position: "insideTopRight",
                    fill: "var(--color-text-muted)",
                    fontSize: 11,
                  }}
                />
                {PR_SERIES.map((series) => (
                  <Line
                    key={series.name}
                    name={series.name}
                    data={series.data}
                    dataKey="precision"
                    type="monotone"
                    stroke={MODEL_COLORS[series.name]}
                    strokeWidth={series.name === "XGBoost" ? 2.5 : 1.75}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Threshold selection */}
      <Card title="Threshold Selection">
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          Threshold {finalModel.threshold.toFixed(2)} was selected to maintain
          high failure recall while accepting additional false alarms. At this
          threshold, predictions classified as failure are passed to the second
          stage for likely failure-mode analysis.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-sm">
            <thead className="border-b border-border-subtle bg-bg-card-elevated/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Threshold
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Precision
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Recall
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                  F1
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {thresholdTable.map((row) => {
                const isSelected = row.selected === true;
                return (
                  <tr
                    key={row.threshold}
                    className={isSelected ? "bg-bg-card-elevated" : ""}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-text-main">
                      {row.threshold.toFixed(2)}
                      {isSelected && (
                        <span className="ml-2 inline-flex rounded-md bg-primary/15 px-1.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-primary">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                      {row.precision}%
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                      {row.recall}%
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-text-secondary">
                      {row.f1}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ModelPerformance;
