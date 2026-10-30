# MechSense — Frontend Project Documentation

MechSense is an IIoT (Industrial Internet of Things) **predictive maintenance** web application. It presents a machine-learning workflow that estimates the probability of machine failure from sensor readings, identifies a likely failure cause, and recommends a maintenance action.

This document covers the frontend application in `frontend/`. All data consumed by the UI is currently **mock/static data** — there is no live backend integration yet.

---

## 1. At a Glance

| Item | Value |
| --- | --- |
| Application name | MechSense |
| Domain | IIoT predictive maintenance |
| Frontend location | `frontend/` |
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 (data router) |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Charts | Recharts 3 |
| Animation | Motion (Framer Motion successor, `motion/react`) |
| Icons | React Icons (`react-icons/fi`) |
| Forms | React Hook Form 7 |
| Language | JavaScript / JSX (no TypeScript) |
| Backend | Empty directory (`backend/`) — frontend is self-contained with mocks |

---

## 2. Project Structure

```
frontend/
├─ index.html                 # HTML shell, mounts React at #root
├─ vite.config.js             # Vite config: React + Tailwind plugins
├─ eslint.config.js           # Flat ESLint config (hooks + fast-refresh)
├─ package.json               # Scripts and dependencies
├─ public/
│  └─ favicon.png
└─ src/
   ├─ main.jsx                # App entry + route definitions
   ├─ index.css               # Tailwind import + custom design tokens
   ├─ assets/
   │  ├─ hero.png             # Landing hero background
   │  └─ MechSenseLogo.png    # Brand logo (sidebar + hero)
   ├─ layouts/
   │  └─ AppLayout.jsx        # Sidebar shell for all app pages
   ├─ pages/
   │  ├─ Landing.jsx          # Marketing/info landing page
   │  ├─ Dashboard.jsx        # Dataset analytics dashboard
   │  ├─ Machines.jsx         # Filterable machine records table
   │  ├─ MachinesDetail.jsx   # Single machine prediction detail
   │  ├─ Predict.jsx          # Interactive prediction form
   │  └─ ModelPerformance.jsx # ML evaluation metrics & charts
   ├─ components/
   │  ├─ Sidebar.jsx          # Persistent left navigation
   │  ├─ landing/             # Landing-page sections
   │  ├─ dashboard/           # Analytics cards and charts
   │  └─ machines/            # Machine/prediction UI pieces
   └─ data/
      ├─ api.js               # Mock "API" aggregation helper
      ├─ constants.js         # Thresholds, risk bands, failure-mode metadata
      ├─ dashboard.js         # Dashboard datasets
      ├─ machines.js          # Machine records + derived predictions
      ├─ modelComparison.js   # Model metrics, ROC/PR curves, threshold table
      ├─ predict.js           # Mock prediction engine (heuristics)
      └─ maintenanceRules.js  # Rule-based maintenance recommendation engine
```

---

## 3. Application Architecture

### 3.1 Entry point and routing

`src/main.jsx` creates a `createBrowserRouter` router and renders it under `StrictMode`.

| Route | Page | Layout |
| --- | --- | --- |
| `/` | `Landing` | Standalone (no sidebar) |
| `/dashboard` | `Dashboard` | `AppLayout` |
| `/machines` | `Machines` | `AppLayout` |
| `/machines/:id` | `MachinesDetail` | `AppLayout` |
| `/predict` | `Predict` | `AppLayout` |
| `/model-performance` | `ModelPerformance` | `AppLayout` |

`AppLayout.jsx` wraps authenticated-style pages with a fixed `Sidebar` and a `Footer`, offsetting the main content (`pl-16 lg:pl-64`) to match the responsive sidebar width.

### 3.2 Navigation shell

`components/Sidebar.jsx` provides:
- Brand block with logo and subtitle ("Predictive Maintenance").
- `NavLink`-based nav items: Dashboard, Machines, Predict, Model Performance.
- Active-state styling (background, cyan icon, left accent bar) with per-item Motion entrance animation.
- A "Go Back" link to `/`.
- A live-looking system status footer showing `kpiCards.totalRecords` as monitored records.
- Responsive behavior: icon-only rail at small widths (`w-16`), full labeled panel at large widths (`lg:w-64`).

