import { riskBandFor } from "./constants.js";

// Compare the actual dataset outcome with the model's prediction.
function outcomeFor(actualFailure, predictedFailure) {
  if (actualFailure === predictedFailure) return "Correct";
  if (predictedFailure === 1 && actualFailure === 0) return "False alarm";
  return "Missed"; // predicted 0, actual 1
}

// Map one enriched API record to the shape used by the machine components.
// Actual dataset labels and model predictions stay separate.
export function toMachineViewModel(record) {
  if (!record) return null;

  const predictedFailure = record.predicted_failure ? 1 : 0;
  const failureTypeProbabilities = record.failure_type_probabilities ?? {};

  const likelyCauses = (record.predicted_failure_types ?? [])
    .map((mode) => ({
      mode,
      probability: failureTypeProbabilities[mode] ?? 0,
    }))
    .sort((a, b) => b.probability - a.probability);

  return {
    id: record.udi,
    productId: record.product_id,
    type: record.type,
    sensors: {
      airTemp: record.air_temperature,
      processTemp: record.process_temperature,
      rpm: record.rotational_speed,
      torque: record.torque,
      toolWear: record.tool_wear,
      temperatureDifference:
        record.process_temperature - record.air_temperature,
    },
    actualFailure: record.actual_failure,
    actualFailureModes: record.actual_failure_types ?? [],
    likelyCauses,
    probability: record.failure_probability,
    predictedFailure,
    riskBand: riskBandFor(record.failure_probability),
    outcome: outcomeFor(record.actual_failure, predictedFailure),
  };
}
