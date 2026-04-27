from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.schemas.user import PersonResponse
import uuid


class PatientListItem(BaseModel):
    user_id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
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