### 3.3 Data layer

The application has **no network calls**. `src/data/` acts as an in-memory data/domain layer:

- `api.js` — `getOverview()` returns an aggregated object mimicking a dashboard API response. **Currently unused by pages**, which import datasets directly.
- `dashboard.js` — KPIs, distributions, failure-rate-by-range datasets, sensor averages, torque/RPM scatter points, failure-mode distribution.
- `machines.js` — 30 raw machine records transformed into `MOCK_MACHINES` with derived fields.
- `modelComparison.js` — four-model comparison, final XGBoost metrics, confusion matrix, threshold table, ROC/PR curve series.
- `predict.js` — `mockPredict()` heuristic prediction engine with artificial latency.
- `maintenanceRules.js` — rule engine mapping a failure mode + sensor readings to actionable maintenance targets.
- `constants.js` — shared thresholds, risk-band logic, and failure-mode metadata.

---

## 4. Domain Model

### 4.1 Input features

Each machine record contains five raw sensor readings plus a derived feature:

| Field | Unit | Meaning |
| --- | --- | --- |
| `airTemp` | K | Air temperature |
| `processTemp` | K | Process temperature |
| `rpm` | rpm | Rotational speed |
| `torque` | Nm | Torque |
| `toolWear` | min | Tool wear |
| `temperatureDifference` | K | Engineered feature = `processTemp - airTemp` |

Product quality type: `H` (High), `M` (Medium), `L` (Low).

### 4.2 Thresholds and risk bands (`data/constants.js`)

| Constant | Value | Purpose |
| --- | --- | --- |
| `CLASSIFICATION_THRESHOLD` | `0.4` | Stage-1 probability cut-off; `>= 0.4` predicts failure |
| `RISK_BAND_EDGES.low` | `0.3` | Start of Medium band |
| `RISK_BAND_EDGES.high` | `0.6` | Start of High band |
| `MODE_THRESHOLD` | `0.5` | Cut-off for reporting a Stage-2 failure mode |
| `OVERSTRAIN_LIMIT` | `{L: 11000, M: 12000, H: 13000}` | Simulated wear × torque limit by type |

`riskBandFor(probability)`:
- `>= 0.60` → **High**
- `>= 0.30` → **Medium**
- else → **Low**

### 4.3 Failure modes (`FAILURE_MODES`)

| Code | Label | Part | Default action |
| --- | --- | --- | --- |
| `TWF` | Tool wear failure | Cutting tool | Replace the cutting tool |
| `HDF` | Heat dissipation failure | Cooling system | Inspect cooling (coolant, fans, airflow) |
| `PWF` | Power failure | Motor / power supply | Inspect motor and power supply |
| `OSF` | Overstrain failure | Spindle / tool holder | Reduce load, check spindle and tool holder |
| `RNF` | Random failure | No specific part | General inspection |

Helpers:
- `primaryCause(likelyCauses)` → highest-probability cause.
- `recommendationFor(riskBand, likelyCauses)` → fallback text recommendation.

### 4.4 Machine record shape

`MOCK_MACHINES` entries (built in `machines.js`):

```js
{
  id,                  // numeric route id
  productId,           // e.g. "L51212"
  type,                // "H" | "M" | "L"
  sensors: {
    airTemp, processTemp, rpm, torque, toolWear, temperatureDifference
  },
  actualFailure,       // 0 | 1 (dataset ground truth)
  actualFailureModes,  // ground-truth modes, e.g. ["OSF"]
  likelyCauses,        // Stage-2 mock output; only if predicted failure
  probability,         // Stage-1 probability
  predictedFailure,    // 0 | 1 (probability >= threshold)
  riskBand,            // "Low" | "Medium" | "High"
  outcome,             // "Correct" | "False alarm" | "Missed"
}
```

