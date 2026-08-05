import uuid

from sqlalchemy import Column, ForeignKey, Numeric, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class NutritionPlanMeal(Base):
    __tablename__ = "nutrition_plan_meals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(
        UUID(as_uuid=True), ForeignKey("nutrition_plans.id", ondelete="CASCADE"), nullable=False
    )
    day_of_week = Column(SmallInteger, nullable=False)
    meal_type = Column(String(9), nullable=False)
    food_id = Column(UUID(as_uuid=True), ForeignKey("foods.id"), nullable=True)
    custom_food = Column(String(255), nullable=True)
    quantity_g = Column(Numeric(7, 2), nullable=True)
    instructions = Column(Text, nullable=True)

    plan = relationship("NutritionPlan", back_populates="meals")
    food = relationship("Food")
