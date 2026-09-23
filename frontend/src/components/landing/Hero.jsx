import { motion } from "motion/react";
import { FiArrowRight, FiZap } from "react-icons/fi";
import PrimaryButton from "./PrimaryButton.jsx";
import SecondaryButton from "./SecondaryButton.jsx";
import logo from "../../assets/MechSenseLogo.png";
import heroImage from "../../assets/hero.png";

function Hero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-20 pt-24 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <img
            src={logo}
            alt="MechSense logo"
            className="h-13 w-13 shrink-0 object-contain"
          />
          <div className="text-left">
            <p className="text-base font-semibold tracking-tight text-text-main">
              MechSense
            </p>
            <p className="text-[11px] uppercase tracking-widest text-text-muted">
              IIoT Predictive Maintenance
            </p>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-10 max-w-xl text-4xl font-semibold tracking-tight text-text-main sm:text-5xl"
        >
          Predictive Maintenance for Industrial IoT
        </motion.h1>

        {/* Supporting line */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base"
        >
          MechSense uses machine-learning-based failure prediction to identify
          high-risk machine conditions from sensor readings.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <PrimaryButton
            to="/dashboard"
            onClick={window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Explore Dashboard
            <FiArrowRight />
          </PrimaryButton>
          <SecondaryButton
            to="/predict"
            onClick={window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <FiZap />
            Try Prediction
          </SecondaryButton>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
