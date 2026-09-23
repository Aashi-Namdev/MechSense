// 4-model comparison table
export const modelComparisonTable = [
  {
    model: "Logistic Regression",
    accuracy: 81.2,
    precision: 13.16,
    recall: 80.88,
    f1Score: 22.63,
    rocAuc: 88.96,
    prAuc: 33.65,
  },
  {
    model: "Decision Tree",
    accuracy: 97.75,
    precision: 68.25,
    recall: 63.24,
    f1Score: 65.65,
    rocAuc: 81.1,
    prAuc: 44.41,
  },
  {
    model: "Random Forest",
    accuracy: 98.65,
    precision: 83.61,
    recall: 75.0,
    f1Score: 79.1,
    rocAuc: 97.29,
    prAuc: 82.86,
  },
  {
    model: "XGBoost",
    accuracy: 97.5,
    precision: 59.0,
    recall: 86.76,
    f1Score: 70.24,
    rocAuc: 97.8,
    prAuc: 86.3,
  },
];

// XGBoost retrained on the full 8,000-row training set, evaluated on the
// untouched 2,000-row test set
export const finalModel = {
  name: "XGBoost (final)",
  threshold: 0.4,
  accuracy: 97.05,
  precision: 53.98,
  recall: 89.71,
  f1Score: 67.4,
  rocAuc: 97.8,
  prAuc: 86.3,
};

// Confusion matrix for the final model
export const finalConfusionMatrix = {
  trueNegative: 1880,
  falsePositive: 52,
  falseNegative: 7,
  truePositive: 61,
  support: { normal: 1932, failure: 68 },
};

// Threshold selection table
export const thresholdTable = [
  { threshold: 0.1, precision: 26.04, recall: 92.59, f1: 40.65 },
  { threshold: 0.15, precision: 30.0, recall: 88.89, f1: 44.86 },
  { threshold: 0.2, precision: 35.29, recall: 88.89, f1: 50.53 },
  { threshold: 0.25, precision: 39.17, recall: 87.04, f1: 54.02 },
  { threshold: 0.3, precision: 46.53, recall: 87.04, f1: 60.65 },
  { threshold: 0.35, precision: 47.37, recall: 83.33, f1: 60.4 },
  {
    threshold: 0.4,
    precision: 52.33,
    recall: 83.33,
    f1: 64.29,
    selected: true,
  },
  { threshold: 0.45, precision: 58.11, recall: 79.63, f1: 67.19 },
  { threshold: 0.5, precision: 63.49, recall: 74.07, f1: 68.38 },
  { threshold: 0.55, precision: 66.1, recall: 72.22, f1: 69.03 },
  { threshold: 0.6, precision: 69.09, recall: 70.37, f1: 69.72 },
  { threshold: 0.65, precision: 74.51, recall: 70.37, f1: 72.38 },
  { threshold: 0.7, precision: 79.17, recall: 70.37, f1: 74.51 },
];

// roc curve
export const rocCurves = {
  isMock: true,
  logisticRegression: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.1, tpr: 0.57 },
    { fpr: 0.2, tpr: 0.83 },
    { fpr: 0.3, tpr: 0.94 },
    { fpr: 0.4, tpr: 0.98 },
    { fpr: 0.6, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  decisionTree: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.1, tpr: 0.36 },
    { fpr: 0.2, tpr: 0.62 },
    { fpr: 0.3, tpr: 0.78 },
    { fpr: 0.5, tpr: 0.95 },
    { fpr: 0.7, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  randomForest: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.05, tpr: 0.85 },
    { fpr: 0.1, tpr: 0.98 },
    { fpr: 0.2, tpr: 1.0 },
    { fpr: 0.5, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 },
  ],
  xgboost: [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.03, tpr: 0.88 },
    { fpr: 0.08, tpr: 0.99 },
    { fpr: 0.2, tpr: 1.0 },
    { fpr: 0.5, tpr: 1.0 },
    { fpr: 1.0, tpr: 1.0 },
  ],
};

// Precision-Recall curves
export const prCurves = {
  isMock: true,
  baselinePrecision: 0.0339,
  logisticRegression: [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.2, precision: 0.55 },
    { recall: 0.4, precision: 0.35 },
    { recall: 0.6, precision: 0.22 },
    { recall: 0.81, precision: 0.13 },
    { recall: 1.0, precision: 0.034 },
  ],
  decisionTree: [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.2, precision: 0.8 },
    { recall: 0.4, precision: 0.72 },
    { recall: 0.63, precision: 0.68 },
    { recall: 0.8, precision: 0.3 },
    { recall: 1.0, precision: 0.034 },
  ],
  randomForest: [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.3, precision: 0.95 },
    { recall: 0.5, precision: 0.9 },
    { recall: 0.75, precision: 0.84 },
    { recall: 0.9, precision: 0.4 },
    { recall: 1.0, precision: 0.034 },
  ],
  xgboost: [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.3, precision: 0.93 },
    { recall: 0.5, precision: 0.85 },
    { recall: 0.83, precision: 0.52 },
    { recall: 0.9, precision: 0.4 },
    { recall: 1.0, precision: 0.034 },
  ],
};
