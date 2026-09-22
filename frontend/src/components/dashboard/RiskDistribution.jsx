import { motion } from "motion/react";
import { kpiCards, riskDistribution } from "../../data/dashboard.js";
import { BAND_COLORS } from "../machines/riskColors.js";
import Card from "./Card.jsx";

const BAND_LABELS = {
  Low: "< 30%",
  Medium: "30% – 60%",
  High: ">= 60%",
};

function RiskDistribution() {
  const { bands } = riskDistribution;
  const total = bands.reduce((sum, band) => sum + band.count, 0);
  const highest = Math.max(...bands.map((band) => band.count));

  return (
    <Card title="Prediction Risk Distribution">
      <div className="space-y-5">
        {bands.map((band) => {
          const width = (band.count / highest) * 100;
          const percent = ((band.count / total) * 100).toFixed(1);

          return (
            <div key={band.band}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-secondary">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: BAND_COLORS[band.band] }}
                  />
                  {band.band}
                  <span className="text-xs text-text-muted">
                    ({BAND_LABELS[band.band]})
                  </span>
                </span>
                <span className="text-xs text-text-muted">
                  {band.count.toLocaleString()}
                  <span className="ml-1.5 text-text-secondary">{percent}%</span>
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-bg-card-elevated">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: BAND_COLORS[band.band] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-lg bg-bg-card-elevated px-3.5 py-3 text-xs leading-relaxed text-text-muted">
        Band edges use predicted failure probability.{" "}
        <span className="text-text-secondary">
          {kpiCards.highRiskCount} High-Risk Predictions
        </span>{" "}
        sit at or above 60%.
      </p>
    </Card>
  );
}

export default RiskDistribution;
