import { motion } from "motion/react";
import {
  FiActivity,
  FiAlertTriangle,
  FiSliders,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";
import SectionHeading from "./SectionHeading.jsx";

const STAGES = [
  {
    icon: FiActivity,
    title: "Sensor Data",
    description:
      "Machine sensor readings: air and process temperature, rotational speed, torque, and tool wear.",
  },
  {
    icon: FiSliders,
    title: "Feature Engineering",
    description:
      "The readings are converted into the features the model needs, such as the temperature difference.",
  },
  {
    icon: FiTrendingUp,
    title: "Failure Prediction",
    badge: "Stage 1",
    description:
      "A first model estimates the probability of failure and converts it into a Low / Medium / High risk level.",
  },
  {
    icon: FiAlertTriangle,
    title: "Cause Detection",
    badge: "Stage 2",
    description:
      "Only when the predicted probability crosses the decision threshold, a second stage estimates the most likely failure mode.",
  },
  {
    icon: FiTool,
    title: "Recommended Action",
    description:
      "The most likely failure mode is mapped to a predefined maintenance action for the affected part.",
  },
];

function Stage({ stage, index, isLast }) {
  const { icon: Icon, title, description, badge } = stage;

  return (
    <div className="relative flex gap-5">
      {/* Marker and the segment of the connecting line below it */}
      <div className="relative w-10 shrink-0">
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
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="z-10 mt-1 flex h-10 w-10 items-center justify-center rounded-full border bg-bg-card"
        >
          <motion.span
            initial={{ color: "var(--color-text-muted)" }}
            whileInView={{ color: "var(--color-primary)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.05 + 0.05 }}
            className="text-base"
          >
            <Icon />
          </motion.span>
        </motion.div>

        {/* The line is drawn as the stage comes into view */}
        {!isLast && (
          <motion.span
            initial={{ scaleY: 0, opacity: 0.3 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="absolute left-5 top-11 -bottom-7 w-px origin-top bg-gradient-to-b from-primary/50 via-border-subtle to-border-subtle"
          />
        )}
      </div>

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
        transition={{ duration: 0.5, delay: index * 0.05 + 0.08 }}
        className="flex-1 rounded-xl border bg-bg-card p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
            Step 0{index + 1}
          </p>
          {badge && (
            <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              {badge}
            </span>
          )}
        </div>
        <motion.h3
          initial={{ color: "var(--color-text-muted)" }}
          whileInView={{ color: "var(--color-text-main)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: index * 0.05 + 0.12 }}
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
        subtitle="Sensor readings are processed to calculate the required features. The first model estimates the probability of machine failure. If failure risk crosses the decision threshold, a second stage identifies the most likely failure mode and maps it to a maintenance recommendation."
      />

      <div className="relative mx-auto mt-10 max-w-2xl">
        <div className="space-y-6">
          {STAGES.map((stage, index) => (
            <Stage
              key={stage.title}
              stage={stage}
              index={index}
              isLast={index === STAGES.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
