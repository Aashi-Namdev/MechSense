import math
import threading
from pathlib import Path
from typing import Any, Callable

import joblib
import numpy as np
import pandas as pd

# Model files live in ml-service/models, one level above this app package.
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
FAILURE_MODEL_PATH = MODEL_DIR / "machine_failure_model.pkl"
FAILURE_TYPE_MODEL_PATH = MODEL_DIR / "failure_type_model.pkl"
DATASET_PATH = BASE_DIR / "data" / "ai4i2020.csv"

# The saved pickles do not store a decision threshold. MechSense's project
# configuration uses 0.40 for the failure model and 0.50 for failure types.
CLASSIFICATION_THRESHOLD = 0.40
FAILURE_TYPE_THRESHOLD = 0.50

# These are the exact column names expected by both trained pipelines.
# Temperature Difference [K] is an engineered feature:
# Process temperature [K] - Air temperature [K].
FEATURE_COLUMNS = [
    "Type",
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Temperature Difference [K]",
]

# MultiOutputClassifier returns its five outputs in the same order as the
# target columns used during training. Probing the saved model confirms:
# TWF, HDF, PWF, OSF, RNF.
FAILURE_TYPE_LABELS = ["TWF", "HDF", "PWF", "OSF", "RNF"]

# Human-readable labels used by the dashboard failure-mode breakdown.
FAILURE_MODE_LABELS = {
    "TWF": "Tool wear",
    "HDF": "Heat dissipation",
    "PWF": "Power",
    "OSF": "Overstrain",
    "RNF": "Random",
}

# Columns that must exist in the raw AI4I CSV before it can be enriched.
DATASET_COLUMNS = [
    "UDI",
    "Product ID",
    "Type",
    "Air temperature [K]",
    "Process temperature [K]",
    "Rotational speed [rpm]",
    "Torque [Nm]",
    "Tool wear [min]",
    "Machine failure",
    *FAILURE_TYPE_LABELS,
]

# Risk bands mirror frontend/src/data/constants.js so the API summary matches
# the colours and bands shown in the UI. These are presentation bands, not
# model decision thresholds.
RISK_BAND_MEDIUM = 0.30
RISK_BAND_HIGH = 0.60

# Models are stored at module level so they are loaded only once per process.
failure_model = None
failure_type_model = None
model_load_error: str | None = None

# The enriched dataset is also cached at module level. It is built once from
# the CSV and the saved models, then reused by every paginated request.
_enriched_machines: list[dict[str, Any]] | None = None
_dataset_summary: dict[str, int] | None = None
_dataset_load_error: str | None = None
_dataset_lock = threading.Lock()

# Dashboard aggregates are built once from the enriched dataset and reused.
_dashboard_data: dict[str, Any] | None = None
_dashboard_lock = threading.Lock()


def load_models() -> None:
    """Load both saved pipelines once. Raises if either model cannot be opened."""
    global failure_model, failure_type_model, model_load_error

    if failure_model is not None and failure_type_model is not None:
        return

    try:
        # Load into local variables first so a partial failure does not leave
        # the service in a half-ready state.
        loaded_failure_model = joblib.load(FAILURE_MODEL_PATH)
        loaded_failure_type_model = joblib.load(FAILURE_TYPE_MODEL_PATH)
    except Exception as exc:
        model_load_error = str(exc)
        raise

    failure_model = loaded_failure_model
    failure_type_model = loaded_failure_type_model
    model_load_error = None


def models_are_loaded() -> bool:
    """Return True only when both models are available."""
    return failure_model is not None and failure_type_model is not None


def get_model_status() -> dict[str, Any]:
    """Return model loading details for the /health endpoint."""
    return {
        "models_loaded": models_are_loaded(),
        "failure_model_loaded": failure_model is not None,
        "failure_type_model_loaded": failure_type_model is not None,
        "load_error": model_load_error,
    }


def _ensure_models_loaded() -> None:
    if not models_are_loaded():
        load_models()


