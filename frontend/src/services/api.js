// The Express backend URL comes from Vite's environment variables.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

// Express sends validation details either as strings or as FastAPI-style
// objects, so turn both shapes into one readable message.
function formatDetails(details) {
  if (Array.isArray(details)) {
    return details
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item.msg === "string") {
          const field = Array.isArray(item.loc)
            ? item.loc[item.loc.length - 1]
            : null;
          return field ? `${field}: ${item.msg}` : item.msg;
        }
        return null;
      })
      .filter(Boolean)
      .join("; ");
  }

  return typeof details === "string" ? details : "";
}

function userMessageForStatus(status) {
  if (status === 400 || status === 422) {
    return "Some information is invalid. Check the values and try again.";
  }

  if (status === 404) {
    return "We couldn't find what you were looking for.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status === 503 || status === 504) {
    return "The service is temporarily unavailable. Please try again in a moment.";
  }

  if (status >= 500) {
    return "The service is having trouble right now. Please try again in a moment.";
  }

  return "Something went wrong. Please try again.";
}

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    // Let callers distinguish an intentional abort from a real network error.
    if (error?.name === "AbortError") throw error;

    if (import.meta.env.DEV) {
      console.error("Network request failed:", error);
    }

    const networkError = new Error(
      "We couldn't connect to the service. Check your connection and try again.",
      { cause: error },
    );
    networkError.code = "NETWORK";
    throw networkError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const technicalMessage =
      data?.error || `Request failed with status ${response.status}`;
    const details = formatDetails(data?.details);
    const error = new Error(userMessageForStatus(response.status));

    error.status = response.status;
    error.technicalMessage = details
      ? `${technicalMessage}: ${details}`
      : technicalMessage;

    if (import.meta.env.DEV) {
      console.error("API request failed:", error.technicalMessage);
    }

    throw error;
  }

  return data;
}

// GET /api/health
export async function getHealth(signal) {
  const response = await fetch(`${API_BASE_URL}/api/health`, { signal });
  const data = await response.json().catch(() => null);

  // A 503 response still contains useful ML status details, so any valid JSON
  // body is returned. Malformed/non-JSON responses are handled as backend errors.
  return data;
}

// POST /api/predict
export function predictMachine(sensorReading) {
  return request("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sensorReading),
  });
}

// GET /api/dashboard
export function getDashboard(signal) {
  return request("/api/dashboard", { signal });
}

// GET /api/machines
export function getMachines(params = {}, signal) {
  const { page = 1, limit = 50, search, type, risk, sort = "desc" } = params;
  const query = new URLSearchParams();

  query.set("page", String(page));
  query.set("limit", String(limit));
  query.set("sort", sort);

  if (search) query.set("search", search);
  if (type && type !== "All") query.set("type", type);
  if (risk && risk !== "All") query.set("risk", risk);

  return request(`/api/machines?${query.toString()}`, { signal });
}

// GET /api/machines/:udi
export function getMachine(udi, signal) {
  return request(`/api/machines/${encodeURIComponent(udi)}`, { signal });
}
