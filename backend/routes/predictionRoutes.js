const express = require("express");
const { getMlHealth, predictWithMl } = require("../services/mlService");

const router = express.Router();

const MACHINE_TYPES = ["L", "M", "H"];
const ALLOWED_FIELDS = [
  "type",
  "airTemp",
  "processTemp",
  "rpm",
  "torque",
  "toolWear",
];

function parseNumber(value, field, errors, min, max, options = {}) {
  const { exclusiveMin = false } = options;

  if (value === undefined || value === null || value === "") {
    errors.push(`${field} is required`);
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    errors.push(`${field} must be a number`);
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    errors.push(`${field} must be a valid number`);
    return null;
  }

  if (exclusiveMin ? number <= min : number < min) {
    const comparison = exclusiveMin ? "greater than" : "at least";
    errors.push(`${field} must be ${comparison} ${min}`);
    return null;
  }

  if (number > max) {
    errors.push(`${field} must be less than or equal to ${max}`);
    return null;
  }

  return number;
}

// Mirrors the rules in the FastAPI SensorReading schema.
function validateSensorReading(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: ["Request body must be a JSON object."] };
  }

  const unknownFields = Object.keys(body).filter(
    (field) => !ALLOWED_FIELDS.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push(`Unknown field(s): ${unknownFields.join(", ")}`);
  }

  const machineType =
    typeof body.type === "string" ? body.type.trim().toUpperCase() : body.type;

  if (!MACHINE_TYPES.includes(machineType)) {
    errors.push("type must be one of L, M or H");
  }

  const airTemp = parseNumber(body.airTemp, "airTemp", errors, 250, 350);
  const processTemp = parseNumber(
    body.processTemp,
    "processTemp",
    errors,
    250,
    400
  );
  const rpm = parseNumber(body.rpm, "rpm", errors, 0, 10000, {
    exclusiveMin: true,
  });
  const torque = parseNumber(body.torque, "torque", errors, 0, 1000);
  const toolWear = parseNumber(body.toolWear, "toolWear", errors, 0, 2000);

  if (
    airTemp !== null &&
    processTemp !== null &&
    processTemp < airTemp
  ) {
    errors.push("processTemp must be greater than or equal to airTemp");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    reading: {
      type: machineType,
      airTemp,
      processTemp,
      rpm,
      torque,
      toolWear,
    },
  };
}

router.get("/health", async (req, res) => {
  try {
    const mlHealth = await getMlHealth();
    const mlIsHealthy = mlHealth.status === "ok" && mlHealth.models_loaded;

    res.status(mlIsHealthy ? 200 : 503).json({
      backend: "ok",
      mlService: mlHealth,
    });
  } catch (error) {
    res.status(503).json({
      backend: "ok",
      mlService: {
        status: "unavailable",
        error: "ML service is not reachable.",
      },
    });
  }
});

router.post("/predict", async (req, res, next) => {
  const { reading, errors } = validateSensorReading(req.body);

  if (errors) {
    return res.status(400).json({
      error: "Invalid sensor readings",
      details: errors,
    });
  }

  try {
    const prediction = await predictWithMl(reading);
    res.json(prediction);
  } catch (error) {
    if (error.code === "ML_UNAVAILABLE") {
      return res.status(503).json({ error: error.message });
    }

    if (error.code === "ML_ERROR") {
      // Keep FastAPI's validation details so the client can fix the input.
      if (error.status === 422) {
        return res.status(422).json({
          error: "ML service rejected the sensor readings",
          details: error.details,
        });
      }

      console.error("ML service error:", error.status, error.details);

      if (error.status === 503) {
        return res
          .status(503)
          .json({ error: "ML service is not ready to make predictions." });
      }

      return res
        .status(502)
        .json({ error: "ML service could not process the prediction." });
    }

    next(error);
  }
});

module.exports = router;
