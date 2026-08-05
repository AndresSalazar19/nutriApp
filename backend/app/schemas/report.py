import uuid
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel

RangeKey = Literal["3m", "6m", "1y"]


class TimePointSchema(BaseModel):
    date: date
    value: float


class AppointmentSummary(BaseModel):
    id: uuid.UUID
    scheduled_at: datetime
    status: str
    modality: str

    class Config:
        from_attributes = True


class HistoryEntrySummary(BaseModel):
    id: uuid.UUID
    entry_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class PatientReportDataResponse(BaseModel):
    user_id: uuid.UUID
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    range_key: RangeKey

    weight_lost: Optional[float] = None
    weight_lost_pct: Optional[float] = None
    weight_history: list[TimePointSchema] = []

    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    blood_pressure_note: Optional[str] = None
    systolic_history: list[TimePointSchema] = []
    diastolic_history: list[TimePointSchema] = []

    clinical_notes: Optional[str] = None
    history_entries: list[HistoryEntrySummary] = []
    appointments: list[AppointmentSummary] = []


class GeneratedReportResponse(BaseModel):
    id: uuid.UUID
    file_url: str
    file_name: str
    range_key: RangeKey
    created_at: datetime

    class Config:
        from_attributes = True