`outcomeFor(actual, predicted)`:
- equal → `Correct`
- predicted 1, actual 0 → `False alarm`
- predicted 0, actual 1 → `Missed`

---

## 5. Pages

### 5.1 Landing (`/`)

A marketing/informational page composed of section components:

1. **Hero** — full-screen background image with dark overlay, logo, headline, tagline, CTAs to Dashboard and Predict.
2. **WhyPredictiveMaintenance** — problem statement + sensor → prediction → risk visual.
3. **DatasetOverview** — stats (10,000 records, 3 product types, 5 sensors, 3.39% failure rate) and note on class imbalance.
4. **AboutTheMachines** — sensor list and model-scope disclaimer.
5. **HowItWorks** — 5-stage animated vertical pipeline: Sensor Data → Feature Engineering → Failure Prediction (Stage 1) → Cause Detection (Stage 2) → Recommended Action.
6. **ModelApproach** — 5-step modeling pipeline, Stage 1/2 explanation, threshold tuning (0.40), link to Model Performance.
7. **KeyResults** — recall (89.71%) and ROC-AUC (97.80%) highlights.
8. **ClosingCta** — final navigation CTAs.
9. **Footer** — copyright line.

### 5.2 Dashboard (`/dashboard`)

Dataset analytics over the AI4I-style data.

- **KPI cards**: Records Analyzed (10,000), Overall Failure Rate (3.39%), Model Recall (89.71%), High-Risk Predictions (113).
- **Historical Failure Distribution** — donut chart (Normal 9,661 / Failure 339).
- **Failure Mode Distribution** — horizontal bars (HDF 33.92%, OSF 28.91%, PWF 28.02%, TWF 13.57%).
- **Failure Analysis** — bar charts of failure rate by tool-wear range, product type, torque range, RPM range, and temperature-difference range.
- **Prediction Risk Distribution** — Low/Medium/High band counts with percentages (marked mock).
- **Torque vs Rotational Speed** — scatter plot of normal vs failed samples.

KPI rendering note: `KpiCard` calls `value.toLocaleString()`, so the `decimals`/`suffix` options passed from `Dashboard` are not currently used in the display.

### 5.3 Machines (`/machines`)

Explorable list of machine records.

- **Summary strip** — total records and counts by risk band.
- **Filters** — free-text search by product ID, risk-band select (All/Low/Medium/High), type select (All/H/M/L), and "Showing X of Y".
- **Table** — Product ID, Type, Failure Probability (colored bar + %), Risk badge, Prediction, Actual.
- **Sorting** — toggle ascending/descending by probability via the header button.
- **Row click** — navigates to `/machines/:id`.
- Empty state shown when filters return no rows.

### 5.4 Machine Detail (`/machines/:id`)

Per-machine drill-down. Shows a "Machine not found" state for invalid ids.

- **Failure Prediction** — probability %, colored progress bar, risk band, predicted failure, threshold.
- **Likely Failure Cause** — primary mode, probability, affected part, other possible causes, or a no-cause fallback.
- **Recommended Action** — the maintenance rule engine's compact recommendation, with current/target values, alternatives, reasoning, and a simulation-only warning.
- **Actual Dataset Outcome** — predicted vs actual vs result (Correct / False alarm / Missed) and recorded ground-truth mode(s).
- **Sensor Readings** — card grid of the six sensor values.
- **Sensor vs Historical Average** — table comparing this record to normal/failed averages.

### 5.5 Predict (`/predict`)

Interactive prediction form using React Hook Form.

- Inputs: type (H/M/L), air temperature, process temperature, RPM, torque, tool wear.
- Live-computed temperature difference.
- Client-side required validation; inline error on failure.
- Submit calls `mockPredict` (400 ms simulated latency) with loading state.
- Result panel shows probability, animated bar, risk band, predicted failure, threshold.
- If a failure is predicted, it renders the same `LikelyCauseCard` and `RecommendedActionCard` used on the detail page.
- Empty and loading states are handled explicitly.

