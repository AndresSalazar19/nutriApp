from pydantic import BaseModel
from app.schemas.user  import UserResponse
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
    status: str
    verified_by: uuid.UUID 