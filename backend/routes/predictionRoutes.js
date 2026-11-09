const express = require("express");
const {
  getDashboard,
  getMachineByUdi,
  getMachines,
  getMlHealth,
  predictWithMl,
} = require("../services/mlService");

const router = express.Router();

const MACHINE_TYPES = ["L", "M", "H"];
const RISK_BANDS = ["Low", "Medium", "High"];
const SORT_DIRECTIONS = ["asc", "desc"];
const MAX_PAGE_SIZE = 100;
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

function parsePositiveInteger(value, field, errors, { min = 1, max } = {}) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    errors.push(`${field} must be a single value`);
    return undefined;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    errors.push(`${field} must be a number`);
    return undefined;
  }

  const number = Number(value);

  if (!Number.isInteger(number)) {
    errors.push(`${field} must be an integer`);
    return undefined;
  }

  if (number < min) {
    errors.push(`${field} must be at least ${min}`);
    return undefined;
  }

  if (max !== undefined && number > max) {
    errors.push(`${field} must be less than or equal to ${max}`);
    return undefined;
  }

  return number;
}

// Mirrors the query rules in the FastAPI /machines endpoint.
function validateMachinesQuery(query = {}) {
  const errors = [];

  const page = parsePositiveInteger(query.page, "page", errors, { min: 1 });
  const limit = parsePositiveInteger(query.limit, "limit", errors, {
    min: 1,
    max: MAX_PAGE_SIZE,
  });

  let machineType;
  if (query.type !== undefined) {
    if (typeof query.type !== "string") {
      errors.push("type must be a string");
    } else {
      const normalised = query.type.trim().toUpperCase();
      if (!MACHINE_TYPES.includes(normalised)) {
        errors.push("type must be one of L, M or H");
      } else {
        machineType = normalised;
      }
    }
  }

  let risk;
  if (query.risk !== undefined) {
    if (typeof query.risk !== "string") {
      errors.push("risk must be a string");
    } else {
      const normalised = query.risk.trim().toLowerCase();
      const match = RISK_BANDS.find(
        (band) => band.toLowerCase() === normalised
      );
      if (!match) {
        errors.push("risk must be one of Low, Medium or High");
      } else {
        risk = match;
      }
    }
  }

  let sort;
  if (query.sort !== undefined) {
    if (typeof query.sort !== "string") {
      errors.push("sort must be a string");
    } else {
      const normalised = query.sort.trim().toLowerCase();
      if (!SORT_DIRECTIONS.includes(normalised)) {
        errors.push("sort must be asc or desc");
      } else {
        sort = normalised;
      }
    }
  }

  let search;
  if (query.search !== undefined) {
    if (typeof query.search !== "string") {
      errors.push("search must be a string");
    } else {
      const trimmed = query.search.trim();
      if (trimmed.length > 100) {
        errors.push("search must be 100 characters or fewer");
      } else if (trimmed.length > 0) {
        search = trimmed;
      }
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    params: {
      page: page ?? 1,
      limit: limit ?? 50,
      search,
      type: machineType,
      risk,
      sort: sort ?? "desc",
    },
  };
}

function handleMachineMlError(error, res, next) {
  if (error.code === "ML_UNAVAILABLE") {
    return res.status(503).json({ error: error.message });
  }

  if (error.code === "ML_TIMEOUT") {
    return res.status(504).json({ error: error.message });
  }

  if (error.code === "ML_ERROR") {
    if (error.status === 422) {
      return res.status(422).json({
        error: "ML service rejected the machine query",
        details: error.details,
      });
    }

    if (error.status === 404) {
      return res.status(404).json({
        error:
          typeof error.details === "string"
            ? error.details
            : "Machine record not found.",
      });
    }

    console.error("ML service error:", error.status, error.details);

    if (error.status === 503) {
      return res
        .status(503)
        .json({ error: "ML service is not ready to serve machine records." });
    }

    return res
      .status(502)
      .json({ error: "ML service could not process the machine query." });
  }

  return next(error);
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

router.get("/dashboard", async (req, res, next) => {
  try {
    const dashboard = await getDashboard();
    res.json(dashboard);
  } catch (error) {
    if (error.code === "ML_UNAVAILABLE") {
      return res.status(503).json({ error: error.message });
    }

    if (error.code === "ML_TIMEOUT") {
      return res.status(504).json({ error: error.message });
    }

    if (error.code === "ML_ERROR") {
      console.error("ML service error:", error.status, error.details);

      if (error.status === 503) {
        return res.status(503).json({
          error: "ML service is not ready to serve dashboard data.",
        });
      }

      return res.status(502).json({
        error: "ML service could not provide dashboard data.",
      });
    }

    next(error);
  }
});

router.get("/machines", async (req, res, next) => {
  const { params, errors } = validateMachinesQuery(req.query);

  if (errors) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: errors,
    });
  }

  try {
    const machines = await getMachines(params);
    res.json(machines);
  } catch (error) {
    return handleMachineMlError(error, res, next);
  }
});

router.get("/machines/:udi", async (req, res, next) => {
  const errors = [];
  const udi = parsePositiveInteger(req.params.udi, "udi", errors, { min: 1 });

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Invalid machine identifier",
      details: errors,
    });
  }

  try {
    const machine = await getMachineByUdi(udi);
    res.json(machine);
  } catch (error) {
    return handleMachineMlError(error, res, next);
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

    if (error.code === "ML_TIMEOUT") {
      return res.status(504).json({ error: error.message });
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
