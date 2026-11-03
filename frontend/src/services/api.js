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

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(
      `Cannot reach the backend at ${API_BASE_URL}. Make sure the Express server is running.`,
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || `Request failed with status ${response.status}`;
    const details = formatDetails(data?.details);
    throw new Error(details ? `${message}: ${details}` : message);
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
