// threshold for predicting failure
export const CLASSIFICATION_THRESHOLD = 0.4;
//  risk bands
export const RISK_BAND_EDGES = { low: 0.3, high: 0.6 };

// threshold for predicting failure mode
export const MODE_THRESHOLD = 0.5;

// simulated overstrain limit by machine type
export const OVERSTRAIN_LIMIT = { L: 11000, M: 12000, H: 13000 };

export function riskBandFor(probability) {
  if (probability >= RISK_BAND_EDGES.high) return "High";
  if (probability >= RISK_BAND_EDGES.low) return "Medium";
  return "Low";
}

// failure modes and their corresponding parts and actions
export const FAILURE_MODES = {
  TWF: {
    label: "Tool wear failure",
    part: "Cutting tool",
    action: "Replace the cutting tool",
  },
  HDF: {
    label: "Heat dissipation failure",
    part: "Cooling system",
    action: "Inspect the cooling system (coolant flow, fans, airflow)",
  },
  PWF: {
    label: "Power failure",
    part: "Motor / power supply",
    action: "Inspect the motor and power supply",
  },
  OSF: {
    label: "Overstrain failure",
    part: "Spindle / tool holder",
    action: "Reduce the load and check the spindle and tool holder",
  },
  RNF: {
    label: "Random failure",
    part: "No specific part",
    action: "No specific part identified, do a general inspection",
  },
};

// function to get the primary cause from likely causes
export function primaryCause(likelyCauses = []) {
  return (
    [...likelyCauses].sort((a, b) => b.probability - a.probability)[0] ?? null
  );
}

// function to get the recommendation based on risk band and likely causes
export function recommendationFor(riskBand, likelyCauses = []) {
  const primary = primaryCause(likelyCauses);
  if (primary && FAILURE_MODES[primary.mode]) {
    return FAILURE_MODES[primary.mode].action;
  }
  if (riskBand === "High") return "Schedule immediate inspection";
  if (riskBand === "Medium") return "Monitor closely, schedule routine check";
  return "No action needed";
}
