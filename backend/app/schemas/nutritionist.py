import uuid
from typing import Literal

from pydantic import BaseModel

from app.db.models.nutritionist import NutritionistStatus
from app.db.models.user import GenderEnum
from app.schemas.appointment import AvailabilityNutritionistResponse
from app.schemas.catalog import SpecialistResponse
from app.schemas.user import UserResponse


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


class NutritionistDocumentCreate(BaseModel):
    document_type: str  # "cv" o "senescyt"
    file_path: str
    file_name: str
    file_size: int
    mime_type: str = "application/pdf"


class NutritionistDocumentsResponse(BaseModel):
    cv_url: str | None = None
    senescyt_url: str | None = None

    class Config:
        from_attributes = True


class NutritionistDocumentResponse(BaseModel):
    id: uuid.UUID
    document_type: str
    file_path: str
    file_name: str | None = None
    file_size: int | None = None
    mime_type: str | None = None
    is_verified: bool

    class Config:
        from_attributes = True


class NutritionistProfileDetailResponse(BaseModel):
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

    documents: list[NutritionistDocumentResponse] = []
    availabilities: list[AvailabilityNutritionistResponse] = []

    class Config:
        from_attributes = True
