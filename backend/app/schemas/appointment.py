import uuid
from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.db.models.appointment import (
    AppointmentStatus,
    AppointmentTypeModality,
    AvailabilityRuleType,
)
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
    cancelled_at: Optional[datetime] = None

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
    day_of_week: int | None = None
    specific_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    is_available: bool | None = None

    @model_validator(mode="after")
    def validate_data(self):

        if self.rule_type == AvailabilityRuleType.recurring:
            if self.day_of_week is None:
                raise ValueError("day_of_week es requerido para reglas recurrentes")
            if self.start_time is None or self.end_time is None:
                raise ValueError("start_time y end_time son requeridos para reglas recurrentes")
            if self.start_time >= self.end_time:
                raise ValueError("La hora de inicio debe ser menor que la hora fin")

        if self.rule_type == AvailabilityRuleType.exception:
            if self.specific_date is None:
                raise ValueError("specific_date es requerido para excepciones")

            if self.start_time is not None or self.end_time is not None:
                if self.start_time is None or self.end_time is None:
                    raise ValueError(
                        "Para excepciones con override, ambos start_time y end_time son requeridos"
                    )
                if self.start_time >= self.end_time:
                    raise ValueError("La hora de inicio debe ser menor que la hora fin")

        return self


class AvailabilityNutritionistResponse(BaseModel):
    id: uuid.UUID
    nutritionist_id: uuid.UUID
    rule_type: AvailabilityRuleType
    day_of_week: int | None = None
    specific_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    is_available: bool | None = None
    nutritionist: UserResponse

    class Config:
        from_attributes = True


class AvailabilityCalendarBlock(BaseModel):
    id: uuid.UUID
    nutritionist_id: uuid.UUID
    rule_type: AvailabilityRuleType
    day_of_week: int | None = None
    specific_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    is_available: bool | None = None

    class Config:
        from_attributes = True


class AvailabilityCalendarResponse(BaseModel):
    week_start: date
    days: dict[str, list[AvailabilityCalendarBlock]] = Field(default_factory=dict)
    exceptions: list[AvailabilityCalendarBlock] = Field(default_factory=list)
