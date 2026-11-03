import { useEffect, useState } from "react";
import { getHealth } from "../services/api.js";

const HEALTH_TIMEOUT_MS = 12000;

const CHECKING = {
  tone: "text-text-muted",
  dot: "bg-text-muted",
  label: "Checking system",
  detail: "Connecting to backend...",
};

const TIMEOUT = {
  tone: "text-status-danger",
  dot: "bg-status-danger",
  label: "Backend timeout",
  detail: "Health check timed out after 12 seconds",
};

function statusFromHealth(health) {
  if (!health || typeof health !== "object" || health.backend !== "ok") {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "Backend error",
      detail:
        typeof health?.error === "string"
          ? health.error
          : "Express returned an unexpected health response",
    };
  }

  const ml = health.mlService;

  if (!ml || typeof ml !== "object" || Array.isArray(ml)) {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "ML status unavailable",
      detail: "Express did not return ML service health details",
    };
  }

  if (typeof ml.status !== "string" || typeof ml.models_loaded !== "boolean") {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "ML status unavailable",
      detail: "Express returned malformed ML service health details",
    };
  }

  if (ml.status !== "ok" || ml.models_loaded !== true) {
    return {
      tone: "text-status-warning",
      dot: "bg-status-warning",
      label: "ML service offline",
      detail: "Express is running, ML models unavailable",
    };
  }

  return {
    tone: "text-status-success",
    dot: "bg-status-success",
    label: "System online",
    detail: "Express online · ML models loaded",
  };
}

function SystemStatus() {
  const [status, setStatus] = useState(CHECKING);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      HEALTH_TIMEOUT_MS,
    );

    async function checkHealth() {
      try {
        const health = await getHealth(controller.signal);
        if (!ignore) setStatus(statusFromHealth(health));
      } catch (err) {
        if (ignore) return;

        if (err instanceof Error && err.name === "AbortError") {
          setStatus(TIMEOUT);
        } else {
          setStatus({
            tone: "text-status-danger",
            dot: "bg-status-danger",
            label: "Backend offline",
            detail: "Start Express on port 5000",
          });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    checkHealth();
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-md bg-bg-card px-3 py-2.5 lg:justify-start"
      title={status.detail}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
      <div className="hidden min-w-0 lg:block">
        <p className={`text-xs font-medium ${status.tone}`}>{status.label}</p>
        <p className="truncate text-[11px] text-text-muted">{status.detail}</p>
      </div>
    </div>
  );
}

export default SystemStatus;
