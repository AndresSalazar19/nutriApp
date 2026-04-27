from sqlalchemy import Column, String, Boolean, Text, ForeignKey, DateTime, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime
import uuid
import enum


class PatientStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    at_risk = "at_risk"


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    status = Column(SQLEnum(PatientStatus), default=PatientStatus.active, nullable=False)
    priority_flag = Column(Boolean, default=False, nullable=False)
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="patient_profile")


class PatientHistory(Base):
    __tablename__ = "patient_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_profile_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False)
    entry_type = Column(String(50), nullable=False)  # e.g. "consulta", "medicion", "diagnostico"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    patient_profile = relationship("PatientProfile", backref="history_entries")