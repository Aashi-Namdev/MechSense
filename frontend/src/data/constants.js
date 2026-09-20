// threshold for predicting failure
export const CLASSIFICATION_THRESHOLD = 0.4;
//  risk bands
export const RISK_BAND_EDGES = { low: 0.3, high: 0.6 };

export function riskBandFor(probability) {
  if (probability >= RISK_BAND_EDGES.high) return "High";
  if (probability >= RISK_BAND_EDGES.low) return "Medium";
  return "Low";
}