def build_feature_frame(
    machine_type: str,
    air_temperature: float,
    process_temperature: float,
    rotational_speed: float,
    torque: float,
    tool_wear: float,
) -> pd.DataFrame:
    """Create the one-row DataFrame expected by both trained pipelines."""
    temperature_difference = process_temperature - air_temperature

    row = {
        "Type": machine_type,
        "Air temperature [K]": air_temperature,
        "Process temperature [K]": process_temperature,
        "Rotational speed [rpm]": rotational_speed,
        "Torque [Nm]": torque,
        "Tool wear [min]": tool_wear,
        "Temperature Difference [K]": temperature_difference,
    }

    # Passing columns explicitly keeps the feature order identical to training.
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def predict_failure_probability(features: pd.DataFrame) -> float:
    """Run Stage 1 and return the probability of machine failure."""
    _ensure_models_loaded()
    # classes_ is [0, 1], so column 1 is the failure probability.
    probability = failure_model.predict_proba(features)[0][1]
    return float(probability)


def predict_failure_types(
    features: pd.DataFrame,
) -> tuple[list[str], dict[str, float]]:
    """Run Stage 2 and return failure types above 0.50 plus all probabilities."""
    _ensure_models_loaded()

    predicted_types: list[str] = []
    probabilities_by_type: dict[str, float] = {}

    # predict_proba returns one (n_samples, 2) array per failure type.
    output_probabilities = failure_type_model.predict_proba(features)

    for label, output_probability in zip(
        FAILURE_TYPE_LABELS, output_probabilities
    ):
        probability = float(output_probability[0][1])
        probabilities_by_type[label] = round(probability, 4)

        if probability >= FAILURE_TYPE_THRESHOLD:
            predicted_types.append(label)

    # Most likely cause first, which is convenient for the dashboard.
    predicted_types.sort(
        key=lambda label: probabilities_by_type[label], reverse=True
    )

    return predicted_types, probabilities_by_type


def predict_machine(sensor_data: dict[str, Any]) -> dict[str, Any]:
    """Run the complete two-stage prediction flow for one sensor reading."""
    _ensure_models_loaded()

    features = build_feature_frame(
        machine_type=sensor_data["machine_type"],
        air_temperature=sensor_data["air_temperature"],
        process_temperature=sensor_data["process_temperature"],
        rotational_speed=sensor_data["rotational_speed"],
        torque=sensor_data["torque"],
        tool_wear=sensor_data["tool_wear"],
    )

    failure_probability = predict_failure_probability(features)
    predicted_failure = failure_probability >= CLASSIFICATION_THRESHOLD

    failure_types: list[str] = []
    failure_type_probabilities: dict[str, float] = {}

    # Skip the second model entirely when the machine is predicted healthy.
    if predicted_failure:
        failure_types, failure_type_probabilities = predict_failure_types(
            features
        )

    return {
        "failure_probability": round(failure_probability, 4),
        "predicted_failure": predicted_failure,
        "threshold": CLASSIFICATION_THRESHOLD,
        "temperature_difference": round(
            sensor_data["process_temperature"]
            - sensor_data["air_temperature"],
            2,
        ),
        "failure_types": failure_types,
        "failure_type_probabilities": failure_type_probabilities,
    }


def risk_band_for(probability: float) -> str:
    """Map a probability to the same Low/Medium/High bands as the frontend."""
    if probability >= RISK_BAND_HIGH:
        return "High"
    if probability >= RISK_BAND_MEDIUM:
        return "Medium"
    return "Low"


