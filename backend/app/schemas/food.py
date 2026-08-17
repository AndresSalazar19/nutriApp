import uuid
from typing import Optional

from pydantic import BaseModel


class FoodPickerResponse(BaseModel):
    id: uuid.UUID
    name: str
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    sodium_mg: Optional[float] = None

    class Config:
        from_attributes = True
