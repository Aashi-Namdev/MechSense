import { FiHelpCircle } from "react-icons/fi";
import Card from "../dashboard/Card.jsx";
import { FAILURE_MODES, primaryCause } from "../../data/constants.js";

function LikelyCauseCard({ machine }) {
  const likelyCauses = machine.likelyCauses ?? [];
  const primary = primaryCause(likelyCauses);
  const otherCauses = primary
    ? likelyCauses.filter((cause) => cause !== primary)
    : [];

  const meta = primary ? FAILURE_MODES[primary.mode] : null;

  return (
    <Card title="Likely Failure Cause" delay={0.12}>
      {primary ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {primary.mode}
            </span>
            <span className="text-xs text-text-muted">Highest probability</span>
          </div>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-main">
            {meta?.label ?? "Unclassified failure mode"}
          </p>

          <div className="mt-4 divide-y divide-border-subtle border-y border-border-subtle">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-text-muted">Probability</span>
              <span className="text-sm font-medium tabular-nums text-text-secondary">
                {(primary.probability * 100).toFixed(0)}%
              </span>
            </div>
            {meta?.part && (
              <div className="flex items-center justify-between gap-4 py-2.5">
                <span className="shrink-0 text-xs text-text-muted">Part</span>
                <span className="text-right text-sm font-medium text-text-secondary">
                  {meta.part}
                </span>
              </div>
            )}
          </div>

          {otherCauses.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-text-muted">Other possible causes</p>
              <ul className="mt-2 space-y-1.5">
                {otherCauses.map((cause) => (
                  <li
                    key={cause.mode}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-text-secondary">
                      {cause.mode} — {FAILURE_MODES[cause.mode]?.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-text-muted">
                      {(cause.probability * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            This is not confirmed, but likely based on the model&apos;s analysis
            of the input data.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2.5">
            <FiHelpCircle className="mt-0.5 shrink-0 text-base text-text-muted" />
            <p className="text-sm text-text-secondary">
              {machine.predictedFailure === 1
                ? "No specific failure mode identified"
                : "No failure mode flagged"}
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-text-muted">
            {machine.predictedFailure === 1
              ? "The probability is above the threshold, but no specific failure mode stood out, so the recommendation falls back to a general inspection."
              : "There is no failure predicted, so no failure mode is flagged."}
          </p>
        </>
      )}
    </Card>
  );
}

export default LikelyCauseCard;
