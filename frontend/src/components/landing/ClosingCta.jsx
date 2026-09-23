import { motion } from "motion/react";
import PrimaryButton from "./PrimaryButton.jsx";
import SecondaryButton from "./SecondaryButton.jsx";

function ClosingCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">
          Explore MechSense
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-muted">
          Explore the dashboard, inspect machine predictions, or test the model
          with your own sensor values.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            to="/dashboard"
            onclick={window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Dashboard
          </PrimaryButton>
          <SecondaryButton
            to="/machines"
            onclick={window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Machines
          </SecondaryButton>
          <SecondaryButton
            to="/predict"
            onclick={window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Try Prediction
          </SecondaryButton>
        </div>
      </motion.div>
    </section>
  );
}

export default ClosingCta;
