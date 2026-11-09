import { useEffect, useState } from "react";
import { motion } from "motion/react";
import SectionHeading from "./SectionHeading.jsx";

import { getDashboard } from "../../services/api.js";

function DatasetOverview() {
  const [summary, setSummary] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getDashboard(controller.signal)
      .then((response) => {
        if (active) {
          setSummary(response?.summary ?? null);
          setUnavailable(!response?.summary);
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          setSummary(null);
          setUnavailable(true);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const total = summary?.total;
  const actualFailures = summary?.actual_failures;
  const failureRate =
    typeof total === "number" && total > 0 && typeof actualFailures === "number"
      ? `${((actualFailures / total) * 100).toFixed(2)}%`
      : "—";
  const stats = [
    {
      value: typeof total === "number" ? total.toLocaleString() : "—",
      label: "Machine Records",
    },
    { value: "3", label: "Product Quality Types" },
    { value: "5", label: "Sensor Inputs" },
    { value: failureRate, label: "Failure Rate" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The data"
        title="Dataset Overview"
        subtitle="Trained on the AI4I 2020 Predictive Maintenance Dataset."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-xl border border-border-subtle bg-bg-card p-5"
          >
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-main">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      {unavailable && (
        <p className="mt-3 text-xs text-text-muted">
          Live dataset statistics are temporarily unavailable.
        </p>
      )}

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 text-sm leading-relaxed text-text-muted"
      >
        In addition to the five raw sensor readings, MechSense uses the
        temperature difference between process and air temperature as an
        engineered feature. Because failures are uncommon, the dataset is
        imbalanced — predicting the majority class is easy, catching an actual
        failure is the real challenge.
      </motion.p>
    </section>
  );
}

export default DatasetOverview;
