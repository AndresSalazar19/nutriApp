import enum
import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Text, Time
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class AppointmentTypeModality(str, enum.Enum):
    virtual = "virtual"
    in_person = "in_person"


class AvailabilityRuleType(str, enum.Enum):
    recurring = "recurring"
    exception = "exception"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    nutritionist_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_min = Column(Integer, nullable=False, default=45)
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.scheduled, nullable=False)
    modality = Column(
        SQLEnum(AppointmentTypeModality), default=AppointmentTypeModality.virtual, nullable=False
    )
    meeting_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    cancelled_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    patient = relationship("User", foreign_keys=[patient_id])
    nutritionist = relationship("User", foreign_keys=[nutritionist_id])
    cancelled_attr = relationship("User", foreign_keys=[cancelled_by])


class AvailabilityNutritionist(Base):
    __tablename__ = "availability_nutritionist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nutritionist_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    rule_type = Column(SQLEnum(AvailabilityRuleType), nullable=False)
    day_of_week = Column(Integer, nullable=True)
    specific_date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    is_available = Column(Boolean, nullable=True, default=None)

    nutritionist = relationship("User")
