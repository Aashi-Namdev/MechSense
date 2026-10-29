import {
  CLASSIFICATION_THRESHOLD,
  riskBandFor,
  MODE_THRESHOLD,
  OVERSTRAIN_LIMIT,
} from "./constants.js";

// fake function to predict failure probability
function heuristicProbability({ airTemp, rpm, torque, toolWear }) {
  let score = 0;
  score += Math.max(0, (torque - 40) / 40) * 0.5;
  score += Math.max(0, (toolWear - 180) / 70) * 0.5;
  score += Math.max(0, (1450 - rpm) / 300) * 0.3;
  score += Math.max(0, (airTemp - 301) / 4) * 0.2;
  const logit = score * 4 - 1.5;
  const probability = 1 / (1 + Math.exp(-logit));
  return Math.min(0.99, Math.max(0.01, probability));
}

// fake function to predict likely causes of failure
function heuristicCauses(input) {
  const airTemp = Number(input.airTemp);
  const processTemp = Number(input.processTemp);
  const rpm = Number(input.rpm);
  const torque = Number(input.torque);
  const toolWear = Number(input.toolWear);

  const tempDiff = processTemp - airTemp;
  const power = (torque * rpm * 2 * Math.PI) / 60; // watts
  const wearTorque = toolWear * torque;

  const probs = {
    HDF: tempDiff < 8.6 && rpm < 1380 ? 0.93 : 0.04,
    PWF: power < 3500 || power > 9000 ? 0.92 : 0.03,
    OSF: wearTorque > (OVERSTRAIN_LIMIT[input.type] ?? 11000) ? 0.91 : 0.05,
    TWF:
      toolWear >= 200 && toolWear <= 240 ? 0.78 : toolWear >= 180 ? 0.25 : 0.03,
  };

  return Object.entries(probs)
    .filter(([, probability]) => probability >= MODE_THRESHOLD)
    .map(([mode, probability]) => ({ mode, probability }))
    .sort((a, b) => b.probability - a.probability);
}
/**
 * @param {{type: string, airTemp: number, processTemp: number, rpm: number, torque: number, toolWear: number}} input
 */
export async function mockPredict(input) {
  const temperatureDifference = +(input.processTemp - input.airTemp).toFixed(1);
  const probability = +heuristicProbability(input).toFixed(4);
  const predictedFailure = probability >= CLASSIFICATION_THRESHOLD ? 1 : 0;

  await new Promise((resolve) => setTimeout(resolve, 400));

  // return a mock prediction result
  return {
    input: { ...input, temperatureDifference },
    probability,
    predictedFailure,
    riskBand: riskBandFor(probability),
    threshold: CLASSIFICATION_THRESHOLD,
    likelyCauses: predictedFailure == 1 ? heuristicCauses(input) : [],
  };
}
