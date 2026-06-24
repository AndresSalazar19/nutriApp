import uuid
from typing import Literal, Optional
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse


class PatientNutritionistResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    nutritionist_id: uuid.UUID
    assigned_at: datetime
    ended_at: Optional[datetime] = None
    is_active: bool
    patient: UserResponse | None = None
    nutritionist: UserResponse | None = None

    class Config:
        from_attributes = True


class PatientNutritionistRequest(BaseModel):
    patient_id: uuid.UUID
    nutritionist_id: uuid.UUID


class PatientNutritionistQueryParams(BaseModel):
    status: Literal["active", "inactive"] | None = None
    patient_id: uuid.UUID | None = None
    nutritionist_id: uuid.UUID | None = None