### 5.6 Model Performance (`/model-performance`)

Evaluation of the Stage-1 model.

- **Model selection statement** (XGBoost, ROC-AUC 97.8%).
- **Prediction Pipeline** — Stage 1 failure risk → Stage 2 failure mode → application recommendation.
- **Final Model Metrics** — accuracy, precision, recall, F1, ROC-AUC, PR-AUC, threshold.
- **Model Comparison table** — Logistic Regression, Decision Tree, Random Forest, XGBoost; XGBoost highlighted as selected.
- **Confusion Matrix** — TN 1880, FP 52, FN 7, TP 61, with a missed-failures note.
- **ROC Curve** and **Precision-Recall Curve** — four-model overlays drawn with Recharts, XGBoost emphasized, PR baseline at 0.0339.
- **Threshold Selection table** — precision/recall/F1 per threshold, with 0.40 marked selected.

---

## 6. Component Reference

### 6.1 Landing components (`components/landing/`)

| Component | Responsibility |
| --- | --- |
| `Hero` | Full-screen branded hero with CTAs |
| `WhyPredictiveMaintenance` | Problem framing + 3-step visual |
| `DatasetOverview` | Dataset statistics |
| `AboutTheMachines` | Sensors and scope disclaimer |
| `HowItWorks` | Animated 5-stage pipeline |
| `ModelApproach` | Modeling steps and Stage 1/2 explanation |
| `KeyResults` | Recall / ROC-AUC highlights |
| `ClosingCta` | Final CTA section |
| `Footer` | Shared footer (landing + app layout) |
| `SectionHeading` | Reusable eyebrow/title/subtitle block |
| `PrimaryButton` | Cyan filled router link |
| `SecondaryButton` | Outlined card-style router link |

### 6.2 Dashboard components (`components/dashboard/`)

| Component | Responsibility |
| --- | --- |
| `Card` | Shared animated panel with optional title |
| `KpiCard` | Icon + label + value metric card |
| `TargetDistribution` | Normal vs Failure donut with side stats |
| `FailureModeDistribution` | Animated bars per failure mode |
| `FailureRateChart` | Reusable Recharts bar chart for failure rates |
| `RiskDistribution` | Low/Medium/High band bars |
| `TorqueRpmScatter` | Normal vs failed torque/RPM scatter |

### 6.3 Machine components (`components/machines/`)

| Component | Responsibility |
| --- | --- |
| `MachineSummary` | Record + risk-band summary strip |
| `MachineFilters` | Search, risk/type selects, result count |
| `MachineTable` | Sortable, clickable machine table |
| `RiskBadge` | Colored dot + risk label |
| `riskColors.js` | Single source of band colors |
| `PredictionCard` | Probability, band, prediction, threshold |
| `LikelyCauseCard` | Primary + secondary failure causes |
| `RecommendedActionCard` | Rule-engine recommendation presentation |
| `OutcomeCard` | Ground-truth outcome comparison |
| `SensorReadings` | Six-value sensor grid |
| `SensorComparison` | Record vs historical averages table |

---

## 7. Prediction Logic

### 7.1 Stage 1 — failure probability (`data/predict.js`)

`mockPredict(input)` computes a heuristic score, not a real ML inference:

```
score = max(0, (torque - 40) / 40) * 0.5
      + max(0, (toolWear - 180) / 70) * 0.5
      + max(0, (1450 - rpm) / 300) * 0.3
      + max(0, (airTemp - 301) / 4) * 0.2

logit       = score * 4 - 1.5
probability = clamp(sigmoid(logit), 0.01, 0.99)
```

It then:
1. Derives `temperatureDifference`.
2. Sets `predictedFailure = probability >= 0.4`.
3. Computes `riskBand`.
4. Adds likely causes only when a failure is predicted.
5. Returns after a 400 ms artificial delay.

### 7.2 Stage 2 — likely failure modes (`heuristicCauses`)

