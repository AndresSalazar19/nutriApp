import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.user import PersonResponse


class PatientListItem(BaseModel):
    user_id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str = "active"
    priority_flag: bool = False

    class Config:
        from_attributes = True


class PatientDetailResponse(BaseModel):
    user_id: uuid.UUID
    email: str
    person: Optional[PersonResponse] = None
    status: str = "active"
    priority_flag: bool = False
    clinical_notes: Optional[str] = None
    height_m: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    hypertension_diagnosed: bool = False
    medications: list[str] = []
    allergies: list[str] = []
    dietary_restrictions: list[str] = []

    class Config:
        from_attributes = True


class HistoryEntry(BaseModel):
    id: uuid.UUID
    entry_type: str
    description: str
    created_at: datetime
    created_by: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class NotesUpdate(BaseModel):
    clinical_notes: str


class FlagUpdate(BaseModel):
    priority_flag: bool


class StatusUpdate(BaseModel):
    status: str  # "active", "inactive", "at_risk"


class PatientAnthropometricUpdate(BaseModel):
    log_date: date
    weight_kg: Optional[float] = Field(default=None, ge=20, le=500)
    height_m: Optional[float] = Field(default=None, ge=0.5, le=2.5)
    notes: Optional[str] = None

    @model_validator(mode="after")
    def require_at_least_one_measurement(self):
        if self.weight_kg is None and self.height_m is None:
            raise ValueError("Debes registrar al menos el peso o la estatura")
        return self


class PatientHealthUpdate(BaseModel):
    height_m: float = Field(ge=0.5, le=2.5)
    weight_kg: float = Field(ge=20, le=500)
    systolic: int = Field(ge=60, le=260)
    diastolic: int = Field(ge=30, le=160)
    hypertension_diagnosed: bool = False
    medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    dietary_restrictions: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_pressure(self):
        if self.diastolic >= self.systolic:
            raise ValueError("La presion diastolica debe ser menor que la sistolica")
        return self
