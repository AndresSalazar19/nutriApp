import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class PatientStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    at_risk = "at_risk"


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    status = Column(SQLEnum(PatientStatus), default=PatientStatus.active, nullable=False)
    priority_flag = Column(Boolean, default=False, nullable=False)
    clinical_notes = Column(Text, nullable=True)
    height_m = Column(Float, nullable=True)
    hypertension_diagnosed = Column(Boolean, nullable=False, default=False)
    systolic = Column(Integer, nullable=True)
    diastolic = Column(Integer, nullable=True)
    medications = Column(JSON, nullable=False, default=list)
    allergies = Column(JSON, nullable=False, default=list)
    dietary_restrictions = Column(JSON, nullable=False, default=list)
    activity_level = Column(String(20), nullable=True)  # "sedentario" | "moderado" | "pesado"
    # Historia clinica extendida del onboarding (antecedentes personales,
    # familiares e historia alimentaria). Se guarda como JSON en vez de
    # columnas individuales porque son ~40 campos anidados que solo se leen
    # de vuelta en el perfil del paciente, nunca se filtran/consultan por
    # sub-campo -- una tabla con 40 columnas no aportaria nada aqui.
    clinical_history = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="patient_profile")


class PatientHistory(Base):
    __tablename__ = "patient_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_profile_id = Column(
        UUID(as_uuid=True), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False
    )
    entry_type = Column(String(50), nullable=False)  # e.g. "consulta", "medicion", "diagnostico"
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    patient_profile = relationship("PatientProfile", backref="history_entries")
