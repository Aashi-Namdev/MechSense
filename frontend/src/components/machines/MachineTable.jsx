import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
} from "react-icons/fi";

const BAND_COLORS = {
  Low: "var(--color-status-success)",
  Medium: "var(--color-status-warning)",
  High: "var(--color-status-danger)",
};

function RiskBadge({ band }) {
  const color = BAND_COLORS[band] ?? "var(--color-text-muted)";

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {band}
    </span>
  );
}

function ProbabilityCell({ machine }) {
  const percent = (machine.probability * 100).toFixed(2);

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-bg-card-elevated sm:w-24">
        <div
          className="h-full rounded-full"
          style={{
            width: `${machine.probability * 100}%`,
            backgroundColor: BAND_COLORS[machine.riskBand],
          }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-text-secondary">
        {percent}%
      </span>
    </div>
  );
}

function MachineTable({ machines, sortDir, onToggleSort }) {
  const navigate = useNavigate();

  function handleRowClick(machine) {
    navigate(`/machines/${machine.id}`);
  }

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
        <FiSearch className="text-2xl text-text-muted" />
        <p className="text-sm font-medium text-text-secondary">
          No machines found
        </p>
        <p className="text-xs text-text-muted">
          Try changing the filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border-subtle bg-bg-card-elevated/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
              Product ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
              Type
            </th>
            <th className="px-4 py-3 text-left">
              <button
                type="button"
                onClick={onToggleSort}
                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary transition-colors hover:text-text-main cursor-pointer"
              >
                Failure Probability
                {sortDir === "desc" ? <FiChevronDown /> : <FiChevronUp />}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Risk
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Prediction
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Actual
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {machines.map((machine) => (
            <tr
              key={machine.id}
              onClick={() => handleRowClick(machine)}
              className="cursor-pointer transition-colors hover:bg-bg-card-elevated"
            >
              <td className="px-4 py-3 font-medium tabular-nums text-text-main">
                {machine.productId}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-md bg-bg-card-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {machine.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <ProbabilityCell machine={machine} />
              </td>
              <td className="px-4 py-3">
                <RiskBadge band={machine.riskBand} />
              </td>
              <td className="px-4 py-3">
                {machine.predictedFailure === 1 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                    <FiAlertTriangle className="shrink-0 text-status-warning" />
                    Failure predicted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                    <FiCheckCircle className="shrink-0" />
                    No failure predicted
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {machine.actualFailure === 1 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-danger">
                    <span className="h-2 w-2 rounded-full bg-status-danger" />
                    Failure
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-success">
                    <span className="h-2 w-2 rounded-full bg-status-success" />
                    Normal
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MachineTable;
