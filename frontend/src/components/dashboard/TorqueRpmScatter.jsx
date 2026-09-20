import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { torqueVsRpmScatter } from "../../data/dashboard.js";
import Card from "./Card.jsx";

function TorqueRpmScatter() {
  return (
    <Card title="Torque vs Rotational Speed">
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 14, right: 10, bottom: 18, left: 14 }}>
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              dataKey="torque"
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
              label={{
                value: "Torque (Nm)",
                position: "insideBottom",
                offset: -18,
                fill: "var(--color-text-muted)",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="rpm"
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={70}
              label={{
                value: "Rotational Speed (rpm)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "var(--color-text-muted)",
                  fontSize: 11,
                },
              }}
            />
            <ZAxis type="number" range={[90, 90]} />
            <Tooltip
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
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Legend
              verticalAlign="top"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: 8,
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}
            />
            <Scatter
              name="Normal"
              data={torqueVsRpmScatter.normal}
              fill="var(--color-secondary)"
            />
            <Scatter
              name="Failed"
              data={torqueVsRpmScatter.failed}
              fill="var(--color-status-danger)"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default TorqueRpmScatter;
