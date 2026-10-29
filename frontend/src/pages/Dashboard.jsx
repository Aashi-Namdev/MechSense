import { motion } from "motion/react";
import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiDatabase,
} from "react-icons/fi";
import {
  kpiCards,
  rpmFailureRate,
  temperatureDifferenceFailureRate,
  toolWearFailureRate,
  torqueFailureRate,
  typeFailureRate,
} from "../data/dashboard.js";
import KpiCard from "../components/dashboard/KpiCard.jsx";
import TargetDistribution from "../components/dashboard/TargetDistribution.jsx";
import FailureModeDistribution from "../components/dashboard/FailureModeDistribution.jsx";
import FailureRateChart from "../components/dashboard/FailureRateChart.jsx";
import RiskDistribution from "../components/dashboard/RiskDistribution.jsx";
import TorqueRpmScatter from "../components/dashboard/TorqueRpmScatter.jsx";

const kpiItems = [
  {
    icon: FiDatabase,
    label: "Records Analyzed",
    value: kpiCards.totalRecords,
    accent: "text-primary",
  },
  {
    icon: FiAlertTriangle,
    label: "Overall Failure Rate",
    value: kpiCards.overallFailureRatePct,
    decimals: 2,
    suffix: "%",
    accent: "text-status-danger",
  },
  {
    icon: FiCheckCircle,
    label: "Model Recall",
    value: kpiCards.modelRecallPct,
    decimals: 2,
    suffix: "%",
    accent: "text-status-success",
  },
  {
    icon: FiAlertOctagon,
    label: "High-Risk Predictions",
    value: kpiCards.highRiskCount,
    accent: "text-status-warning",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-text-main">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Predictive maintenance analysis of industrial sensor records.
        </p>
      </motion.header>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item, index) => (
          <KpiCard key={item.label} {...item} delay={index * 0.08} />
        ))}
      </div>

      {/* Dataset distributions: failure rate and failure-mode composition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TargetDistribution />
        <FailureModeDistribution />
      </div>

      {/* Failure analysis */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        <div>
          <h2 className="text-base font-semibold text-text-main">
            Failure Analysis
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Observed failure rates across key operating conditions.
          </p>
        </div>

        {/* Tool wear and Type */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FailureRateChart
              title="Failure Rate by Tool Wear Range"
              data={toolWearFailureRate}
              color="var(--color-primary)"
              height={240}
            />
          </div>
          <FailureRateChart
            title="Failure Rate by Type"
            data={typeFailureRate}
            dataKey="label"
            color="var(--color-secondary)"
            height={240}
          />
        </div>

        {/* Torque and Rotational speed */}
        <div className="grid gap-4 md:grid-cols-2">
          <FailureRateChart
            title="Failure Rate by Torque Range"
            data={torqueFailureRate}
            height={200}
          />
          <FailureRateChart
            title="Failure Rate by Rotational Speed Range"
            data={rpmFailureRate}
            height={200}
          />
        </div>

        {/* Temperature difference */}
        <FailureRateChart
          title="Failure Rate by Temperature Difference Range"
          data={temperatureDifferenceFailureRate}
          color="var(--color-status-warning)"
          height={200}
        />
      </motion.section>

      {/* Risk and  scatter */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RiskDistribution />
        <TorqueRpmScatter />
      </div>
    </div>
  );
}

export default Dashboard;
