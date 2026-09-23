import { motion } from "motion/react";
import { FiInfo } from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";

const SENSORS = [
  { name: "Air Temperature", unit: "K" },
  { name: "Process Temperature", unit: "K" },
  { name: "Rotational Speed", unit: "rpm" },
  { name: "Torque", unit: "Nm" },
  { name: "Tool Wear", unit: "min" },
];

function AboutTheMachines() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Text */}
        <div>
          <SectionHeading eyebrow="What we monitor" title="About the Machines" />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            The dataset contains industrial machine records across three product
            quality types — High (H), Medium (M), and Low (L). Each record
            contains five sensor readings: air temperature, process temperature,
            rotational speed, torque, and tool wear.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            Across 10,000 machine records, 3.39% ended in failure. MechSense
            learns from these patterns to recognize which operating conditions
            make a machine likely to fail.
          </motion.p>
        </div>

        {/* Sensor panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="rounded-xl border border-border-subtle bg-bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
              Dataset sensor inputs
            </p>
            <div className="mt-4 space-y-2.5">
              {SENSORS.map((sensor) => (
                <div
                  key={sensor.name}
                  className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-card-elevated px-4 py-3"
                >
                  <span className="text-sm text-text-secondary">
                    {sensor.name}
                  </span>
                  <span className="text-xs tabular-nums text-text-muted">
                    {sensor.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scope note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-lg border border-border-subtle bg-bg-card p-4"
      >
        <FiInfo className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-text-secondary">
          <span className="font-medium text-text-main">Current model scope:</span>{" "}
          trained and evaluated on the AI4I 2020 dataset. A real deployment
          would require validation on data from the target machines and
          production environment.
        </p>
      </motion.div>
    </section>
  );
}

export default AboutTheMachines;