import enum
import uuid

from sqlalchemy import Boolean, Column, Date, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    patient = "patient"
    nutritionist = "nutritionist"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.patient, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)

    person = relationship(
        "Person", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    nutritionist_profile = relationship(
        "NutritionistProfile", back_populates="user", foreign_keys="NutritionistProfile.user_id"
    )

    patient_relations_as_patient = relationship(
        "PatientNutritionist",
        foreign_keys="PatientNutritionist.patient_id",
        back_populates="patient",
    )

    patient_relations_as_nutritionist = relationship(
        "PatientNutritionist",
        foreign_keys="PatientNutritionist.nutritionist_id",
        back_populates="nutritionist",
    )


class GenderEnum(str, enum.Enum):
    masculino = "masculino"
    femenino = "femenino"


class Person(Base):
    __tablename__ = "persons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    cedula = Column(String(20), nullable=True, unique=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(SQLEnum(GenderEnum), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)

    user = relationship("User", back_populates="person")
