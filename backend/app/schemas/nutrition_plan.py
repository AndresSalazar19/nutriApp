import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator

VALID_MEAL_TYPES = {"breakfast", "lunch", "dinner", "snack"}


class NutritionPlanMealResponse(BaseModel):
    id: uuid.UUID
    day_of_week: int
    meal_type: str
    food_id: Optional[uuid.UUID] = None
    food_name: Optional[str] = None
    custom_food: Optional[str] = None
    quantity_g: Optional[float] = None
    instructions: Optional[str] = None

    class Config:
        from_attributes = True


class NutritionPlanResponse(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    nutritionist_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_ai_generated: bool
    is_active: bool
    status: str
    reviewed_by: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    patient_notes: Optional[str] = None
    source_image_path: Optional[str] = None
    created_at: datetime
    meals: list[NutritionPlanMealResponse] = []

    class Config:
        from_attributes = True


class NutritionPlanRejectRequest(BaseModel):
    reason: str


class NutritionPlanMealCreate(BaseModel):
    day_of_week: int = Field(ge=1, le=7)
    meal_type: str
    food_id: Optional[uuid.UUID] = None
    custom_food: Optional[str] = None
    quantity_g: Optional[float] = Field(default=None, gt=0)
    instructions: Optional[str] = None

    @model_validator(mode="after")
    def validate_meal(self):
        if self.meal_type not in VALID_MEAL_TYPES:
            raise ValueError(f"meal_type debe ser uno de: {', '.join(sorted(VALID_MEAL_TYPES))}")
        if bool(self.food_id) == bool(self.custom_food):
            raise ValueError("Debes indicar food_id o custom_food, pero no ambos")
        return self


class NutritionPlanCreate(BaseModel):
    patient_id: uuid.UUID
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    meals: list[NutritionPlanMealCreate] = Field(min_length=1)
