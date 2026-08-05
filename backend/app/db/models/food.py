import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Food(Base):
    __tablename__ = "foods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    serving_size_g = Column(Numeric(7, 2), nullable=False)
    calories = Column(Numeric(7, 2), nullable=True)
    protein_g = Column(Numeric(7, 2), nullable=True)
    carbs_g = Column(Numeric(7, 2), nullable=True)
    fat_g = Column(Numeric(7, 2), nullable=True)
    fiber_g = Column(Numeric(7, 2), nullable=True)
    sugar_g = Column(Numeric(7, 2), nullable=True)
    sodium_mg = Column(Numeric(7, 2), nullable=True)
    calcium_mg = Column(Numeric(7, 2), nullable=True)
    iron_mg = Column(Numeric(7, 2), nullable=True)
    vitamin_c_mg = Column(Numeric(7, 2), nullable=True)
    is_ecuadorian = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
