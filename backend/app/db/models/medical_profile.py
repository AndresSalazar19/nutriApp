import uuid
from datetime import datetime

from sqlalchemy import ARRAY, Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class MedicalProfile(Base):
    """Read-only mapping of an existing table; no create/update flow in this app yet."""

    __tablename__ = "medical_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    gender = Column(String(6), nullable=True)
    height_cm = Column(Numeric(5, 2), nullable=True)
    weight_kg = Column(Numeric(5, 2), nullable=True)
    activity_level = Column(String(11), nullable=True)
    goal = Column(String(255), nullable=True)
    target_weight_kg = Column(Numeric(5, 2), nullable=True)
    daily_calories_goal = Column(Integer, nullable=True)
    daily_water_goal_ml = Column(Integer, nullable=True)
    allergies = Column(ARRAY(Text), nullable=True)
    medical_conditions = Column(ARRAY(Text), nullable=True)
    medications = Column(ARRAY(Text), nullable=True)
    notes = Column(Text, nullable=True)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
