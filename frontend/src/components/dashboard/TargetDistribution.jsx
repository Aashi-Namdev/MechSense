import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { targetDistribution } from "../../data/dashboard.js";
import Card from "./Card.jsx";

const COLORS = {
  Normal: "var(--color-status-success)",
  Failure: "var(--color-status-danger)",
};

const tooltipStyle = {
  backgroundColor: "var(--color-bg-card-elevated)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: 8,
  color: "var(--color-text-main)",
  fontSize: 12,
};

function TargetDistribution() {
  const total = targetDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="Historical Failure Distribution">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        {/* Donut chart */}
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={targetDistribution}
                dataKey="value"
                nameKey="label"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                stroke="none"
              >
                {targetDistribution.map((item) => (
                  <Cell key={item.label} fill={COLORS[item.label]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-text-main">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-text-muted">
              Records
            </p>
          </div>
        </div>

        {/* Side stats */}
        <div className="w-full space-y-3">
          {targetDistribution.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-bg-card-elevated px-3.5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[item.label] }}
                />
                <div>
                  <p className="text-sm text-text-secondary">{item.label}</p>
                  <p className="text-xs text-text-muted">
                    {item.value.toLocaleString()} records
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-text-main">
                {item.percent}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default TargetDistribution;