```
tempDiff    = processTemp - airTemp
power       = torque * rpm * 2π / 60            // W
wearTorque  = toolWear * torque

HDF ~ 0.93 if tempDiff < 8.6 and rpm < 1380, else 0.04
PWF ~ 0.92 if power < 3500 or power > 9000, else 0.03
OSF ~ 0.91 if wearTorque > OVERSTRAIN_LIMIT[type], else 0.05
TWF ~ 0.78 if 200 <= toolWear <= 240
      0.25 if toolWear >= 180
      0.03 otherwise
```

Only modes with probability `>= MODE_THRESHOLD (0.5)` are returned, sorted descending.

### 7.3 Recommendation engine (`data/maintenanceRules.js`)

`maintenanceRecommendationFor(mode, record)` selects a rule by failure mode and returns a structured recommendation containing current values, target values, required changes, explanation, caveat, checklist, and a `compact` view for the UI.

- **OSF** — computes `maximumTorque = limit / toolWear`; recommends a rounded-down torque target that keeps `wear × torque < limit`. Handles zero wear and impossible targets.
- **PWF** — validates power against 3,500–9,000 W; computes alternative torque and RPM targets and the required changes.
- **HDF** — triggers when `tempDiff < 8.6 K` **and** `rpm < 1380`; offers either temperature-difference or RPM options.
- **TWF** — compares tool wear to the 200-minute simulation reference and reports distance or replacement guidance.
- **RNF** — no numerical rule; returns a general diagnostic checklist.
- **Default** — falls back to `FAILURE_MODES[mode].action`.

The engine normalizes both detail-page records (`sensors.*`) and prediction results (`input.*`) via `getSensorReadings()`.

Every recommendation includes a **simulation-only caveat** — targets are derived from the project's simulated dataset rules and are not validated industrial safety limits.

---

## 8. Styling and Design System

### 8.1 Theme tokens (`src/index.css`)

Tailwind 4 `@theme` defines a dark palette consumed as Tailwind utilities (e.g. `bg-bg-card`, `text-text-muted`, `border-border-subtle`).

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg-base` | `#080f14` | App background |
| `--color-bg-panel` | `#0b141b` | Sidebar |
| `--color-bg-card` | `#101b23` | Cards |
| `--color-bg-card-elevated` | `#14232d` | Nested surfaces |
| `--color-border-subtle` | `#233640` | Borders/dividers |
| `--color-primary` | `#00b8d9` | Accent / CTA |
| `--color-secondary` | `#3b82f6` | Secondary chart color |
| `--color-text-main` | `#e6eef2` | Primary text |
| `--color-text-secondary` | `#a8b7c1` | Secondary text |
| `--color-text-muted` | `#71838e` | Muted text |
| `--color-status-success` | `#22c55e` | Normal / Low risk |
| `--color-status-warning` | `#f59e0b` | Medium risk / warnings |
| `--color-status-danger` | `#ef4444` | Failure / High risk |

- Font: **Geist** (Google Fonts import).
- `color-scheme: dark` and dark base styles are applied to `body`.
- Charts reference CSS variables directly so they share the theme.

### 8.2 Interaction and animation

Motion (`motion/react`) is used throughout for:
- Entrance animations (`initial` + `animate`/`whileInView`, usually `{ opacity, y }`).
- Animated progress/bar fills.
- Hover lift on KPI cards.
- Staggered nav items and pipeline stages.

Most in-view animations use `viewport={{ once: true }}` so they run a single time.

### 8.3 Responsiveness

- Sidebar collapses to an icon rail below `lg`; labels hide.
- Grids scale from 1 column to 2/3/4 columns at breakpoints.
- Tables are horizontally scrollable with minimum widths.
- Landing sections stack on small screens and split into two columns on `lg`.

---

## 9. Data Sources (Mocks)

All displayed values are hard-coded fixtures inspired by the **AI4I 2020 Predictive Maintenance Dataset**:

