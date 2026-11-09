import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiAlertOctagon,
  FiAlertTriangle,
  FiDatabase,
  FiLoader,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import { getDashboard } from "../services/api.js";
import KpiCard from "../components/dashboard/KpiCard.jsx";
import TargetDistribution from "../components/dashboard/TargetDistribution.jsx";
import FailureModeDistribution from "../components/dashboard/FailureModeDistribution.jsx";
import FailureRateChart from "../components/dashboard/FailureRateChart.jsx";
import RiskDistribution from "../components/dashboard/RiskDistribution.jsx";
import TorqueRpmScatter from "../components/dashboard/TorqueRpmScatter.jsx";

function withFailureRate(bins) {
  return bins.map((bin) => ({
    ...bin,
    failureRatePct: bin.failure_rate_pct,
  }));
}

function withFailureModePercent(items) {
  return items.map((item) => ({
    ...item,
    percentOfFailures: item.percent_of_failures,
  }));
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FiLoader className="animate-spin text-xl text-primary" />
      <p className="text-sm font-medium text-text-secondary">
        Loading dashboard…
      </p>
      <p className="text-xs text-text-muted">
        Preparing the latest machine and failure data.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FiAlertCircle className="text-2xl text-status-danger" />
      <p className="text-sm font-medium text-text-main">
        Couldn&apos;t load dashboard data
      </p>
      <p className="max-w-md text-xs text-text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-card px-3 py-1.5 text-xs font-medium text-text-main transition-colors hover:bg-bg-card-elevated cursor-pointer"
      >
        <FiRefreshCw className="text-sm" />
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <FiDatabase className="text-2xl text-text-muted" />
      <p className="text-sm font-medium text-text-main">
        No machine data available
      </p>
      <p className="max-w-md text-xs text-text-muted">
        Data will appear here when machine records are available.
      </p>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getDashboard(controller.signal)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message || "Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  const summary = data?.summary;
  const charts = data?.failure_rate_charts;

  const kpiItems = [
    {
      icon: FiDatabase,
      label: "Total Machines",
      value: summary?.total ?? 0,
      accent: "text-primary",
    },
    {
      icon: FiAlertTriangle,
      label: "Actual Machine Failures",
      value: summary?.actual_failures ?? 0,
      accent: "text-status-danger",
    },
    {
      icon: FiAlertOctagon,
      label: "Predicted Failures",
      value: summary?.predicted_failures ?? 0,
      accent: "text-status-warning",
    },
    {
      icon: FiShield,
      label: "High-Risk Machines",
      value: summary?.high_risk ?? 0,
      accent: "text-status-warning",
    },
  ];

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

      {error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : loading && !data ? (
        <LoadingState />
      ) : !data || !summary || summary.total === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiItems.map((item, index) => (
              <KpiCard key={item.label} {...item} delay={index * 0.08} />
            ))}
          </div>

          {/* Dataset distributions: failure rate and failure-mode composition */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TargetDistribution data={data.target_distribution} />
            <FailureModeDistribution
              data={withFailureModePercent(
                data.failure_mode_distribution,
              )}
            />
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
                  data={withFailureRate(charts?.tool_wear ?? [])}
                  color="var(--color-primary)"
                  height={240}
                />
              </div>
              <FailureRateChart
                title="Failure Rate by Type"
                data={withFailureRate(charts?.type ?? [])}
                dataKey="label"
                color="var(--color-secondary)"
                height={240}
              />
            </div>

            {/* Torque and Rotational speed */}
            <div className="grid gap-4 md:grid-cols-2">
              <FailureRateChart
                title="Failure Rate by Torque Range"
                data={withFailureRate(charts?.torque ?? [])}
                height={200}
              />
              <FailureRateChart
                title="Failure Rate by Rotational Speed Range"
                data={withFailureRate(charts?.rpm ?? [])}
                height={200}
              />
            </div>

            {/* Temperature difference */}
            <FailureRateChart
              title="Failure Rate by Temperature Difference Range"
              data={withFailureRate(charts?.temperature_difference ?? [])}
              color="var(--color-status-warning)"
              height={200}
            />
          </motion.section>

          {/* Risk and scatter */}
          <div className="grid gap-4 lg:grid-cols-2">
            <RiskDistribution data={data.risk_distribution} />
            <TorqueRpmScatter data={data.torque_rpm_scatter} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
