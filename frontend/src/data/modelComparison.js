// Reconstructed Stage 1 evaluation metrics from a stratified 80/20 split with
// random_state=42. The original training and test records could not be
// independently verified. ROC-AUC and PR-AUC are retained because the landing
// page reads finalModel.rocAuc; they are not shown on Model Performance.
export const finalModel = {
  threshold: 0.4,
  accuracy: 97.05,
  precision: 53.98,
  recall: 89.71,
  f1Score: 67.4,
  rocAuc: 97.8,
  prAuc: 86.3,
};

// Confusion matrix from the reconstructed 2,000-record stratified evaluation
// split at a threshold of 0.40.
export const finalConfusionMatrix = {
  trueNegative: 1880,
  falsePositive: 52,
  falseNegative: 7,
  truePositive: 61,
  support: { normal: 1932, failure: 68 },
};
