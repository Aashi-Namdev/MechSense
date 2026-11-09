from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

MachineType = Literal["L", "M", "H"]
FailureType = Literal["TWF", "HDF", "PWF", "OSF", "RNF"]

class SensorReading(BaseModel):
    """One set of sensor readings sent to POST /predict."""

    # populate_by_name=True lets clients use either the field name or the alias.
    model_config = ConfigDict(
        populate_by_name=True,
        extra="forbid",
        json_schema_extra={
            "example": {
                "type": "L",
                "airTemp": 298.1,
                "processTemp": 308.6,
                "rpm": 1551,
                "torque": 42.8,
                "toolWear": 0,
            }
        },
    )

    machine_type: MachineType = Field(
        ...,
        alias="type",
        description="Machine quality type: L, M or H.",
    )
    air_temperature: float = Field(
        ...,
        alias="airTemp",
        ge=250,
        le=350,
        description="Air temperature in Kelvin.",
    )
    process_temperature: float = Field(
        ...,
        alias="processTemp",
        ge=250,
        le=400,
        description="Process temperature in Kelvin.",
    )
    rotational_speed: float = Field(
        ...,
        alias="rpm",
        gt=0,
        le=10000,
        description="Rotational speed in rpm.",
    )
    torque: float = Field(
        ...,
        alias="torque",
        ge=0,
        le=1000,
        description="Torque in Newton-metres.",
    )
    tool_wear: float = Field(
        ...,
        alias="toolWear",
        ge=0,
        le=2000,
        description="Tool wear in minutes.",
    )

    @field_validator("machine_type", mode="before")
    @classmethod
    def normalise_machine_type(cls, value: object) -> object:
        """Accept lower-case machine types such as 'l' as well as 'L'."""
        if isinstance(value, str):
            return value.strip().upper()
        return value

    @model_validator(mode="after")
    def check_temperatures(self) -> "SensorReading":
        """Process temperature should not be lower than air temperature."""
        if self.process_temperature < self.air_temperature:
            raise ValueError(
                "processTemp must be greater than or equal to airTemp"
            )
        return self

class PredictionResponse(BaseModel):
    """Result returned by POST /predict."""

    failure_probability: float = Field(
        ...,
        ge=0,
        le=1,
        description="Stage-1 probability that the machine will fail.",
    )
    predicted_failure: bool = Field(
        ...,
        description="True when probability is greater than or equal to the threshold.",
    )
    threshold: float = Field(
        ...,
        description="Failure classification threshold used by the service.",
    )
    temperature_difference: float = Field(
        ...,
        description="Engineered feature: process temperature minus air temperature.",
    )
    failure_types: list[FailureType] = Field(
        default_factory=list,
        description="Stage-2 failure types above 0.50, most likely first.",
    )
    failure_type_probabilities: dict[FailureType, float] = Field(
        default_factory=dict,
        description="Stage-2 probability for each failure type.",
    )
class MachineRecord(BaseModel):
    """One enriched AI4I dataset record with actual labels and predictions."""

    udi: int = Field(..., description="Stable dataset record identifier.")
    product_id: str
    type: MachineType
    air_temperature: float
    process_temperature: float
    rotational_speed: int
    torque: float
    tool_wear: int
    actual_failure: int = Field(
        ...,
        description="Actual Machine failure label from the CSV (1 = failure).",
    )
    actual_failure_types: list[FailureType] = Field(
        default_factory=list,
        description="Actual failure types recorded in the CSV.",
    )
    failure_probability: float = Field(
        ...,
        ge=0,
        le=1,
        description="Stage-1 model probability for this record.",
    )
    predicted_failure: bool = Field(
        ...,
        description="Stage-1 model decision at the 0.40 threshold.",
    )
    predicted_failure_types: list[FailureType] = Field(
        default_factory=list,
        description="Stage-2 failure types above 0.50, most likely first.",
    )
    failure_type_probabilities: dict[FailureType, float] = Field(
        default_factory=dict,
        description="Stage-2 probabilities, only for predicted failures.",
    )


class PaginationMeta(BaseModel):
    """Pagination details for GET /machines."""

    page: int
    limit: int
    total: int
    total_pages: int


class DatasetSummary(BaseModel):
    """Dataset-wide counts so the UI can summarise all records, not one page."""

    total: int
    actual_failures: int
    predicted_failures: int
    high_risk: int
    medium_risk: int
    low_risk: int


class MachinesResponse(BaseModel):
    """Paginated enriched dataset returned by GET /machines."""

    items: list[MachineRecord]
    pagination: PaginationMeta
    summary: DatasetSummary


class TargetDistributionItem(BaseModel):
    """One slice of the actual Normal vs Failure distribution."""

    label: Literal["Normal", "Failure"]
    value: int
    percent: float


class FailureModeItem(BaseModel):
    """Actual failure-type count from the dataset labels."""

    mode: FailureType
    label: str
    count: int
    percent_of_failures: float


class FailureRateBin(BaseModel):
    """Record count and actual failure rate for one sensor range."""

    range: str
    count: int
    failures: int
    failure_rate_pct: float


class TypeFailureRateBin(BaseModel):
    """Failure-rate bin for one machine quality type."""

    type: MachineType
    label: str
    count: int
    failures: int
    failure_rate_pct: float


class FailureRateCharts(BaseModel):
    """Failure-rate series for every sensor breakdown on the dashboard."""

    tool_wear: list[FailureRateBin]
    torque: list[FailureRateBin]
    rpm: list[FailureRateBin]
    type: list[TypeFailureRateBin]
    temperature_difference: list[FailureRateBin]


class RiskBandItem(BaseModel):
    """Count of records in one predicted risk band."""

    band: Literal["Low", "Medium", "High"]
    count: int


class RiskDistribution(BaseModel):
    """Predicted risk distribution and the band edges used by the UI."""

    bands: list[RiskBandItem]
    band_edges: dict[str, float]


class ScatterPoint(BaseModel):
    """One torque/rotational-speed point in the scatter chart."""

    torque: float
    rpm: int


class TorqueRpmScatter(BaseModel):
    """Actual normal and failed torque/rpm samples."""

    normal: list[ScatterPoint]
    failed: list[ScatterPoint]


class SensorAverages(BaseModel):
    """Actual sensor averages grouped by the dataset outcome."""

    air_temperature: float
    process_temperature: float
    rotational_speed: float
    torque: float
    tool_wear: float
    temperature_difference: float


class SensorAveragesByOutcome(BaseModel):
    """Actual sensor averages for normal and failed records."""

    normal: SensorAverages
    failed: SensorAverages


class DashboardResponse(BaseModel):
    """Aggregated dataset and prediction data returned by GET /dashboard."""

    summary: DatasetSummary
    target_distribution: list[TargetDistributionItem]
    failure_mode_distribution: list[FailureModeItem]
    failure_rate_charts: FailureRateCharts
    risk_distribution: RiskDistribution
    torque_rpm_scatter: TorqueRpmScatter
    sensor_averages_by_outcome: SensorAveragesByOutcome


class HealthResponse(BaseModel):
    """Result returned by GET /health."""

    status: str
    models_loaded: bool
    failure_model_loaded: bool
    failure_type_model_loaded: bool
    load_error: str | None = None
    dataset_loaded: bool | None = None
    dataset_records: int | None = None
    dataset_error: str | None = None
