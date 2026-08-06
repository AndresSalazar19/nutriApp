import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class HydrationLogCreate(BaseModel):
    user_id: uuid.UUID
    amount_ml: int = Field(ge=50, le=3000)
    log_date: date


class CalorieLogCreate(BaseModel):
    user_id: uuid.UUID
    calories: int = Field(ge=1, le=10000)
    log_date: date


class DailyTrackingLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    metric_type: str
    amount: int
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class DailyTrackingSummary(BaseModel):
    log_date: date
    hydration_ml: int = 0
    consumed_calories: int = 0
    burned_calories: int = 0
