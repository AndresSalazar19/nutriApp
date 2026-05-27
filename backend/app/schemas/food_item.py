from pydantic import BaseModel
from typing import Optional
import uuid

class FoodItemRequest(BaseModel):
    name: str
    category: Optional[str] = None

    calories_kcal: Optional[float] = None
    carbs_g: Optional[float] = None
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None

    calcium_mg: Optional[float] = None
    potassium_mg: Optional[float] = None
    sodium_mg: Optional[float] = None
    zinc_mg: Optional[float] = None

    vitamin_c_mg: Optional[float] = None
    vitamin_a_ug: Optional[float] = None
    folate_ug: Optional[float] = None

    serving_per_cup_g: Optional[float] = None
    serving_per_tbsp_g: Optional[float] = None
    serving_per_unit_g: Optional[float] = None


class FoodItemResponse(BaseModel):
    id: uuid.UUID

    name: str
    category: Optional[str] = None

    calories_kcal: Optional[float] = None
    carbs_g: Optional[float] = None
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None

    calcium_mg: Optional[float] = None
    potassium_mg: Optional[float] = None
    sodium_mg: Optional[float] = None
    zinc_mg: Optional[float] = None

    vitamin_c_mg: Optional[float] = None
    vitamin_a_ug: Optional[float] = None
    folate_ug: Optional[float] = None

    serving_per_cup_g: Optional[float] = None
    serving_per_tbsp_g: Optional[float] = None
    serving_per_unit_g: Optional[float] = None

    is_active: bool

    class Config:
        from_attributes = True