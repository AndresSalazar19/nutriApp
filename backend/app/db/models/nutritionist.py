from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLEnum
from app.db.base import Base
import uuid
import enum

class NutritionistStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class DocumentType(str, enum.Enum):
    cv = "cv"
    senescyt = "senescyt"


class Specialty(Base):
    __tablename__ = "specialties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)

    nutritionist_profiles = relationship("NutritionistProfile", back_populates="specialty")


class NutritionistProfile(Base):
    __tablename__ = "nutritionist_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    license_number = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    specialty_id = Column(Integer, ForeignKey("specialties.id"), nullable=False)
    years_experience = Column(Integer, nullable=True)
    education = Column(Text, nullable=True)
    consultation_fee = Column(Numeric(10, 2), nullable=True)
    max_patients = Column(Integer, default=30, nullable=True)
    status = Column(SQLEnum(NutritionistStatus), default=NutritionistStatus.pending, nullable=False)
    verified_at = Column(nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="nutritionist_profile", foreign_keys=[user_id])
    specialty = relationship("Specialty", back_populates="nutritionist_profiles")
    documents = relationship("NutritionistDocument", back_populates="nutritionist", cascade="all, delete-orphan")


class NutritionistDocument(Base):
    __tablename__ = "nutritionist_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nutritionist_id = Column(UUID(as_uuid=True), ForeignKey("nutritionist_profiles.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    file_content = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), default="application/pdf", nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    nutritionist = relationship("NutritionistProfile", back_populates="documents")