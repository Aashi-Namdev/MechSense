# MechSense – AI-Powered Industrial IoT Predictive Maintenance Dashboard

MechSense is a college project that estimates machine failure risk from industrial sensor readings. It combines a React dashboard, an Express API, and a Python machine-learning service.

## 1. About the Project

Predictive maintenance means using machine data to find problems before a breakdown happens. Instead of waiting for a machine to fail, maintenance can be planned earlier.

MechSense takes six inputs: machine type, air temperature, process temperature, rotational speed, torque, and tool wear. The trained models estimate the probability of failure. If a failure is predicted, the system also estimates the likely failure types and shows a rule-based maintenance recommendation.

This is a local project, not a production system. It is meant to demonstrate the full flow from a React form to a Python ML model.

## 2. Features

- Landing page that explains the project, dataset, model approach, and two-stage prediction design.
- Dataset dashboard with KPI cards, failure distribution charts, failure-rate charts, risk bands, and a torque/RPM scatter plot.
- Machine list with 30 sample records, search, risk/type filters, and probability sorting.
- Machine detail page with prediction, risk band, likely causes, recommended action, actual dataset outcome, sensor readings, and comparison with historical averages.
- Prediction form that sends sensor values to the live Express backend and displays failure probability, threshold, risk band, predicted failure, failure types, and a maintenance recommendation.
- Model performance page with a model comparison table, final model metrics, confusion matrix, ROC/PR curves, and threshold selection table.
- Sidebar system status that checks the Express and ML service health.
- Dark/light theme toggle.

The dashboard, machine records, and model-performance values are currently static fixtures. Live data is used only for predictions and system health checks.

## Screenshots

### Landing

![Landing Page](docs/screenshots/landing.png)

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Machines

![Machines](docs/screenshots/machines.png)

### Prediction

![Prediction](docs/screenshots/predict.png)

### Machine Details

![Machine Details](docs/screenshots/machine-details.png)

### Model Performance

![Model Performance](docs/screenshots/model-performance.png)

## 3. Tech Stack

### Frontend

- React 19
- Vite 8
- JavaScript and JSX
- Tailwind CSS 4
- React Router
- React Hook Form
- Recharts
- Motion for animations
- React Icons

The frontend handles pages, forms, charts, and the visual dashboard.

### Backend

- Node.js
- Express 5
- CORS
- dotenv

The backend validates prediction requests and forwards them to the Python service.

### Machine Learning

- Python
- FastAPI
- Uvicorn
- XGBoost
- scikit-learn
- pandas
- NumPy
- joblib

The ML service loads the saved model files and runs predictions over HTTP.

There is no database in the current implementation.

## 4. How It Works

The request flow is:

```text
React frontend -> Express backend -> FastAPI ML service -> saved ML models
```

1. React collects the machine sensor readings.
2. Express receives the request, validates the values, and forwards them to Python.
3. FastAPI validates the input again and builds the feature row expected by the models.
4. The Stage 1 model predicts the probability of machine failure.
5. If failure is predicted, the Stage 2 model predicts the likely failure types.
6. The result goes back through Express to React, where the dashboard renders the prediction cards.

## 5. Machine Learning

MechSense uses the AI4I 2020 Predictive Maintenance Dataset. The project UI and fixture data reference this dataset. The raw dataset and training notebook are not included in this repository.

The model workflow has two stages.

### Stage 1: Machine failure probability

- Model: XGBoost classifier.
- Input: machine type and sensor readings, plus the engineered temperature difference feature.
- Output: a probability between 0 and 1.
- Classification threshold: `0.40`. A probability greater than or equal to `0.40` means the machine is predicted to fail.

### Stage 2: Failure type prediction

- Model: Logistic Regression wrapped in a scikit-learn `MultiOutputClassifier`.
- Runs only when Stage 1 predicts a failure.
- Output: one probability for each failure type.
- Failure type threshold: `0.50`.
- Failure types: `TWF`, `HDF`, `PWF`, `OSF`, and `RNF`.

