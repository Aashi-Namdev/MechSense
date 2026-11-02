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
class HealthResponse(BaseModel):
    """Result returned by GET /health."""

    status: str
    models_loaded: bool
    failure_model_loaded: bool
    failure_type_model_loaded: bool
    load_error: str | None = None
