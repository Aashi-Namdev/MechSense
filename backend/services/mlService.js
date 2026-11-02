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
    const mlError = new Error(
      "ML service is unavailable. Make sure the Python service is running."
    );
    mlError.code = "ML_UNAVAILABLE";
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

module.exports = { getMlHealth, predictWithMl };
