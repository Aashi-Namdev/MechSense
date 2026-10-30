import { FAILURE_MODES, OVERSTRAIN_LIMIT } from "./constants.js";

// Simulated rules used by the project dataset.
const POWER_MIN = 3500;
const POWER_MAX = 9000;
const HDF_TEMP_DIFF_MIN = 8.6;
const HDF_RPM_MIN = 1380;
const TWF_REFERENCE_WEAR = 200;

const SIMULATION_CAVEAT =
  "Calculated from the project's simulated dataset rules. These are not universal industrial safety limits and need real-machine validation before practical use.";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundTo(value, places) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function roundUp(value, places) {
  const factor = 10 ** places;
  return Math.ceil(value * factor) / factor;
}

function roundDown(value, places) {
  const factor = 10 ** places;
  return Math.floor(value * factor) / factor;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function row(label, value) {
  return { label, value };
}

// Power in watts from torque and rotational speed.
export function calculatePower(torque, rpm) {
  return (torque * rpm * 2 * Math.PI) / 60;
}

// Machine Detail uses sensors.*, while the Predict result uses input.*.
export function getSensorReadings(record = {}) {
  const source = record?.input ?? record?.sensors ?? record ?? {};

  return {
    type: source.type ?? record?.type ?? null,
    airTemp: toNumber(source.airTemp),
    processTemp: toNumber(source.processTemp),
    rpm: toNumber(source.rpm),
    torque: toNumber(source.torque),
    toolWear: toNumber(source.toolWear),
  };
}

function fallbackRecommendation(mode, explanation) {
  const meta = FAILURE_MODES[mode];

  return {
    mode,
    title: meta?.action ?? "General inspection",
    currentValues: [],
    targetValues: [],
    requiredChange: [],
    explanation,
    caveat: SIMULATION_CAVEAT,
    checklist: [],
  };
}

function osfRecommendation(readings) {
  const { type, torque, toolWear } = readings;

  if (torque === null || toolWear === null) {
    return fallbackRecommendation(
      "OSF",
      "Torque or tool wear is missing or invalid, so the overstrain calculation could not be run.",
    );
  }

  const hasKnownType = Object.prototype.hasOwnProperty.call(
    OVERSTRAIN_LIMIT,
    type,
  );
  const limit = hasKnownType ? OVERSTRAIN_LIMIT[type] : OVERSTRAIN_LIMIT.L;
  const limitSource = hasKnownType ? `Type ${type}` : "default Type L";
  const wearTorque = toolWear * torque;

  const currentValues = [
    row("Current torque", `${formatNumber(torque, 1)} Nm`),
    row("Current tool wear", `${formatNumber(toolWear, 0)} min`),
    row("Current wear × torque", formatNumber(wearTorque, 1)),
    row("Overstrain limit", `${formatNumber(limit, 0)} (${limitSource})`),
  ];

  // Avoid dividing by zero when the tool is new.
  if (toolWear <= 0) {
    return {
      mode: "OSF",
      title: "No torque reduction required under the simulated OSF rule",
      currentValues,
      targetValues: [],
      requiredChange: [],
      explanation:
        "Tool wear is zero, so a maximum torque cannot be calculated and the simulated OSF rule is not triggered by these values.",
      caveat: SIMULATION_CAVEAT,
      checklist: [],
    };
  }

  const maximumTorque = limit / toolWear;

  if (wearTorque <= limit) {
    return {
      mode: "OSF",
      title: "No torque reduction required under the simulated OSF rule",
      currentValues: [
        ...currentValues,
        row("Calculated maximum torque", `${formatNumber(maximumTorque, 2)} Nm`),
      ],
      targetValues: [],
      requiredChange: [],
      explanation: `The simulated OSF condition is not currently triggered: wear × torque is ${formatNumber(wearTorque, 1)}, which is not greater than the ${formatNumber(limit, 0)} limit.`,
      caveat: SIMULATION_CAVEAT,
      checklist: [],
    };
  }

  // Round down to one decimal, then verify the strict rule still holds.
  let targetTorque = roundDown(maximumTorque, 1);
  if (targetTorque * toolWear >= limit) {
    targetTorque = roundDown(targetTorque - 0.1, 1);
  }

  if (targetTorque <= 0) {
    return {
      mode: "OSF",
      title: "Inspect tool wear before continuing",
      currentValues: [
        ...currentValues,
        row("Calculated maximum torque", `${formatNumber(maximumTorque, 2)} Nm`),
      ],
      targetValues: [],
      requiredChange: [],
      explanation:
        "At this tool wear, no positive torque keeps wear × torque below the simulated limit. Tool inspection or replacement should take priority.",
      caveat: SIMULATION_CAVEAT,
      checklist: [],
    };
  }

  const targetWearTorque = targetTorque * toolWear;

  return {
    mode: "OSF",
    title: `Reduce torque to ${formatNumber(targetTorque, 1)} Nm`,
    currentValues,
    targetValues: [
      row("Calculated maximum torque", `${formatNumber(maximumTorque, 2)} Nm`),
      row("Recommended torque", `${formatNumber(targetTorque, 1)} Nm`),
      row(
        "Wear × torque at target",
        `${formatNumber(targetWearTorque, 1)} (< ${formatNumber(limit, 0)})`,
      ),
    ],
    requiredChange: [
      row("Torque reduction", `${formatNumber(torque - targetTorque, 1)} Nm`),
    ],
    explanation: `At ${formatNumber(toolWear, 0)} min tool wear, the ${limitSource} overstrain rule allows at most ${formatNumber(maximumTorque, 2)} Nm. The recommended target is rounded down and verified: ${formatNumber(toolWear, 0)} × ${formatNumber(targetTorque, 1)} = ${formatNumber(targetWearTorque, 1)}, which is below ${formatNumber(limit, 0)}.`,
    caveat: SIMULATION_CAVEAT,
    checklist: [],
  };
}

function torqueTargetForPower(powerTarget, rpm, increasePower) {
  const exactTorque = (powerTarget * 60) / (rpm * 2 * Math.PI);
  let target = increasePower
    ? roundUp(exactTorque, 1)
    : roundDown(exactTorque, 1);
  let actualPower = calculatePower(target, rpm);
  let attempts = 0;

  // Adjust for floating-point rounding so the target is inside the valid range.
  while (
    (increasePower ? actualPower < powerTarget : actualPower > powerTarget) &&
    attempts < 100
  ) {
    target = roundTo(target + (increasePower ? 0.1 : -0.1), 1);
    actualPower = calculatePower(target, rpm);
    attempts += 1;
  }

  return { target, actualPower };
}

function rpmTargetForPower(powerTarget, torque, increasePower) {
  const exactRpm = (powerTarget * 60) / (torque * 2 * Math.PI);
  let target = increasePower ? Math.ceil(exactRpm) : Math.floor(exactRpm);
  let actualPower = calculatePower(torque, target);
  let attempts = 0;

  while (
    (increasePower ? actualPower < powerTarget : actualPower > powerTarget) &&
    attempts < 100
  ) {
    target += increasePower ? 1 : -1;
    actualPower = calculatePower(torque, target);
    attempts += 1;
  }

  return { target, actualPower };
}

function pwfRecommendation(readings) {
  const { torque, rpm } = readings;

  if (torque === null || rpm === null || torque < 0 || rpm <= 0) {
    return fallbackRecommendation(
      "PWF",
      "Power needs a valid torque and a positive RPM, so a power target could not be calculated from these readings.",
    );
  }

  const power = calculatePower(torque, rpm);
  const isBelow = power < POWER_MIN;
  const isAbove = power > POWER_MAX;

  const currentValues = [
    row("Current power", `${formatNumber(power, 1)} W`),
    row("Current torque", `${formatNumber(torque, 1)} Nm`),
    row("Current rotational speed", `${formatNumber(rpm, 0)} rpm`),
    row("Valid simulated power range", "3,500–9,000 W"),
  ];

  if (!isBelow && !isAbove) {
    return {
      mode: "PWF",
      title: FAILURE_MODES.PWF.action,
      currentValues,
      targetValues: [],
      requiredChange: [],
      explanation:
        "The simulated PWF condition is not currently triggered because the calculated power is already inside the 3,500–9,000 W range.",
      caveat: SIMULATION_CAVEAT,
      checklist: [],
    };
  }

  const powerTarget = isBelow ? POWER_MIN : POWER_MAX;
  const torqueTarget = torqueTargetForPower(powerTarget, rpm, isBelow);
  const rpmTarget =
    torque > 0 ? rpmTargetForPower(powerTarget, torque, isBelow) : null;

  const targetValues = [
    row(
      `Torque target at ${formatNumber(rpm, 0)} rpm`,
      `${isBelow ? "at least" : "at most"} ${formatNumber(torqueTarget.target, 1)} Nm`,
    ),
    row("Power at torque target", `${formatNumber(torqueTarget.actualPower, 1)} W`),
  ];

  const requiredChange = [
    row(
      `Torque ${isBelow ? "increase" : "decrease"}`,
      `${formatNumber(Math.abs(torqueTarget.target - torque), 1)} Nm`,
    ),
  ];

  if (rpmTarget) {
    targetValues.push(
      row(
        `Alternative RPM target at ${formatNumber(torque, 1)} Nm`,
        `${isBelow ? "at least" : "at most"} ${formatNumber(rpmTarget.target, 0)} rpm`,
      ),
      row("Power at RPM target", `${formatNumber(rpmTarget.actualPower, 1)} W`),
    );
    requiredChange.push(
      row(
        `RPM ${isBelow ? "increase" : "decrease"}`,
        `${formatNumber(Math.abs(rpmTarget.target - rpm), 0)} rpm`,
      ),
    );
  }

  return {
    mode: "PWF",
    title: `Bring power into the 3,500–9,000 W range`,
    currentValues,
    targetValues,
    requiredChange,
    explanation: `Current power is ${formatNumber(power, 1)} W, which is ${isBelow ? "below" : "above"} the simulated PWF range of 3,500–9,000 W. The torque and RPM targets are separate alternatives, and changing torque and changing speed are not equivalent operational actions.`,
    caveat:
      "These are calculated targets under the simulation rule, not instructions to change a real machine without engineering approval.",
    checklist: [],
  };
}

// function to get the recommendation for heat dissipation failure mode
function hdfRecommendation(readings) {
  const { airTemp, processTemp, rpm } = readings;

  if (airTemp === null || processTemp === null || rpm === null) {
    return fallbackRecommendation(
      "HDF",
      "Air temperature, process temperature, or RPM is missing or invalid, so the heat-dissipation rule could not be checked.",
    );
  }

  const temperatureDifference = processTemp - airTemp;
  const temperatureCondition = temperatureDifference < HDF_TEMP_DIFF_MIN;
  const rpmCondition = rpm < HDF_RPM_MIN;

  // check if both conditions are met for the combined HDF rule
  const currentValues = [
    row(
      "Current temperature difference",
      `${formatNumber(temperatureDifference, 1)} K`,
    ),
    row("Current rotational speed", `${formatNumber(rpm, 0)} rpm`),
    row("Rule conditions", "< 8.6 K and < 1,380 rpm"),
  ];

  if (!temperatureCondition || !rpmCondition) {
    const failedConditions = [];
    if (!temperatureCondition) {
      failedConditions.push(
        `temperature difference is ${formatNumber(temperatureDifference, 1)} K, which is not below 8.6 K`,
      );
    }
    if (!rpmCondition) {
      failedConditions.push(
        `rotational speed is ${formatNumber(rpm, 0)} rpm, which is not below 1,380 rpm`,
      );
    }

    return {
      mode: "HDF",
      title: FAILURE_MODES.HDF.action,
      currentValues,
      targetValues: [],
      requiredChange: [],
      explanation: `The combined HDF rule is not currently triggered because ${failedConditions.join(" and ")}.`,
      caveat:
        "Do not change RPM or cooling settings on real equipment without appropriate engineering review.",
      checklist: [],
    };
  }

  return {
    mode: "HDF",
    title: "Break the combined heat-dissipation condition",
    currentValues,
    targetValues: [
      row("Option 1 — temperature difference", "at least 8.6 K"),
      row("Option 2 — rotational speed", "at least 1,380 rpm"),
    ],
    requiredChange: [
      row(
        "Option 1 — temperature-difference increase",
        `${formatNumber(HDF_TEMP_DIFF_MIN - temperatureDifference, 1)} K`,
      ),
      row(
        "Option 2 — RPM increase",
        `${formatNumber(HDF_RPM_MIN - rpm, 0)} rpm`,
      ),
    ],
    explanation:
      "Both HDF conditions are currently true. Either making the temperature difference at least 8.6 K or raising rotational speed to at least 1,380 rpm breaks the combined rule. These two options are measured in different physical units and are not directly comparable.",
    caveat:
      "Do not change RPM or cooling settings on real equipment without appropriate engineering review.",
    checklist: [],
  };
}

// function to get the recommendation for tool wear failure mode
function twfRecommendation(readings) {
  const { toolWear } = readings;

  if (toolWear === null) {
    return fallbackRecommendation(
      "TWF",
      "Tool wear is missing or invalid, so the tool-wear reference check could not be run.",
    );
  }

  const currentValues = [
    row("Current tool wear", `${formatNumber(toolWear, 0)} min`),
  ];

  if (toolWear >= TWF_REFERENCE_WEAR) {
    return {
      mode: "TWF",
      title: "Inspect the tool and consider replacement",
      currentValues,
      targetValues: [
        row("Simulation reference", `${TWF_REFERENCE_WEAR} min`),
      ],
      requiredChange: [],
      explanation:
        "Tool wear is at or above the 200-minute simulation reference. Inspect the tool and consider replacement before continued operation. The tool will not necessarily fail at exactly 200 minutes.",
      caveat:
        "The 200-minute value is a simulation reference, not a guaranteed failure point or an exact remaining-life estimate.",
      checklist: [],
    };
  }

  return {
    mode: "TWF",
    title: "Monitor tool wear",
    currentValues,
    targetValues: [row("Simulation reference", `${TWF_REFERENCE_WEAR} min`)],
    requiredChange: [
      row(
        "Distance to reference",
        `${formatNumber(TWF_REFERENCE_WEAR - toolWear, 0)} min`,
      ),
    ],
    explanation:
      "Tool wear is below the 200-minute simulation reference. The remaining distance is shown as a reference only; this does not predict an exact time until failure.",
    caveat:
      "The 200-minute value is a simulation reference, not a guaranteed failure point or an exact remaining-life estimate.",
    checklist: [],
  };
}

// Random failure recommendation is a general diagnostic inspection.
function rnfRecommendation() {
  return {
    mode: "RNF",
    title: "General diagnostic inspection",
    currentValues: [],
    targetValues: [],
    requiredChange: [],
    explanation:
      "The dataset's random-failure category does not identify a single component or a reliable corrective numerical target.",
    caveat:
      "Random failure cannot be reliably corrected with a deterministic formula based on the current sensor readings.",
    checklist: [
      "Review the recorded machine event and fault logs.",
      "Inspect relevant electrical connections and visible components.",
      "Repeat the sensor readings and check for inconsistent measurements.",
      "Perform a general diagnostic inspection to identify the underlying cause.",
    ],
  };
}

function findRow(rows = [], label) {
  return rows.find((item) => item.label === label)?.value ?? null;
}

function findRowStartingWith(rows = [], prefix) {
  return rows.find((item) => item.label.startsWith(prefix))?.value ?? null;
}

function firstNumber(text = "") {
  const match = text.match(/-?[\d,]+(?:\.\d+)?/);
  return match ? match[0] : null;
}

// Compact presentation for the Recommended Action card.
function compactForRecommendation(recommendation, readings) {
  const {
    mode,
    currentValues = [],
    targetValues = [],
    requiredChange = [],
  } = recommendation;

  if (mode === "OSF") {
    const currentTorque = findRow(currentValues, "Current torque");
    const targetTorque = findRow(targetValues, "Recommended torque");
    const reduction = findRow(requiredChange, "Torque reduction");

    if (reduction && currentTorque && targetTorque) {
      return {
        title: recommendation.title,
        readings: [
          { label: "Current torque", value: currentTorque },
          { label: "Target torque", value: targetTorque, tone: "target" },
        ],
        change: `Reduce by ${reduction}`,
        alternative: null,
        options: null,
        optionsNote: null,
        why: `The target comes from the Type ${readings.type ?? "L"} overstrain rule.`,
      };
    }

    if (!currentTorque) {
      return {
        title: "Check sensor readings",
        readings: [],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "A torque target could not be calculated from the current readings.",
      };
    }

    return {
      title: "Inspect the spindle and tool holder",
      readings: [{ label: "Current torque", value: currentTorque }],
      change: null,
      alternative: null,
      options: null,
      optionsNote: null,
      why:
        readings.toolWear === 0
          ? "The overstrain rule is not triggered because tool wear is zero; investigate other possible causes."
          : "The overstrain rule is not triggered by the current readings; investigate other possible causes.",
    };
  }

  if (mode === "PWF") {
    const currentPower = findRow(currentValues, "Current power");
    const currentTorque = findRow(currentValues, "Current torque");
    const torqueTarget = findRowStartingWith(targetValues, "Torque target");
    const torqueChange = findRowStartingWith(requiredChange, "Torque ");
    const rpmTarget = findRowStartingWith(targetValues, "Alternative RPM target");

    if (!currentPower) {
      return {
        title: "Check sensor readings",
        readings: [],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "A power target could not be calculated from the current readings.",
      };
    }

    if (!torqueTarget) {
      return {
        title: "Inspect the motor and power supply",
        readings: [{ label: "Current power", value: currentPower }],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "Power is inside the simulated 3,500–9,000 W range, so this rule suggests no change; investigate other possible causes.",
      };
    }

    const targetValue = firstNumber(torqueTarget);
    const rpmValue = firstNumber(rpmTarget);
    const isIncrease = torqueTarget.startsWith("at least");
    const limitWord = isIncrease ? "at least" : "at most";

    return {
      title: targetValue
        ? `${isIncrease ? "Increase" : "Reduce"} torque to ${limitWord} ${targetValue} Nm`
        : recommendation.title,
      readings: [
        ...(currentTorque
          ? [{ label: "Current torque", value: currentTorque }]
          : []),
        ...(targetValue
          ? [
              {
                label: "Target torque",
                value: `${targetValue} Nm`,
                tone: "target",
              },
            ]
          : []),
      ],
      change: torqueChange
        ? `${isIncrease ? "Increase" : "Reduce"} by ${torqueChange}`
        : null,
      alternative: rpmValue
        ? `${isIncrease ? "Increase" : "Reduce"} speed to ${limitWord} ${rpmValue} rpm at the current torque.`
        : null,
      options: null,
      optionsNote: null,
      why: `At ${formatNumber(readings.rpm, 0)} rpm, current power is ${currentPower}; the simulated range is 3,500–9,000 W.`,
    };
  }

  if (mode === "HDF") {
    const currentDiff = findRow(
      currentValues,
      "Current temperature difference",
    );
    const currentRpm = findRow(currentValues, "Current rotational speed");
    const diffTarget = findRow(
      targetValues,
      "Option 1 — temperature difference",
    );
    const diffChange = findRow(
      requiredChange,
      "Option 1 — temperature-difference increase",
    );
    const rpmTarget = findRow(targetValues, "Option 2 — rotational speed");
    const rpmChange = findRow(requiredChange, "Option 2 — RPM increase");

    if (!currentDiff || !currentRpm) {
      return {
        title: "Check sensor readings",
        readings: [],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "A heat-dissipation target could not be calculated from the current readings.",
      };
    }

    if (!diffTarget || !rpmTarget) {
      return {
        title: "Inspect the cooling system",
        readings: [
          { label: "Current temperature difference", value: currentDiff },
          { label: "Current speed", value: currentRpm },
        ],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "The simulated HDF rule is not triggered by the current readings; investigate other possible causes.",
      };
    }

    return {
      title: "Increase temperature difference or speed",
      readings: [],
      change: null,
      alternative: null,
      options: [
        {
          label: "Option A",
          title: "Temperature difference",
          current: currentDiff,
          target: `at least ${formatNumber(HDF_TEMP_DIFF_MIN, 1)} K`,
          change: `+${diffChange}`,
        },
        {
          label: "Option B",
          title: "Speed",
          current: currentRpm,
          target: `at least ${formatNumber(HDF_RPM_MIN, 0)} rpm`,
          change: `+${rpmChange}`,
        },
      ],
      optionsNote: "Either option satisfies the simulated rule.",
      why: `The simulated HDF rule triggers when temperature difference is below ${formatNumber(HDF_TEMP_DIFF_MIN, 1)} K and speed is below ${formatNumber(HDF_RPM_MIN, 0)} rpm.`,
    };
  }

  if (mode === "TWF") {
    const currentWear = findRow(currentValues, "Current tool wear");
    const reference = findRow(targetValues, "Simulation reference");
    const distance = findRow(requiredChange, "Distance to reference");

    if (!currentWear) {
      return {
        title: "Check sensor readings",
        readings: [],
        change: null,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "A tool-wear reference check could not be run from the current readings.",
      };
    }

    if (distance) {
      return {
        title: "Continue monitoring tool wear",
        readings: [
          { label: "Current wear", value: currentWear },
          {
            label: "Simulation reference",
            value: reference ?? `${TWF_REFERENCE_WEAR} min`,
          },
        ],
        change: `${distance} below reference`,
        alternative: null,
        options: null,
        optionsNote: null,
        why: "Plan an inspection as wear approaches the 200-minute reference; this is not a remaining-life estimate.",
      };
    }

    return {
      title: "Inspect the cutting tool and consider replacement",
      readings: [
        { label: "Current wear", value: currentWear },
        {
          label: "Simulation reference",
          value: reference ?? `${TWF_REFERENCE_WEAR} min`,
        },
      ],
      change: null,
      alternative: null,
      options: null,
      optionsNote: null,
      why: "Wear is at or above the 200-minute simulation reference, which is not a guaranteed failure point.",
    };
  }

  if (mode === "RNF") {
    return {
      title: "Investigate the fault",
      readings: [],
      change: null,
      alternative: null,
      options: null,
      optionsNote: null,
      why: "Random failure has no single component target; check logs, sensor readings, and relevant components.",
    };
  }

  return {
    title: recommendation.title,
    readings: [],
    change: null,
    alternative: null,
    options: null,
    optionsNote: null,
    why: "No numerical target is available for this failure mode; perform a general inspection.",
  };
}

// Shared entry point for Machine Detail and Predict.
export function maintenanceRecommendationFor(mode, record) {
  const readings = getSensorReadings(record);
  let recommendation;

  switch (mode) {
    case "OSF":
      recommendation = osfRecommendation(readings);
      break;
    case "PWF":
      recommendation = pwfRecommendation(readings);
      break;
    case "HDF":
      recommendation = hdfRecommendation(readings);
      break;
    case "TWF":
      recommendation = twfRecommendation(readings);
      break;
    case "RNF":
      recommendation = rnfRecommendation();
      break;
    default:
      recommendation = fallbackRecommendation(
        mode,
        "No quantitative maintenance rule is defined for this failure mode, so a general inspection is recommended.",
      );
  }

  return {
    ...recommendation,
    compact: compactForRecommendation(recommendation, readings),
  };
}
