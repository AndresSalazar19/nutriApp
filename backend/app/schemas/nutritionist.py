from pydantic import BaseModel
from app.db.models.nutritionist import NutritionistStatus
from app.db.models.user import GenderEnum
from app.schemas.user  import UserResponse
from typing import Literal
from app.schemas.catalog import SpecialistResponse
import uuid

class NutritionistProfileResponse(BaseModel):
    id: uuid.UUID
    license_number: str
    bio: str | None = None
    specialty_id: int
    years_experience: int | None = None
    education: str | None = None
    consultation_fee: float | None = None
    max_patients: int | None = None
    status: str
    user: UserResponse | None = None
    specialty: SpecialistResponse | None = None

    class Config:
        from_attributes = True

class NutritionistStatusUpdate(BaseModel):
    status: Literal[NutritionistStatus.verified, NutritionistStatus.rejected]
    verified_by: uuid.UUID

class NutritionistCreateRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    cedula: str | None = None
    date_of_birth: str | None = None
    gender: GenderEnum | None = None
    phone: str | None = None
    specialty_id: int
    years_experience: int | None = None
    license_number: str | None = None