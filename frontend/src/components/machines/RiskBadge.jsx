import { BAND_COLORS } from "./riskColors.js";

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

export default RiskBadge;