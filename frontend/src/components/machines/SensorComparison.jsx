import { useEffect, useState } from "react";
import Card from "../dashboard/Card.jsx";
import { getDashboard } from "../../services/api.js";

const SENSORS = [
  { key: "airTemp", label: "Air Temperature", unit: "K", decimals: 1 },
  { key: "processTemp", label: "Process Temperature", unit: "K", decimals: 1 },
  { key: "rpm", label: "Rotational Speed", unit: "RPM", decimals: 0 },
  { key: "torque", label: "Torque", unit: "Nm", decimals: 1 },
  { key: "toolWear", label: "Tool Wear", unit: "min", decimals: 0 },
  {
    key: "temperatureDifference",
    label: "Temperature Difference",
    unit: "K",
    decimals: 1,
  },
];

function SensorComparison({ machine }) {
  const [averages, setAverages] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getDashboard(controller.signal)
      .then((response) => {
        if (active) {
          const responseAverages = response?.sensor_averages_by_outcome;
          const hasAverages =
            responseAverages?.normal && responseAverages?.failed;
          setAverages(
            hasAverages
              ? {
                  normal: {
                    airTemp: hasAverages.normal.air_temperature,
                    processTemp: hasAverages.normal.process_temperature,
                    rpm: hasAverages.normal.rotational_speed,
                    torque: hasAverages.normal.torque,
                    toolWear: hasAverages.normal.tool_wear,
                    temperatureDifference:
                      hasAverages.normal.temperature_difference,
                  },
                  failed: {
                    airTemp: hasAverages.failed.air_temperature,
                    processTemp: hasAverages.failed.process_temperature,
                    rpm: hasAverages.failed.rotational_speed,
                    torque: hasAverages.failed.torque,
                    toolWear: hasAverages.failed.tool_wear,
                    temperatureDifference:
                      hasAverages.failed.temperature_difference,
                  },
                }
              : null,
          );
          setUnavailable(!hasAverages);
        }
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          setAverages(null);
          setUnavailable(true);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const normal = averages?.normal;
  const failed = averages?.failed;

  return (
    <Card title="Sensor vs Historical Average">
      <p className="mb-4 text-sm text-text-muted">
        Compare this record with historical averages for normal and failed
        records.
      </p>
      {unavailable && (
        <p className="mb-4 rounded-lg bg-bg-card-elevated px-3.5 py-3 text-xs text-text-muted">
          Historical averages are temporarily unavailable.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 text-sm">
          <thead className="border-b border-border-subtle bg-bg-card-elevated/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Sensor
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                This Record
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                Normal Avg
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                Failed Avg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {SENSORS.map(({ key, label, unit, decimals }) => (
              <tr key={key}>
                <td className="px-4 py-3 font-medium text-text-main">
                  {label}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-text-main">
                  {machine.sensors[key].toFixed(decimals)}{" "}
                  <span className="text-xs font-normal text-text-muted">
                    {unit}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                  {typeof normal?.[key] === "number"
                    ? normal[key].toFixed(decimals)
                    : "—"}{" "}
                  <span className="text-xs text-text-muted">{unit}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                  {typeof failed?.[key] === "number"
                    ? failed[key].toFixed(decimals)
                    : "—"}{" "}
                  <span className="text-xs text-text-muted">{unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 rounded-lg bg-bg-card-elevated px-3.5 py-3 text-xs leading-relaxed text-text-muted">
        The comparison only shows how this record lines up with historical
        averages. It is an observed comparison, not evidence that a specific
        sensor caused the prediction.
      </p>
    </Card>
  );
}

export default SensorComparison;
