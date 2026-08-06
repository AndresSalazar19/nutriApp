import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ConsentType(str, enum.Enum):
    nutritionist_platform_terms = "nutritionist_platform_terms"
    patient_informed_consent = "patient_informed_consent"


class UserConsent(Base):
    """An acceptance event: append-only, never updated in place.

    Re-accepting (e.g. after a version bump) inserts a new row rather than
    mutating the previous one — the clinical-history requirement is an
    immutable audit trail, not just a "has accepted" flag.
    """

    __tablename__ = "user_consents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consent_type = Column(SQLEnum(ConsentType, native_enum=False, length=40), nullable=False)
    version = Column(String(20), nullable=False)
    accepted_items = Column(JSON, nullable=False)
    signature_name = Column(String(200), nullable=False)
    accepted_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User")
