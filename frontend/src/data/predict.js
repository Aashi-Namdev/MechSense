import { CLASSIFICATION_THRESHOLD, riskBandFor } from "./constants.js";

// fake function
function heuristicProbability({ airTemp, processTemp, rpm, torque, toolWear }) {
  let score = 0;
  score += Math.max(0, (torque - 40) / 40) * 0.5;
  score += Math.max(0, (toolWear - 180) / 70) * 0.5;
  score += Math.max(0, (1450 - rpm) / 300) * 0.3;
  score += Math.max(0, (airTemp - 301) / 4) * 0.2;
  const logit = score * 4 - 1.5;
  const probability = 1 / (1 + Math.exp(-logit));
  return Math.min(0.99, Math.max(0.01, probability));
}

/**
 * MOCK predict function — swap the internals for a real fetch() later.
 * @param {{type: string, airTemp: number, processTemp: number, rpm: number, torque: number, toolWear: number}} input
 */
export async function mockPredict(input) {
  const temperatureDifference = +(input.processTemp - input.airTemp).toFixed(1);
  const probability = +heuristicProbability(input).toFixed(4);
  const predictedFailure = probability >= CLASSIFICATION_THRESHOLD ? 1 : 0;

  // Simulated network delay so the Predict page's loading state can be tested.
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    input: { ...input, temperatureDifference },
    probability,
    predictedFailure,
    riskBand: riskBandFor(probability),
    threshold: CLASSIFICATION_THRESHOLD,
  };
}