- 10,000 records, 3.39% overall failure rate.
- 30 sample machine records in `machines.js`.
- Four trained models reported: Logistic Regression, Decision Tree, Random Forest, XGBoost.
- Final model: XGBoost at threshold 0.40, recall 89.71%, ROC-AUC 97.80%.
- `riskDistribution` and ROC/PR curves are explicitly marked `isMock: true`.
- `api.js` exposes `getOverview()` but pages import the data modules directly.
- `backend/` currently contains no files; there is no API contract or live inference.

---

## 10. Running the Project

```bash
cd frontend
npm install
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

Requirements: Node.js compatible with Vite 8 and React 19.

### ESLint configuration

Flat config using:
- `@eslint/js` recommended rules
- `eslint-plugin-react-hooks` recommended (flat)
- `eslint-plugin-react-refresh` Vite preset
- Browser globals, JSX parsing
- `dist/` ignored

---

## 11. Key Design Decisions

1. **Two-stage framing.** The UI clearly separates Stage 1 (ML failure probability) from Stage 2 (failure-mode estimation) and the rule-based recommendation layer. The Model Performance page explicitly states that metrics describe Stage 1 only.
2. **Single source of truth for thresholds and risk bands.** `constants.js` drives prediction, machine derivation, and badges, keeping logic consistent across pages.
3. **Shared recommendation UI.** `LikelyCauseCard` and `RecommendedActionCard` are reused by both Machine Detail and Predict.
4. **Honest simulation labeling.** Recommendation cards and landing sections repeatedly warn that numerical targets come from simulated dataset rules, not production-grade engineering limits.
5. **Mock-first architecture.** The data modules mirror an eventual API shape, so a real backend can replace them with limited refactoring.
6. **Theme via CSS variables.** Charts and components consume the same tokens, making palette changes centralized.

---

## 12. Known Limitations and Possible Improvements

- **No real backend or ML inference** — `mockPredict` is heuristic; `backend/` is empty.
- **Static datasets** — dashboard, model metrics, and machine records are hard-coded.
- **`getOverview()` unused** — pages bypass the aggregation helper; wiring it in would make backend replacement cleaner.
- **KPI formatting mismatch** — `KpiCard` ignores the `decimals`/`suffix` props passed by `Dashboard`, so percentages render without `%` and without fixed decimals.
- **Small hard-coded typo** — PR curve X-axis label uses `"ousideBottom"` (should be `"outsideBottom"`), so the label may not position as intended.
- **No pagination/virtualization** — the table renders all filtered rows; fine for 30 mocks, not for large datasets.
- **No persistence** — filters, form inputs, and results reset on navigation/reload.
- **No TypeScript** — the data contracts (machine records, recommendations, predictions) are implicit; adding TS or PropTypes would improve safety.
- **Accessibility** — interactive table rows are click-only (no keyboard/role), and chart content relies on visual encodings.
- **Testing** — no test framework or test files are configured.

---

## 13. File Index (Quick Reference)

| Path | What it does |
| --- | --- |
| `src/main.jsx` | Router and app mount |
| `src/index.css` | Tailwind + theme tokens |
| `src/layouts/AppLayout.jsx` | Sidebar + footer shell |
| `src/components/Sidebar.jsx` | Main navigation |
| `src/pages/Landing.jsx` | Landing composition |
| `src/pages/Dashboard.jsx` | Analytics dashboard |
| `src/pages/Machines.jsx` | Machine list + filtering/sorting |
| `src/pages/MachinesDetail.jsx` | Machine drill-down |
| `src/pages/Predict.jsx` | Prediction form + result |
| `src/pages/ModelPerformance.jsx` | Model evaluation |
| `src/data/constants.js` | Thresholds, bands, failure modes |
| `src/data/dashboard.js` | Dashboard fixtures |
| `src/data/machines.js` | Machine fixtures + derivation |
| `src/data/modelComparison.js` | Metrics, curves, thresholds |
| `src/data/predict.js` | Heuristic prediction engine |
| `src/data/maintenanceRules.js` | Rule-based recommendations |
| `src/data/api.js` | Mock overview aggregator (unused) |
