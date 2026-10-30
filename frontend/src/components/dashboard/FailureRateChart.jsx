import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "./Card.jsx";

function FailureRateChart({
  title,
  data,
  dataKey = "range",
  color = "var(--color-primary)",
  height = 220,
}) {
  return (
    <Card title={title}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey={dataKey}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              cursor={{ fill: "var(--color-chart-cursor)" }}
              contentStyle={{
                background: "var(--color-bg-card-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
              labelStyle={{
                color: "var(--color-text-main)",
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 4,
              }}
              itemStyle={{
                color: "var(--color-text-secondary)",
                fontSize: 12,
                padding: 0,
              }}
              formatter={(value) => [`${value}%`, "Failure Rate"]}
            />
            <Bar
              dataKey="failureRatePct"
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default FailureRateChart;
