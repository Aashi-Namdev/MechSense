import joblib
from pathlib import Path

# Define the base directory and model directory
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

# Load the machine failure model
failure_model = joblib.load(
    MODEL_DIR / "machine_failure_model.pkl"
)

# Load the failure type model
failure_type_model = joblib.load(
    MODEL_DIR / "failure_type_model.pkl"
)

print("Both models loaded successfully!")