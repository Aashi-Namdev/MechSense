import { FiAlertTriangle, FiClipboard } from "react-icons/fi";
import Card from "../dashboard/Card.jsx";
import {
  primaryCause,
  recommendationFor,
} from "../../data/constants.js";
import { maintenanceRecommendationFor } from "../../data/maintenanceRules.js";

function ReadingRow({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-text-muted">{label}</span>
      <span
        className={`text-right text-xs font-medium tabular-nums ${
          tone === "target" ? "text-primary" : "text-text-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OptionBlock({ option }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
        {option.label}
      </p>
      <p className="mt-0.5 text-xs font-medium text-text-main">{option.title}</p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-text-muted">Current</span>
          <span className="tabular-nums text-text-secondary">
            {option.current}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-text-muted">Target</span>
          <span className="tabular-nums text-primary">{option.target}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-text-muted">Change</span>
          <span className="tabular-nums text-text-secondary">
            {option.change}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecommendedActionCard({ machine, delay = 0.19 }) {
  const primary = primaryCause(machine.likelyCauses);
  const recommendation = primary
    ? maintenanceRecommendationFor(primary.mode, machine)
    : null;
  const compact = recommendation?.compact;
  const action =
    compact?.title ?? recommendationFor(machine.riskBand, machine.likelyCauses);

  return (
    <Card title="Recommended Action" delay={delay}>
      <div className="flex items-start gap-2.5">
        <FiClipboard className="mt-0.5 shrink-0 text-base text-primary" />
        <p className="text-base font-semibold leading-snug text-text-main">
          {action}
        </p>
      </div>

      {compact?.readings?.length > 0 && (
        <div className="mt-3.5 space-y-1.5">
          {compact.readings.map((item) => (
            <ReadingRow
              key={item.label}
              label={item.label}
              value={item.value}
              tone={item.tone}
            />
          ))}
        </div>
      )}

      {compact?.change && (
        <p className="mt-2 text-xs text-text-secondary">{compact.change}</p>
      )}

      {compact?.alternative && (
        <div className="mt-3 rounded-md bg-bg-card-elevated px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Alternative
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {compact.alternative}
          </p>
        </div>
      )}

      {compact?.options?.length > 0 && (
        <div className="mt-3 rounded-md bg-bg-card-elevated px-3 py-2.5">
          <div className="space-y-3">
            {compact.options.map((option) => (
              <OptionBlock key={option.label} option={option} />
            ))}
          </div>
          {compact.optionsNote && (
            <p className="mt-2.5 text-[11px] leading-relaxed text-text-muted">
              {compact.optionsNote}
            </p>
          )}
        </div>
      )}

      {compact?.why && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Why this action?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            {compact.why}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-md border border-status-warning/25 bg-status-warning/10 px-3 py-2.5">
        <FiAlertTriangle className="mt-0.5 shrink-0 text-xs text-status-warning" />
        <p className="text-[11px] leading-relaxed text-status-warning">
          <span className="font-medium">Simulation only:</span> Any numerical
          target comes from the dataset&apos;s simulated rule and must be
          checked against real machine operating limits before implementation.
        </p>
      </div>
    </Card>
  );
}

export default RecommendedActionCard;
