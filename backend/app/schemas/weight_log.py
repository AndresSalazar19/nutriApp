import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class WeightLogCreate(BaseModel):
    user_id: uuid.UUID
    weight_kg: float
    log_date: date
    notes: Optional[str] = None


class WeightLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    weight_kg: float
    log_date: date
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WeightStatsResponse(BaseModel):
    current_weight: Optional[float] = None
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None
    total_entries: int = 0
    weight_change: Optional[float] = None
