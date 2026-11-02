#.pkl files are Python models. React and Node.js cannot directly call Python functions inside those files
#FastAPI solves this by making your Python prediction function available through an HTTP endpoint.
#FastAPI as a bridge between  Node.js backend and Python ML code.
#Uvicorn is the server that runs your FastAPI application
#.\venv\Scripts\Activate.ps1 -------->activate virtual environment
#uvicorn app.main:app --reload----------> this starts your FastAPI application and makes it accessible at http://localhost:8000
#http://127.0.0.1:8000/docs--------->FastAPI automatically generates interactive API documentation at
#/docs page helps developers test the Python API.
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .predictor import (
    get_model_status,
    load_models,
    models_are_loaded,
    predict_machine,
)
from .schemas import HealthResponse, PredictionResponse, SensorReading

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load both models once when the service starts."""
    try:
        load_models()
        logger.info("Machine failure and failure type models loaded.")
    except Exception as exc:
        # Keep the service running so /health can report the problem.
        logger.error("Could not load ML models: %s", exc)
    yield


app = FastAPI(
    title="MechSense ML Service",
    version="1.0.0",
    description=(
        "Two-stage predictive maintenance API: machine failure probability, "
        "then likely failure types."
    ),
    lifespan=lifespan,
)

# Only the local React development servers are allowed for now.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["status"])
def root():
    """Basic service status."""
    return {
        "service": "MechSense ML Service",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse, tags=["status"])
def health():
    """Check whether the service is running and both models are loaded."""
    status = get_model_status()
    return {
        "status": "ok" if status["models_loaded"] else "degraded",
        **status,
    }


@app.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict(reading: SensorReading):
    """Run the two-stage prediction for one set of sensor readings."""
    if not models_are_loaded():
        try:
            load_models()
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=f"ML models are not available: {exc}",
            ) from exc

    try:
        return predict_machine(reading.model_dump())
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}",
        ) from exc
