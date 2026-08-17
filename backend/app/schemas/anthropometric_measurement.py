import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class AnthropometricMeasurementResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    log_date: date

    fat_percent: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    bioimpedance_file_path: Optional[str] = None

    skinfold_triceps_mm: Optional[float] = None
    skinfold_subscapular_mm: Optional[float] = None
    skinfold_suprailiac_mm: Optional[float] = None
    skinfold_abdominal_mm: Optional[float] = None
    skinfold_thigh_mm: Optional[float] = None

    circumference_waist_cm: Optional[float] = None
    circumference_hip_cm: Optional[float] = None
    circumference_arm_cm: Optional[float] = None
    circumference_thigh_cm: Optional[float] = None
    circumference_calf_cm: Optional[float] = None
    circumference_neck_cm: Optional[float] = None

    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
