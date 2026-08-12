import uuid
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator

from app.schemas.anthropometric_measurement import AnthropometricMeasurementResponse
from app.schemas.user import PersonResponse

ActivityLevel = Literal["sedentario", "moderado", "pesado"]
FoodFrequency = Literal["daily", "3_5_week", "1_2_week", "rare", "never"]


class WeightHistoryPoint(BaseModel):
    log_date: date
    weight_kg: float


class PatientListItem(BaseModel):
    user_id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str = "active"
    priority_flag: bool = False

    class Config:
        from_attributes = True


class PatientDetailResponse(BaseModel):
    user_id: uuid.UUID
    email: str
    person: Optional[PersonResponse] = None
    status: str = "active"
    priority_flag: bool = False
    clinical_notes: Optional[str] = None
    height_m: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    hypertension_diagnosed: bool = False
    medications: list[str] = []
    allergies: list[str] = []
    dietary_restrictions: list[str] = []
    activity_level: Optional[ActivityLevel] = None
    clinical_history: dict = Field(default_factory=dict)
    weight_history: list[WeightHistoryPoint] = []
    latest_measurement: Optional[AnthropometricMeasurementResponse] = None

    class Config:
        from_attributes = True


class HistoryEntry(BaseModel):
    id: uuid.UUID
    entry_type: str
    description: str
    created_at: datetime
    created_by: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class NotesUpdate(BaseModel):
    clinical_notes: str


class FlagUpdate(BaseModel):
    priority_flag: bool


class StatusUpdate(BaseModel):
    status: str  # "active", "inactive", "at_risk"


class PatientAnthropometricUpdate(BaseModel):
    log_date: date
    weight_kg: Optional[float] = Field(default=None, ge=20, le=500)
    height_m: Optional[float] = Field(default=None, ge=0.5, le=2.5)
    notes: Optional[str] = None

    @model_validator(mode="after")
    def require_at_least_one_measurement(self):
        if self.weight_kg is None and self.height_m is None:
            raise ValueError("Debes registrar al menos el peso o la estatura")
        return self


class PatientHealthUpdate(BaseModel):
    height_m: float = Field(ge=0.5, le=2.5)
    weight_kg: float = Field(ge=20, le=300)
    systolic: int = Field(ge=70, le=250)
    diastolic: int = Field(ge=40, le=150)
    hypertension_diagnosed: bool = False
    activity_level: ActivityLevel
    medications: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    dietary_restrictions: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_pressure(self):
        if self.diastolic >= self.systolic:
            raise ValueError("La presion diastolica debe ser menor que la sistolica")
        return self


class DigestiveIssues(BaseModel):
    constipation: bool = False
    diarrhea: bool = False
    reflux: bool = False
    bloating: bool = False
    nausea: bool = False


class FamilyHistory(BaseModel):
    diabetes: bool = False
    hypertension: bool = False
    obesity: bool = False
    cardiovascular_disease: bool = False
    cancer: bool = False
    kidney_disease: bool = False
    eating_disorders: bool = False


class PatientPathologicalHistoryUpdate(BaseModel):
    """Antecedentes personales patologicos + antecedentes familiares (paso 2 del onboarding)."""

    conditions: list[str] = Field(default_factory=list)
    other_condition: Optional[str] = None
    hospitalized: bool
    hospitalized_detail: Optional[str] = None
    has_food_allergies: bool
    food_allergies: list[str] = Field(default_factory=list)
    has_food_intolerances: bool
    food_intolerances: list[str] = Field(default_factory=list)
    has_digestive_issues: bool
    digestive_issues: DigestiveIssues = Field(default_factory=DigestiveIssues)
    takes_medications: bool
    current_medications: list[str] = Field(default_factory=list)
    takes_supplements: bool
    supplements: list[str] = Field(default_factory=list)
    has_surgeries: bool
    surgeries_detail: Optional[str] = None
    family_history: FamilyHistory = Field(default_factory=FamilyHistory)


class FoodFrequencyEntry(BaseModel):
    fruits: FoodFrequency
    vegetables: FoodFrequency
    dairy: FoodFrequency
    meat: FoodFrequency
    cold_cuts: FoodFrequency
    fast_food: FoodFrequency
    sweets: FoodFrequency
    snacks: FoodFrequency
    coffee: FoodFrequency
    energy_drinks: FoodFrequency


class PatientDietaryHistoryUpdate(BaseModel):
    """Historia alimentaria: habitos generales + frecuencia de consumo (paso 3 del onboarding)."""

    meals_per_day: Optional[int] = Field(default=None, ge=1, le=10)
    skips_meals: bool
    meal_preparer: Optional[str] = None
    eats_out_frequently: bool
    appetite: Optional[str] = None
    eats_from_emotions: bool
    frequent_cravings: bool
    water_glasses_per_day: Optional[int] = Field(default=None, ge=0, le=30)
    drinks_sugary_beverages: bool
    drinks_alcohol: bool
    smokes: bool
    food_frequency: FoodFrequencyEntry
