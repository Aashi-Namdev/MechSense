import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowLeft } from "react-icons/fi";
import { MOCK_MACHINES } from "../data/machines.js";
import PredictionCard from "../components/machines/PredictionCard.jsx";
import LikelyCauseCard from "../components/machines/LikelyCauseCard.jsx";
import RecommendedActionCard from "../components/machines/RecommendedActionCard.jsx";
import OutcomeCard from "../components/machines/OutcomeCard.jsx";
import SensorReadings from "../components/machines/SensorReadings.jsx";
import SensorComparison from "../components/machines/SensorComparison.jsx";

function MachinesDetail() {
  const { id } = useParams();
  const machine = MOCK_MACHINES.find((item) => item.id === Number(id));

  // if machine not found
  if (!machine) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/machines"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-text-main"
        >
          <FiArrowLeft className="text-base" />
          Back to Machines
        </Link>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-4 py-16 text-center">
          <p className="text-sm font-medium text-text-main">
            Machine not found
          </p>
          <p className="text-xs text-text-muted">
            No machine record matches id &quot;{id}&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          to="/machines"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline"
        >
          <FiArrowLeft className="text-base" />
          Back to Machines
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-text-main">
            {machine.productId}
          </h1>
          <span className="inline-flex rounded-md bg-bg-card-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
            Type {machine.type}
          </span>
        </div>
      </motion.header>

      {/* Prediction, likely cause, and recommended action */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PredictionCard machine={machine} />
        <LikelyCauseCard machine={machine} />
        <RecommendedActionCard machine={machine} />
      </div>

      {/* Ground truth */}
      <OutcomeCard machine={machine} />

      {/* Sensor readings */}
      <SensorReadings machine={machine} />

      {/* Sensor vs historical average */}
      <SensorComparison machine={machine} />
    </div>
  );
}

export default MachinesDetail;
