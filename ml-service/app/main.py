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
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .predictor import (
    get_dashboard_data,
    get_dataset_status,
    get_machine_by_udi,
    get_machines_page,
    get_model_status,
    load_enriched_dataset,
    load_models,
    models_are_loaded,
    predict_machine,
)
from .schemas import (
    DashboardResponse,
    HealthResponse,
    MachineRecord,
    MachinesResponse,
    PredictionResponse,
    SensorReading,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load both models and enrich the dataset once when the service starts."""
    try:
        load_models()
        logger.info("Machine failure and failure type models loaded.")
    except Exception as exc:
        # Keep the service running so /health can report the problem.
        logger.error("Could not load ML models: %s", exc)

    try:
        machines, _ = load_enriched_dataset()
        logger.info("AI4I dataset loaded and enriched: %s records.", len(machines))
    except Exception as exc:
        # Keep the service running so /health can report the problem.
        logger.error("Could not load or enrich the dataset: %s", exc)

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
    """Check whether the service, models, and dataset are ready."""
    status = get_model_status()
    dataset_status = get_dataset_status()
    ready = status["models_loaded"] and dataset_status["dataset_loaded"]

    return {
        "status": "ok" if ready else "degraded",
        **status,
        **dataset_status,
    }


@app.get("/dashboard", response_model=DashboardResponse, tags=["dashboard"])
def dashboard():
    """Return dataset-wide aggregates used by the dashboard page."""
    try:
        return get_dashboard_data()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Dashboard data is not available: {exc}",
        ) from exc


@app.get("/machines", response_model=MachinesResponse, tags=["machines"])
def list_machines(
    page: int = Query(1, ge=1, description="Page number, starting at 1."),
    limit: int = Query(
        50, ge=1, le=100, description="Records per page (maximum 100)."
    ),
    search: str | None = Query(
        None, max_length=100, description="Search by product ID or UDI."
    ),
    machine_type: Literal["L", "M", "H"] | None = Query(
        None, alias="type", description="Filter by machine type."
    ),
    risk: Literal["Low", "Medium", "High"] | None = Query(
        None, description="Filter by predicted risk band."
    ),
    sort: Literal["asc", "desc"] = Query(
        "desc", description="Sort by predicted failure probability."
    ),
):
    """Return a filtered, sorted page of enriched dataset records."""
    try:
        items, pagination, summary = get_machines_page(
            page=page,
            limit=limit,
            search=search,
            machine_type=machine_type,
            risk=risk,
            sort_dir=sort,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Machine dataset is not available: {exc}",
        ) from exc

    return {
        "items": items,
        "pagination": pagination,
        "summary": summary,
    }


@app.get(
    "/machines/{udi}",
    response_model=MachineRecord,
    tags=["machines"],
)
def get_machine(udi: int):
    """Return one enriched dataset record by its stable UDI identifier."""
    try:
        machine = get_machine_by_udi(udi)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Machine dataset is not available: {exc}",
        ) from exc

    if machine is None:
        raise HTTPException(
            status_code=404,
            detail=f"Machine with UDI {udi} was not found.",
        )

    return machine


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
