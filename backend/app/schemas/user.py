import uuid
from datetime import date

from pydantic import BaseModel, EmailStr

from app.db.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    cedula: str | None = None
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
    cedula: str | None = None
    gender: str | None = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    email_verified: bool
    avatar_url: str | None = None
    person: PersonResponse | None = None

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    email: str
    new_password: str
