import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class BloodPressureLogCreate(BaseModel):
    user_id: uuid.UUID
    systolic: int = Field(..., ge=60, le=260)
    diastolic: int = Field(..., ge=40, le=180)
    pulse: Optional[int] = Field(default=None, ge=30, le=220)
    log_date: date
    notes: Optional[str] = None


class BloodPressureLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    systolic: int
    diastolic: int
    pulse: Optional[int] = None
    log_date: date
    measured_at: datetime
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BloodPressureStatsResponse(BaseModel):
    current_systolic: Optional[int] = None
    current_diastolic: Optional[int] = None
    avg_systolic: Optional[float] = None
    avg_diastolic: Optional[float] = None
    total_entries: int = 0
