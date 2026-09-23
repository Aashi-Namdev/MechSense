import { motion } from "motion/react";
import { FiActivity, FiAlertTriangle, FiSliders, FiTrendingUp } from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";

const STAGES = [
  {
    icon: FiActivity,
    title: "Sensor Data",
    description: "Machine sensor readings are provided to the system.",
  },
  {
    icon: FiSliders,
    title: "Feature Engineering",
    description:
      "The system calculates temperature difference from process and air temperature.",
  },
  {
    icon: FiTrendingUp,
    title: "Failure Prediction",
    description:
      "The trained model estimates the probability of machine failure.",
  },
  {
    icon: FiAlertTriangle,
    title: "Risk & Action",
    description:
      "The probability is converted into a Low / Medium / High risk level and used to present a maintenance-oriented recommendation.",
  },
];

function Stage({ stage, index }) {
  const { icon: Icon, title, description } = stage;

  return (
    <div className="relative flex gap-5">
      {/* Marker on the line */}
      <motion.div
        initial={{
          opacity: 0.5,
          borderColor: "var(--color-border-subtle)",
          boxShadow: "0 0 0 0 rgba(0,184,217,0)",
        }}
        whileInView={{
          opacity: 1,
          borderColor: "var(--color-primary)",
          boxShadow: "0 0 0 6px rgba(0,184,217,0.08)",
        }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-bg-card"
      >
        <motion.span
          initial={{ color: "var(--color-text-muted)" }}
          whileInView={{ color: "var(--color-primary)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="text-base"
        >
          <Icon />
        </motion.span>
      </motion.div>

      {/* Stage content */}
      <motion.div
        initial={{
          opacity: 0,
          y: 16,
          borderColor: "var(--color-border-subtle)",
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          borderColor: "rgba(0,184,217,0.35)",
        }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 rounded-xl border bg-bg-card p-4 sm:p-5"
      >
        <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
          Step 0{index + 1}
        </p>
        <motion.h3
          initial={{ color: "var(--color-text-muted)" }}
          whileInView={{ color: "var(--color-text-main)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-1 text-sm font-medium"
        >
          {title}
        </motion.h3>
        <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      </motion.div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="The pipeline"
        title="How It Works"
        subtitle="From sensor readings to actionable failure risk."
      />

      <div className="relative mx-auto mt-10 max-w-2xl">
        {/* Connecting line */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-10 left-5 top-10 w-px -translate-x-1/2 bg-border-subtle"
        />

        <div className="space-y-6">
          {STAGES.map((stage, index) => (
            <Stage key={stage.title} stage={stage} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;