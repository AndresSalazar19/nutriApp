import uuid
from datetime import date

from pydantic import BaseModel


class WeightProgressPoint(BaseModel):
    date: date
    label: str
    value: float | None = None


class PressureProgressPoint(BaseModel):
    date: date
    label: str
    systolic: float | None = None
    diastolic: float | None = None


class WeightProgressSummary(BaseModel):
    current_kg: float | None = None
    change_kg: float | None = None
    change_percent: float | None = None


class PressureProgressSummary(BaseModel):
    systolic: int | None = None
    diastolic: int | None = None
    category: str | None = None
    measured_on: date | None = None


class ProgressResponse(BaseModel):
    user_id: uuid.UUID
    period: str
    start_date: date
    end_date: date
    weight: WeightProgressSummary
    pressure: PressureProgressSummary
    weight_series: list[WeightProgressPoint]
    pressure_series: list[PressureProgressPoint]
