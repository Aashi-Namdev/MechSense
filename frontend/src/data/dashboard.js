import { RISK_BAND_EDGES } from "./constants.js";

//  KPI cards
export const kpiCards = {
  totalRecords: 10000, // machines monitored
  overallFailureRatePct: 3.39, // 339 failures / 10000 records
  modelRecallPct: 89.71, // % of actual failures that the model correctly predicted
  highRiskCount: 113, //  machines in the high risk band (>=0.60 probability)
};

//  target distribution ( Normal vs Failure)
export const targetDistribution = [
  { label: "Normal", value: 9661, percent: 96.61 },
  { label: "Failure", value: 339, percent: 3.39 },
];

// Failure rate by Tool wear range
export const toolWearFailureRate = [
  { range: "0-50 min", count: 2349, failures: 52, failureRatePct: 2.21 },
  { range: "50-100 min", count: 2271, failures: 51, failureRatePct: 2.25 },
  { range: "100-150 min", count: 2290, failures: 52, failureRatePct: 2.27 },
  { range: "150-200 min", count: 2289, failures: 61, failureRatePct: 2.66 },
  { range: "200-250 min", count: 799, failures: 121, failureRatePct: 15.14 },
];

// Failure rate by Torque range
export const torqueFailureRate = [
  { range: "<25 Nm", count: 687, failures: 36, failureRatePct: 5.24 },
  { range: "25-35 Nm", count: 2355, failures: 13, failureRatePct: 0.55 },
  { range: "35-45 Nm", count: 3832, failures: 26, failureRatePct: 0.68 },
  { range: "45-55 Nm", count: 2508, failures: 115, failureRatePct: 4.59 },
  { range: "55+ Nm", count: 618, failures: 149, failureRatePct: 24.11 },
];

//  Failure rate by Rotational speed range
export const rpmFailureRate = [
  { range: "1000-1300 rpm", count: 211, failures: 49, failureRatePct: 23.22 },
  { range: "1300-1500 rpm", count: 4688, failures: 229, failureRatePct: 4.88 },
  { range: "1500-1700 rpm", count: 3754, failures: 21, failureRatePct: 0.56 },
  { range: "1700-1900 rpm", count: 936, failures: 5, failureRatePct: 0.53 },
  { range: "1900+ rpm", count: 411, failures: 35, failureRatePct: 8.52 },
];

//  Failure rate by Type
export const typeFailureRate = [
  {
    type: "H",
    label: "High quality",
    count: 1003,
    failures: 21,
    failureRatePct: 2.09,
  },
  {
    type: "M",
    label: "Medium quality",
    count: 2997,
    failures: 83,
    failureRatePct: 2.77,
  },
  {
    type: "L",
    label: "Low quality",
    count: 6000,
    failures: 235,
    failureRatePct: 3.92,
  },
];

//  Failure rate by  temp difference range
export const temperatureDifferenceFailureRate = [
  { range: "<8.5 K", count: 562, failures: 94, failureRatePct: 16.73 },
  { range: "8.5-9.5 K", count: 2868, failures: 96, failureRatePct: 3.35 },
  { range: "9.5-10.5 K", count: 2683, failures: 62, failureRatePct: 2.31 },
  { range: "10.5-11.5 K", count: 3443, failures: 83, failureRatePct: 2.41 },
  { range: "11.5+ K", count: 444, failures: 4, failureRatePct: 0.9 },
];

//  Risk distribution
//  Low <0.30, Medium 0.30-0.60, High >=0.60
export const riskDistribution = {
  isMock: true,
  bandEdges: RISK_BAND_EDGES,
  bands: [
    { band: "Low", count: 1720 },
    { band: "Medium", count: 167 },
    { band: "High", count: 113 },
  ],
};

