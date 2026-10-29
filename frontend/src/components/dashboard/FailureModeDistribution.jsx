import { motion } from "motion/react";
import { failureModeDistribution } from "../../data/dashboard.js";
import Card from "./Card.jsx";

const MODE_COLORS = {
  HDF: "var(--color-primary)",
  OSF: "var(--color-status-warning)",
  PWF: "var(--color-secondary)",
  TWF: "var(--color-status-success)",
};

function FailureModeDistribution() {
  const highest = Math.max(
    ...failureModeDistribution.map((item) => item.count),
  );

  return (
    <Card title="Failure Mode Distribution" delay={0.08}>
      <div className="space-y-3.5">
        {failureModeDistribution.map((item) => {
          const width = (item.count / highest) * 100;
          const color = MODE_COLORS[item.mode] ?? "var(--color-text-muted)";

          return (
            <div key={item.mode}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-secondary">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {item.mode}
                  <span className="text-xs text-text-muted">{item.label}</span>
                </span>
                <span className="text-xs text-text-muted">
                  {item.count}
                  <span className="ml-1.5 text-text-secondary">
                    {item.percentOfFailures}%
                  </span>
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-bg-card-elevated">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default FailureModeDistribution;
