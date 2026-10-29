import {
  kpiCards,
  targetDistribution,
  toolWearFailureRate,
  torqueFailureRate,
  rpmFailureRate,
  typeFailureRate,
  temperatureDifferenceFailureRate,
  riskDistribution,
  sensorAveragesByOutcome,
  torqueVsRpmScatter,
} from "./dashboard.js";

// dashboard page
export async function getOverview() {
  return {
    kpiCards,
    targetDistribution,
    charts: {
      toolWearFailureRate,
      torqueFailureRate,
      rpmFailureRate,
      typeFailureRate,
      temperatureDifferenceFailureRate,
    },
    riskDistribution, // is mock
    sensorAveragesByOutcome,
    torqueVsRpmScatter,
  };
}