//  Sensor averages: Normal vs Failed
export const sensorAveragesByOutcome = {
  normal: {
    airTemp: 299.97,
    processTemp: 310.0,
    rpm: 1540.26,
    torque: 39.63,
    toolWear: 106.69,
    temperatureDifference: 10.02,
  },
  failed: {
    airTemp: 300.89,
    processTemp: 310.29,
    rpm: 1496.49,
    torque: 50.17,
    toolWear: 143.78,
    temperatureDifference: 9.4,
  },
};

// ---- Torque vs RPM scatter (scatter chart)
export const torqueVsRpmScatter = {
  normal: [
    { torque: 33.0, rpm: 1617 },
    { torque: 45.4, rpm: 1420 },
    { torque: 43.7, rpm: 1492 },
    { torque: 48.1, rpm: 1319 },
    { torque: 37.8, rpm: 1492 },
    { torque: 50.9, rpm: 1443 },
    { torque: 57.1, rpm: 1295 },
    { torque: 56.8, rpm: 1313 },
    { torque: 29.9, rpm: 1732 },
    { torque: 36.1, rpm: 1622 },
    { torque: 33.4, rpm: 1606 },
    { torque: 24.3, rpm: 1827 },
    { torque: 50.6, rpm: 1414 },
    { torque: 37.1, rpm: 1505 },
    { torque: 38.3, rpm: 1571 },
    { torque: 24.8, rpm: 1877 },
    { torque: 50.1, rpm: 1402 },
    { torque: 49.8, rpm: 1328 },
    { torque: 43.7, rpm: 1441 },
    { torque: 50.9, rpm: 1322 },
    { torque: 26.3, rpm: 1670 },
    { torque: 46.5, rpm: 1508 },
    { torque: 36.1, rpm: 1581 },
    { torque: 46.7, rpm: 1398 },
    { torque: 35.4, rpm: 1596 },
    { torque: 30.4, rpm: 1722 },
    { torque: 44.9, rpm: 1552 },
    { torque: 54.5, rpm: 1382 },
    { torque: 39.9, rpm: 1473 },
    { torque: 41.3, rpm: 1672 },
    { torque: 39.4, rpm: 1473 },
    { torque: 28.4, rpm: 1716 },
    { torque: 32.9, rpm: 1736 },
    { torque: 40.9, rpm: 1406 },
    { torque: 31.5, rpm: 1659 },
    { torque: 43.6, rpm: 1512 },
    { torque: 51.2, rpm: 1495 },
    { torque: 32.2, rpm: 1713 },
    { torque: 39.8, rpm: 1491 },
    { torque: 31.5, rpm: 1521 },
  ],
  failed: [
    { torque: 54.5, rpm: 1366 },
    { torque: 63.2, rpm: 1367 },
    { torque: 52.8, rpm: 1314 },
    { torque: 33.1, rpm: 1553 },
    { torque: 52.2, rpm: 1312 },
    { torque: 12.0, rpm: 2639 },
    { torque: 44.8, rpm: 1421 },
    { torque: 44.2, rpm: 1359 },
    { torque: 56.4, rpm: 1385 },
    { torque: 5.8, rpm: 2825 },
    { torque: 51.5, rpm: 1417 },
    { torque: 46.8, rpm: 1377 },
    { torque: 50.6, rpm: 1329 },
    { torque: 61.5, rpm: 1399 },
    { torque: 62.0, rpm: 1315 },
    { torque: 10.7, rpm: 2678 },
    { torque: 49.7, rpm: 1431 },
    { torque: 59.6, rpm: 1459 },
    { torque: 58.5, rpm: 1326 },
    { torque: 63.9, rpm: 1420 },
  ],
};

// Failure mode distribution
export const failureModeDistribution = [
  {
    mode: "HDF",
    label: "Heat dissipation",
    count: 115,
    percentOfFailures: 33.92,
  },
  { mode: "OSF", label: "Overstrain", count: 98, percentOfFailures: 28.91 },
  { mode: "PWF", label: "Power", count: 95, percentOfFailures: 28.02 },
  { mode: "TWF", label: "Tool wear", count: 46, percentOfFailures: 13.57 },
];
