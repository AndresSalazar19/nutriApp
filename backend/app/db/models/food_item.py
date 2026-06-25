import uuid

from sqlalchemy import Boolean, Column, DateTime, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Basic Information
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)

    # Nutritional Values
    calories_kcal = Column(Numeric(10, 2), nullable=True)
    carbs_g = Column(Numeric(10, 2), nullable=True)
    protein_g = Column(Numeric(10, 2), nullable=True)
    fat_g = Column(Numeric(10, 2), nullable=True)

    # Minerals
    calcium_mg = Column(Numeric(10, 2), nullable=True)
    potassium_mg = Column(Numeric(10, 2), nullable=True)
    sodium_mg = Column(Numeric(10, 2), nullable=True)
    zinc_mg = Column(Numeric(10, 2), nullable=True)

    # Vitamins
    vitamin_c_mg = Column(Numeric(10, 2), nullable=True)
    vitamin_a_ug = Column(Numeric(10, 2), nullable=True)
    folate_ug = Column(Numeric(10, 2), nullable=True)

    # Serving Sizes
    serving_per_cup_g = Column(Numeric(10, 2), nullable=True)
    serving_per_tbsp_g = Column(Numeric(10, 2), nullable=True)
    serving_per_unit_g = Column(Numeric(10, 2), nullable=True)

    # Audit Fields
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