The saved `.pkl` files contain fitted scikit-learn pipelines. The Python service loads these files with `joblib` and uses them for inference. It does not train models during a prediction request.

## 6. Project Structure

```text
MechSense/
├── backend/
│   ├── routes/
│   │   └── predictionRoutes.js
│   ├── services/
│   │   └── mlService.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── ml-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── predictor.py
│   │   └── schemas.py
│   ├── models/
│   │   ├── machine_failure_model.pkl
│   │   └── failure_type_model.pkl
│   └── requirements.txt
|── docs/
│   └── screenshots/
│       ├── landing.png
│       ├── dashboard.png
│       ├── machines.png
│       ├── predict.png
│       ├── machine-details.png
│       └── model-performance.png
├── README.md
└── PROJECT.md
```

## 7. Setup and Installation

### Prerequisites

- Node.js and npm. Use a recent LTS version that supports Vite 8.
- Python 3.10 or newer.
- Git.

### Frontend dependencies

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

### Backend dependencies

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

### Python virtual environment

Windows PowerShell:

```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

macOS or Linux:

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
```

The ML service does not need an `.env` file at the moment. It uses the model paths defined in `app/predictor.py`.

## 8. Running the Project

Run the three services in three separate terminals from the project root.

### Terminal 1: Python ML service

```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

The ML service runs at `http://localhost:8000`. FastAPI documentation is available at `http://localhost:8000/docs`.

### Terminal 2: Express backend

```powershell
cd backend
npm run dev
```

The backend runs at `http://localhost:5000`.

### Terminal 3: React frontend

```powershell
cd frontend
npm run dev
```

Vite runs the frontend at `http://localhost:5173`.

| Service            | Port |
| ------------------ | ---- |
| React frontend     | 5173 |
| Express backend    | 5000 |
| FastAPI ML service | 8000 |

## 9. API Endpoints

### `GET /api/health`

Checks whether Express is running and whether the FastAPI service has loaded both models.

Example response:

```json
{
  "backend": "ok",
  "mlService": {
    "status": "ok",
    "models_loaded": true,
    "failure_model_loaded": true,
    "failure_type_model_loaded": true,
    "load_error": null
  }
}
```

### `POST /api/predict`

Accepts one set of sensor readings and returns the prediction.

Example request:

```json
{
  "type": "L",
  "airTemp": 302.0,
  "processTemp": 310.8,
  "rpm": 1383,
  "torque": 50.3,
  "toolWear": 231
}
```

Example response, produced by the saved models for the input above:

```json
{
  "failure_probability": 0.9837,
  "predicted_failure": true,
  "threshold": 0.4,
  "temperature_difference": 8.8,
  "failure_types": ["OSF", "TWF"],
  "failure_type_probabilities": {
    "TWF": 0.648,
    "HDF": 0.1364,
    "PWF": 0.0,
    "OSF": 0.998,
    "RNF": 0.0773
  }
}
```

Invalid input returns HTTP `400` with an `error` message and validation `details`.

## 10. Current Limitations

- MongoDB is not implemented. Predictions and machine records are not saved to a database.
- Dashboard, machine, and model-performance pages use static fixture data.
- The machine list contains 30 sample records, not live machine data.
- Only the prediction form and system health check call the backend.
- The application currently runs locally. There is no authentication or deployment setup.
- The maintenance recommendations use simulated dataset rules, not validated industrial safety limits.
- The raw dataset and training notebook are not included, so model training cannot be reproduced from this repository alone.
- There are no automated tests.

## 11. Future Improvements

These are planned improvements, not current features:

- Add MongoDB to store prediction history and machine records.
- Replace dashboard and machine fixtures with real data from the backend.
- Add user authentication and role-based access.
- Add Docker support and a deployment setup.
- Add automated tests for the API and ML service.
- Add model versioning and a reproducible training pipeline.
- Improve explanations with feature importance or SHAP values.
- Validate the maintenance rules with real machine data.
- Add live sensor ingestion instead of manual input.
