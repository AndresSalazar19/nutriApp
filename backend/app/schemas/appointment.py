import uuid
from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel

from app.db.models.appointment import (
    AppointmentStatus,
    AppointmentTypeModality,
    AvailabilityRuleType,
)
from app.schemas.nutritionist import NutritionistProfileResponse
from app.schemas.user import UserResponse


class AppointmentRequest(BaseModel):
    patient_id: uuid.UUID
    nutritionist_id: uuid.UUID
    scheduled_at: datetime
    duration_min: int = 45
    modality: AppointmentTypeModality = AppointmentTypeModality.virtual
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    nutritionist_id: uuid.UUID
    scheduled_at: datetime
    duration_min: int
    status: AppointmentStatus
    modality: AppointmentTypeModality
    meeting_url: str | None = None
    notes: str | None = None
    cancelled_by: uuid.UUID | None = None
    cancelled_at: str | None = None

    patient: UserResponse
    nutritionist: UserResponse

    class Config:
        from_attributes = True


class AppointmentUpdateRequest(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_min: Optional[int] = None
    modality: Optional[AppointmentTypeModality] = None
    notes: Optional[str] = None


class AvailabilityNutritionistRequest(BaseModel):
    rule_type: AvailabilityRuleType
    day_of_week: int
    specific_date: date
    start_time: time
    end_time: time
    is_available: bool = True


class AvailabilityNutritionistResponse(BaseModel):
    id: uuid.UUID
    nutritionist_id: uuid.UUID
    rule_type: AvailabilityRuleType
    day_of_week: int | None = None
    specific_date: date | None = None
    start_time: time
    end_time: time
    is_available: bool
    nutritionist: NutritionistProfileResponse

    class Config:
        from_attributes = True
