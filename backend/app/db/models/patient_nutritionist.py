import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class PatientNutritionist(Base):
    __tablename__ = "patient_nutritionist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    nutritionist_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    is_active = Column(Boolean, default=False, nullable=False)
    assigned_at = Column(Date, nullable=False)
    ended_at = Column(Date, nullable=True)
    patient = relationship(
        "User", foreign_keys=[patient_id], back_populates="patient_relations_as_patient"
    )

    nutritionist = relationship(
        "User", foreign_keys=[nutritionist_id], back_populates="patient_relations_as_nutritionist"
    )
