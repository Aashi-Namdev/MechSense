import { useEffect, useState } from "react";
import { getHealth } from "../services/api.js";

const HEALTH_TIMEOUT_MS = 12000;

const CHECKING = {
  tone: "text-text-muted",
  dot: "bg-text-muted",
  label: "Checking status",
  detail: "Connecting…",
};

const TIMEOUT = {
  tone: "text-status-danger",
  dot: "bg-status-danger",
  label: "Status check timed out",
  detail: "The service took too long to respond.",
};

function statusFromHealth(health) {
  if (!health || typeof health !== "object" || health.backend !== "ok") {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "Service unavailable",
      detail: "We couldn't get the current system status.",
    };
  }

  const ml = health.mlService;

  if (!ml || typeof ml !== "object" || Array.isArray(ml)) {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "Prediction status unavailable",
      detail: "The prediction service status couldn't be checked.",
    };
  }

  if (typeof ml.status !== "string") {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "Prediction status unavailable",
      detail: "The prediction service status couldn't be checked.",
    };
  }

  if (ml.status !== "ok") {
    return {
      tone: "text-status-warning",
      dot: "bg-status-warning",
      label: "Prediction service offline",
      detail: "Predictions are temporarily unavailable.",
    };
  }

  if (typeof ml.models_loaded !== "boolean") {
    return {
      tone: "text-status-danger",
      dot: "bg-status-danger",
      label: "Prediction status unavailable",
      detail: "The prediction service status couldn't be checked.",
    };
  }

  if (ml.models_loaded !== true) {
    return {
      tone: "text-status-warning",
      dot: "bg-status-warning",
      label: "Prediction service offline",
      detail: "Predictions are temporarily unavailable.",
    };
  }

  return {
    tone: "text-status-success",
    dot: "bg-status-success",
    label: "System online",
    detail: "All services are ready.",
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
            label: "Service offline",
            detail: "We can't reach the service right now.",
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
