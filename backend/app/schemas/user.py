from pydantic import BaseModel, EmailStr
from datetime import date
from app.db.models.user import UserRole
import uuid


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    phone: str | None = None
    gender: str | None = None
    role: UserRole = UserRole.patient

class UserRequest(BaseModel):
    email: EmailStr
    password: str

class PersonResponse(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    phone: str | None = None
    avatar_url: str | None = None
    cedula: str | None = None
    gender : str | None = None

    class Config:
        from_attributes = True
        
class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    email_verified: bool
    person: PersonResponse | None = None

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    email: str
    new_password: str