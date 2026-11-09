const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 10000;

// Small wrapper around fetch so both routes handle network failures the same way.
async function requestMlService(path, options = {}) {
  let response;

  try {
    response = await fetch(`${ML_SERVICE_URL}${path}`, {
      ...options,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut =
      error?.name === "TimeoutError" || error?.name === "AbortError";
    const mlError = new Error(
      timedOut
        ? "ML service request timed out."
        : "ML service is unavailable. Make sure the Python service is running."
    );
    mlError.code = timedOut ? "ML_TIMEOUT" : "ML_UNAVAILABLE";
    throw mlError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mlError = new Error("ML service returned an error.");
    mlError.code = "ML_ERROR";
    mlError.status = response.status;
    mlError.details = data && data.detail ? data.detail : data;
    throw mlError;
  }

  return data;
}

// Build a query string while dropping empty filter values.
function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getMlHealth() {
  return requestMlService("/health");
}

function predictWithMl(sensorReading) {
  return requestMlService("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sensorReading),
  });
}

function getDashboard() {
  return requestMlService("/dashboard");
}

function getMachines(params = {}) {
  return requestMlService(`/machines${buildQueryString(params)}`);
}

function getMachineByUdi(udi) {
  return requestMlService(`/machines/${encodeURIComponent(udi)}`);
}

module.exports = {
  getDashboard,
  getMachineByUdi,
  getMachines,
  getMlHealth,
  predictWithMl,
};
