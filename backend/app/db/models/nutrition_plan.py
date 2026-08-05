import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class NutritionPlanStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    nutritionist_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_ai_generated = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=False)
    status = Column(
        SQLEnum(NutritionPlanStatus, native_enum=False, length=20),
        nullable=False,
        default=NutritionPlanStatus.pending,
    )
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    patient_notes = Column(Text, nullable=True)
    source_image_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("User", foreign_keys=[patient_id])
    nutritionist = relationship("User", foreign_keys=[nutritionist_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    meals = relationship("NutritionPlanMeal", back_populates="plan", cascade="all, delete-orphan")
