import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class AnthropometricMeasurement(Base):
    __tablename__ = "anthropometric_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    log_date = Column(Date, nullable=False)

    fat_percent = Column(Numeric(5, 2), nullable=True)
    muscle_mass_kg = Column(Numeric(5, 2), nullable=True)
    bioimpedance_file_path = Column(String(500), nullable=True)

    skinfold_triceps_mm = Column(Numeric(5, 1), nullable=True)
    skinfold_subscapular_mm = Column(Numeric(5, 1), nullable=True)
    skinfold_suprailiac_mm = Column(Numeric(5, 1), nullable=True)
    skinfold_abdominal_mm = Column(Numeric(5, 1), nullable=True)
    skinfold_thigh_mm = Column(Numeric(5, 1), nullable=True)

    circumference_waist_cm = Column(Numeric(5, 1), nullable=True)
    circumference_hip_cm = Column(Numeric(5, 1), nullable=True)
    circumference_arm_cm = Column(Numeric(5, 1), nullable=True)
    circumference_thigh_cm = Column(Numeric(5, 1), nullable=True)
    circumference_calf_cm = Column(Numeric(5, 1), nullable=True)
    circumference_neck_cm = Column(Numeric(5, 1), nullable=True)

    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