def build_feature_frame_from_dataset(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Build the exact feature frame expected by the saved models for a batch."""
    return pd.DataFrame(
        {
            "Type": dataframe["Type"],
            "Air temperature [K]": dataframe["Air temperature [K]"],
            "Process temperature [K]": dataframe["Process temperature [K]"],
            "Rotational speed [rpm]": dataframe["Rotational speed [rpm]"],
            "Torque [Nm]": dataframe["Torque [Nm]"],
            "Tool wear [min]": dataframe["Tool wear [min]"],
            "Temperature Difference [K]": (
                dataframe["Process temperature [K]"]
                - dataframe["Air temperature [K]"]
            ),
        },
        columns=FEATURE_COLUMNS,
    )


def _build_enriched_dataset() -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Load the CSV, run batch inference, and combine labels with predictions."""
    _ensure_models_loaded()

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset file not found: {DATASET_PATH}")

    dataframe = pd.read_csv(DATASET_PATH)

    missing_columns = [
        column for column in DATASET_COLUMNS if column not in dataframe.columns
    ]
    if missing_columns:
        raise ValueError(
            "Dataset is missing required column(s): "
            + ", ".join(missing_columns)
        )

    if dataframe.empty:
        raise ValueError(f"Dataset file is empty: {DATASET_PATH}")

    features = build_feature_frame_from_dataset(dataframe)

    # Stage 1: vectorized inference for every record in one call.
    failure_probabilities = failure_model.predict_proba(features)[:, 1]
    predicted_mask = failure_probabilities >= CLASSIFICATION_THRESHOLD

    # Stage 2: only run the failure-type model on records predicted to fail.
    type_probabilities = {
        label: np.zeros(len(dataframe), dtype=float)
        for label in FAILURE_TYPE_LABELS
    }
    predicted_indices = np.flatnonzero(predicted_mask)

    if predicted_indices.size > 0:
        type_outputs = failure_type_model.predict_proba(
            features.iloc[predicted_indices]
        )
        for label, output in zip(FAILURE_TYPE_LABELS, type_outputs):
            type_probabilities[label][predicted_indices] = output[:, 1]

    machines: list[dict[str, Any]] = []
    actual_failures = 0
    predicted_failures = 0
    high_risk = 0
    medium_risk = 0
    low_risk = 0

    for index, row in enumerate(dataframe.to_dict("records")):
        actual_failure = int(row["Machine failure"])
        actual_failure_types = [
            label
            for label in FAILURE_TYPE_LABELS
            if int(row[label]) == 1
        ]

        probability = round(float(failure_probabilities[index]), 4)
        predicted_failure = bool(predicted_mask[index])

        if predicted_failure:
            failure_type_probabilities = {
                label: round(float(type_probabilities[label][index]), 4)
                for label in FAILURE_TYPE_LABELS
            }
            predicted_failure_types = sorted(
                (
                    label
                    for label, type_probability in (
                        failure_type_probabilities.items()
                    )
                    if type_probability >= FAILURE_TYPE_THRESHOLD
                ),
                key=lambda label: failure_type_probabilities[label],
                reverse=True,
            )
            predicted_failures += 1
        else:
            # Match the single-prediction response: no Stage-2 output when the
            # machine is predicted healthy.
            failure_type_probabilities = {}
            predicted_failure_types = []

        band = risk_band_for(probability)
        if band == "High":
            high_risk += 1
        elif band == "Medium":
            medium_risk += 1
        else:
            low_risk += 1

        if actual_failure:
            actual_failures += 1

        machines.append(
            {
                "udi": int(row["UDI"]),
                "product_id": str(row["Product ID"]),
                "type": str(row["Type"]),
                "air_temperature": float(row["Air temperature [K]"]),
                "process_temperature": float(
                    row["Process temperature [K]"]
                ),
                "rotational_speed": int(row["Rotational speed [rpm]"]),
                "torque": float(row["Torque [Nm]"]),
                "tool_wear": int(row["Tool wear [min]"]),
                "actual_failure": actual_failure,
                "actual_failure_types": actual_failure_types,
                "failure_probability": probability,
                "predicted_failure": predicted_failure,
                "predicted_failure_types": predicted_failure_types,
                "failure_type_probabilities": failure_type_probabilities,
            }
        )

    summary = {
        "total": len(machines),
        "actual_failures": actual_failures,
        "predicted_failures": predicted_failures,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
    }

    return machines, summary


def load_enriched_dataset() -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Return the cached enriched dataset, building it once on first use."""
    global _enriched_machines, _dataset_summary, _dataset_load_error

    if _enriched_machines is not None and _dataset_summary is not None:
        return _enriched_machines, _dataset_summary

    # FastAPI runs sync endpoints in a thread pool, so guard the first build.
    with _dataset_lock:
        if _enriched_machines is not None and _dataset_summary is not None:
            return _enriched_machines, _dataset_summary

        try:
            machines, summary = _build_enriched_dataset()
        except Exception as exc:
            _dataset_load_error = str(exc)
            raise

        _enriched_machines = machines
        _dataset_summary = summary
        _dataset_load_error = None

        return _enriched_machines, _dataset_summary


def get_dataset_status() -> dict[str, Any]:
    """Return dataset cache details for the /health endpoint."""
    return {
        "dataset_loaded": _enriched_machines is not None,
        "dataset_records": (
            len(_enriched_machines)
            if _enriched_machines is not None
            else None
        ),
        "dataset_error": _dataset_load_error,
    }


def get_machine_by_udi(udi: int) -> dict[str, Any] | None:
    """Return one enriched record by its stable UDI identifier."""
    machines, _ = load_enriched_dataset()

    # UDI values are sequential in the AI4I dataset, so try the direct index
    # first and fall back to a scan if the file is ever reordered.
    if 1 <= udi <= len(machines) and machines[udi - 1]["udi"] == udi:
        return machines[udi - 1]

    for machine in machines:
        if machine["udi"] == udi:
            return machine

    return None


def get_machines_page(
    page: int,
    limit: int,
    search: str | None = None,
    machine_type: str | None = None,
    risk: str | None = None,
    sort_dir: str = "desc",
) -> tuple[list[dict[str, Any]], dict[str, int], dict[str, int]]:
    """Filter, sort, and paginate the cached dataset without recomputing it."""
    machines, summary = load_enriched_dataset()

    filtered = machines

    if machine_type:
        filtered = [
            machine for machine in filtered
            if machine["type"] == machine_type
        ]

    if risk:
        filtered = [
            machine for machine in filtered
            if risk_band_for(machine["failure_probability"]) == risk
        ]

    query = (search or "").strip().lower()
    if query:
        filtered = [
            machine
            for machine in filtered
            if query in machine["product_id"].lower()
            or query == str(machine["udi"])
        ]

    filtered = sorted(
        filtered,
        key=lambda machine: machine["failure_probability"],
        reverse=sort_dir != "asc",
    )

    total = len(filtered)
    total_pages = math.ceil(total / limit) if total else 0
    start = (page - 1) * limit
    items = filtered[start:start + limit]

    pagination = {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
    }

    return items, pagination, summary


def _bucket_index(value: float, edges: list[float]) -> int:
    """Return the bin index for a value and a list of upper edges."""
    for index, edge in enumerate(edges):
        if value < edge:
            return index
    return len(edges)


def _failure_rate_bins(
    machines: list[dict[str, Any]],
    value_getter: Callable[[dict[str, Any]], float],
    edges: list[float],
    labels: list[str],
) -> list[dict[str, Any]]:
    """Count records and actual failures for each contiguous value bin."""
    counts = [0] * len(labels)
    failures = [0] * len(labels)

    for machine in machines:
        index = _bucket_index(value_getter(machine), edges)
        counts[index] += 1
        if machine["actual_failure"]:
            failures[index] += 1

    return [
        {
            "range": labels[index],
            "count": counts[index],
            "failures": failures[index],
            "failure_rate_pct": (
                round(failures[index] / counts[index] * 100, 2)
                if counts[index]
                else 0.0
            ),
        }
        for index in range(len(labels))
    ]


def _type_failure_rate_bins(
    machines: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Count records and actual failures for each machine quality type."""
    type_labels = {
        "H": "High quality",
        "M": "Medium quality",
        "L": "Low quality",
    }
    counts = {machine_type: 0 for machine_type in type_labels}
    failures = {machine_type: 0 for machine_type in type_labels}

    for machine in machines:
        machine_type = machine["type"]
        counts[machine_type] += 1
        if machine["actual_failure"]:
            failures[machine_type] += 1

    return [
        {
            "type": machine_type,
            "label": type_labels[machine_type],
            "count": counts[machine_type],
            "failures": failures[machine_type],
            "failure_rate_pct": (
                round(failures[machine_type] / counts[machine_type] * 100, 2)
                if counts[machine_type]
                else 0.0
            ),
        }
        for machine_type in ("H", "M", "L")
    ]


def _build_failure_rate_charts(
    machines: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """Build every failure-rate chart shown on the dashboard."""

    def temperature_difference(machine: dict[str, Any]) -> float:
        return machine["process_temperature"] - machine["air_temperature"]

    return {
        "tool_wear": _failure_rate_bins(
            machines,
            lambda machine: machine["tool_wear"],
            [50, 100, 150, 200],
            ["0-50 min", "50-100 min", "100-150 min", "150-200 min", "200+ min"],
        ),
        "torque": _failure_rate_bins(
            machines,
            lambda machine: machine["torque"],
            [25, 35, 45, 55],
            ["<25 Nm", "25-35 Nm", "35-45 Nm", "45-55 Nm", "55+ Nm"],
        ),
        "rpm": _failure_rate_bins(
            machines,
            lambda machine: machine["rotational_speed"],
            [1300, 1500, 1700, 1900],
            [
                "1000-1300 rpm",
                "1300-1500 rpm",
                "1500-1700 rpm",
                "1700-1900 rpm",
                "1900+ rpm",
            ],
        ),
        "type": _type_failure_rate_bins(machines),
        "temperature_difference": _failure_rate_bins(
            machines,
            temperature_difference,
            [8.5, 9.5, 10.5, 11.5],
            ["<8.5 K", "8.5-9.5 K", "9.5-10.5 K", "10.5-11.5 K", "11.5+ K"],
        ),
    }


def _sample_scatter(
    machines: list[dict[str, Any]],
    actual_failure: int,
    limit: int = 60,
) -> list[dict[str, Any]]:
    """Take a deterministic, evenly spaced sample of torque/rpm points."""
    matches = [
        machine
        for machine in machines
        if machine["actual_failure"] == actual_failure
    ]

    if len(matches) > limit:
        step = len(matches) / limit
        matches = [matches[int(index * step)] for index in range(limit)]

    return [
        {
            "torque": machine["torque"],
            "rpm": machine["rotational_speed"],
        }
        for machine in matches
    ]


def _build_sensor_averages(
    machines: list[dict[str, Any]],
) -> dict[str, dict[str, float]]:
    """Calculate sensor averages using actual dataset outcomes."""
    sensor_fields = {
        "air_temperature": "air_temperature",
        "process_temperature": "process_temperature",
        "rotational_speed": "rotational_speed",
        "torque": "torque",
        "tool_wear": "tool_wear",
    }
    grouped_values = {0: [], 1: []}

    for machine in machines:
        grouped_values[machine["actual_failure"]].append(machine)

    averages = {}
    for outcome, label in ((0, "normal"), (1, "failed")):
        records = grouped_values[outcome]
        count = len(records)
        averages[label] = {
            output_name: (
                round(
                    sum(record[input_name] for record in records) / count,
                    2,
                )
                if count
                else 0.0
            )
            for output_name, input_name in sensor_fields.items()
        }
        averages[label]["temperature_difference"] = (
            round(
                sum(
                    record["process_temperature"]
                    - record["air_temperature"]
                    for record in records
                )
                / count,
                2,
            )
            if count
            else 0.0
        )

    return averages


def _build_dashboard_data() -> dict[str, Any]:
    """Aggregate the enriched dataset into the dashboard response."""
    machines, summary = load_enriched_dataset()

    total = summary["total"]
    actual_failures = summary["actual_failures"]

    target_distribution = [
        {
            "label": "Normal",
            "value": total - actual_failures,
            "percent": (
                round((total - actual_failures) / total * 100, 2)
                if total
                else 0.0
            ),
        },
        {
            "label": "Failure",
            "value": actual_failures,
            "percent": (
                round(actual_failures / total * 100, 2) if total else 0.0
            ),
        },
    ]

    failure_type_counts = {label: 0 for label in FAILURE_TYPE_LABELS}
    for machine in machines:
        for label in machine["actual_failure_types"]:
            failure_type_counts[label] += 1

    failure_mode_distribution = [
        {
            "mode": label,
            "label": FAILURE_MODE_LABELS[label],
            "count": failure_type_counts[label],
            "percent_of_failures": (
                round(failure_type_counts[label] / actual_failures * 100, 2)
                if actual_failures
                else 0.0
            ),
        }
        for label in FAILURE_TYPE_LABELS
    ]
    failure_mode_distribution.sort(
        key=lambda item: item["count"], reverse=True
    )

    return {
        "summary": summary,
        "target_distribution": target_distribution,
        "failure_mode_distribution": failure_mode_distribution,
        "failure_rate_charts": _build_failure_rate_charts(machines),
        "risk_distribution": {
            "bands": [
                {"band": "Low", "count": summary["low_risk"]},
                {"band": "Medium", "count": summary["medium_risk"]},
                {"band": "High", "count": summary["high_risk"]},
            ],
            "band_edges": {
                "low": RISK_BAND_MEDIUM,
                "high": RISK_BAND_HIGH,
            },
        },
        "torque_rpm_scatter": {
            "normal": _sample_scatter(machines, actual_failure=0),
            "failed": _sample_scatter(machines, actual_failure=1),
        },
        "sensor_averages_by_outcome": _build_sensor_averages(machines),
    }


def get_dashboard_data() -> dict[str, Any]:
    """Return cached dashboard aggregates built from the enriched dataset."""
    global _dashboard_data

    if _dashboard_data is not None:
        return _dashboard_data

    with _dashboard_lock:
        if _dashboard_data is not None:
            return _dashboard_data

        _dashboard_data = _build_dashboard_data()
        return _dashboard_data
