import Card from "../dashboard/Card.jsx";
import {
  FiActivity,
  FiClock,
  FiRotateCw,
  FiSettings,
  FiThermometer,
} from "react-icons/fi";

const SENSORS = [
  {
    key: "airTemp",
    label: "Air Temperature",
    unit: "K",
    decimals: 1,
    icon: FiThermometer,
  },
  {
    key: "processTemp",
    label: "Process Temperature",
    unit: "K",
    decimals: 1,
    icon: FiThermometer,
  },
  {
    key: "rpm",
    label: "Rotational Speed",
    unit: "RPM",
    decimals: 0,
    icon: FiRotateCw,
  },
  {
    key: "torque",
    label: "Torque",
    unit: "Nm",
    decimals: 1,
    icon: FiSettings,
  },
  {
    key: "toolWear",
    label: "Tool Wear",
    unit: "min",
    decimals: 0,
    icon: FiClock,
  },
  {
    key: "temperatureDifference",
    label: "Temperature Difference",
    unit: "K",
    decimals: 1,
    icon: FiActivity,
  },
];

function SensorReadings({ machine }) {
  return (
    <Card title="Sensor Readings">
      <p className="mb-4 text-sm text-text-muted">
        Recorded sensor values for this machine record.
      </p>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3">
        {SENSORS.map(({ key, label, unit, decimals, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col justify-between gap-3 bg-bg-card p-4"
          >
            <span className="flex items-center gap-2 text-sm text-text-secondary">
              <Icon className="shrink-0 text-base text-primary" />
              {label}
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-text-main">
                {machine.sensors[key].toFixed(decimals)}
              </span>
              <span className="text-xs text-text-muted">{unit}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default SensorReadings;