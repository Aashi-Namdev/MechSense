import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiZap,
} from "react-icons/fi";
import { mockPredict } from "../data/predict.js";
import Card from "../components/dashboard/Card.jsx";
import RiskBadge from "../components/machines/RiskBadge.jsx";
import { BAND_COLORS } from "../components/machines/riskColors.js";

const defaultValues = {
  type: "M",
  airTemp: 300.1,
  processTemp: 310.1,
  rpm: 1503,
  torque: 40.1,
  toolWear: 108,
};

const NUMBER_FIELDS = [
  {
    name: "airTemp",
    label: "Air Temperature",
    unit: "K",
    step: 0.1,
  },
  {
    name: "processTemp",
    label: "Process Temperature",
    unit: "K",
    step: 0.1,
  },
  {
    name: "rpm",
    label: "Rotational Speed",
    unit: "rpm",
    step: 1,
  },
  {
    name: "torque",
    label: "Torque",
    unit: "Nm",
    step: 0.1,
  },
  {
    name: "toolWear",
    label: "Tool Wear",
    unit: "min",
    step: 1,
  },
];

const fieldClass =
  "w-full rounded-md border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none";

const selectClass = `${fieldClass} cursor-pointer`;

function Predict() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const values = watch();

  const airTemp = Number(values.airTemp);
  const processTemp = Number(values.processTemp);
  const temperatureDifference =
    Number.isNaN(airTemp) || Number.isNaN(processTemp)
      ? null
      : (processTemp - airTemp).toFixed(1);

  async function onSubmit(formValues) {
    setLoading(true);
    setError("");

    try {
      const prediction = await mockPredict(formValues);
      setResult(prediction);
    } catch {
      setError("Couldn't get a prediction, try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-text-main">
          Predict Failure Risk
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Enter machine sensor readings to estimate failure probability.
        </p>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* form */}
        <div className="lg:col-span-3">
          <Card title="Machine Sensor Inputs" delay={0.05}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Type */}
                <div>
                  <label className="mb-1.5 block text-sm text-text-secondary">
                    Type
                  </label>
                  <select {...register("type")} className={selectClass}>
                    <option value="H">H</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                  </select>
                </div>

                {/* Numeric sensors */}
                {NUMBER_FIELDS.map(({ name, label, unit, min, max, step }) => (
                  <div key={name}>
                    <label
                      htmlFor={name}
                      className="mb-1.5 block text-sm text-text-secondary"
                    >
                      {label}{" "}
                      <span className="text-xs text-text-muted">[{unit}]</span>
                    </label>
                    <input
                      id={name}
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      {...register(name, {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      className={fieldClass}
                    />
                    {errors[name] && (
                      <p className="mt-1.5 text-xs text-status-danger">
                        {errors[name].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Temperature difference  */}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-border-subtle bg-bg-card-elevated px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-text-secondary">
                  <FiActivity className="text-base text-primary" />
                  Temperature Difference
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tabular-nums text-text-main">
                    {temperatureDifference === null
                      ? "—"
                      : temperatureDifference}
                  </span>
                  <span className="text-xs text-text-muted">K</span>
                </span>
              </div>

              {/* Inline error */}
              {error && (
                <p className="mt-4 flex items-center gap-2 rounded-md border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-xs text-status-danger">
                  <FiAlertTriangle className="shrink-0" />
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-bg-base transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Predict Failure Risk
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          <Card title="Prediction Result" delay={0.1}>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-muted">
                <FiLoader className="animate-spin" />
                Predicting...
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <FiActivity className="text-2xl text-text-muted" />
                <p className="text-sm font-medium text-text-secondary">
                  No prediction yet
                </p>
                <p className="max-w-[240px] text-xs text-text-muted">
                  Fill in the sensor inputs and press Predict Failure Risk.
                </p>
              </div>
            )}

            {!loading && result && (
              <motion.div
                key={result.probability}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-text-muted">Failure Probability</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-text-main">
                  {(result.probability * 100).toFixed(2)}%
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-card-elevated">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${result.probability * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        BAND_COLORS[result.riskBand] ??
                        "var(--color-text-muted)",
                    }}
                  />
                </div>

                <div className="mt-5 divide-y divide-border-subtle border-y border-border-subtle">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-text-muted">Risk</span>
                    <RiskBadge band={result.riskBand} />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-text-muted">Prediction</span>
                    {result.predictedFailure === 1 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-status-warning">
                        <FiAlertTriangle className="shrink-0" />
                        Failure predicted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                        <FiCheckCircle className="shrink-0 text-status-success" />
                        Normal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-text-muted">Threshold</span>
                    <span className="text-xs font-medium tabular-nums text-text-secondary">
                      {result.threshold}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Predict;
