from pathlib import Path
from typing import Any

import joblib
import pandas as pd

# Model files live in ml-service/models, one level above this app package.
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
FAILURE_MODEL_PATH = MODEL_DIR / "machine_failure_model.pkl"
FAILURE_TYPE_MODEL_PATH = MODEL_DIR / "failure_type_model.pkl"

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

# Models are stored at module level so they are loaded only once per process.
failure_model = None
failure_type_model = None
model_load_error: str | None = None


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
