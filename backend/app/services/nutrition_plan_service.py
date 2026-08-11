import base64
import os
import re
import uuid
from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.ai.prompts import Prompts
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.food import Food
from app.db.models.medical_profile import MedicalProfile
from app.db.models.nutrition_plan import NutritionPlan, NutritionPlanStatus
from app.db.models.nutrition_plan_meal import NutritionPlanMeal
from app.db.models.patient_nutritionist import PatientNutritionist
from app.db.models.user import User
from app.services.nutrition_plan_helpers import AIPlanParseError, parse_ai_plan_response
from app.services.openai_service import OpenAIService

_UPLOAD_DIR = "uploads/meal_plans"
_MAX_IMAGE_BYTES = 8 * 1024 * 1024
_EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
_FOOD_CATALOG_LIMIT = 150

# Avoids N+1 lazy-loading: without this, rendering a list of plans triggers a
# separate query per plan for patient/patient.person, one per plan for its
# meals, and one per meal for its food — dozens of extra round-trips against
# the remote dev DB for even a handful of pending plans.
_PLAN_EAGER_OPTIONS = (
    joinedload(NutritionPlan.patient).joinedload(User.person),
    selectinload(NutritionPlan.meals).joinedload(NutritionPlanMeal.food),
)


class NutritionPlanService:

    @staticmethod
    def _save_image(file: UploadFile) -> str:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise ValueError("Solo se permiten imágenes JPG/PNG/WEBP")

        raw = file.file.read()
        if not raw:
            raise ValueError("La imagen está vacía")
        if len(raw) > _MAX_IMAGE_BYTES:
            raise ValueError("La imagen supera el tamaño máximo permitido (8MB)")

        _, extension = os.path.splitext(file.filename or "")
        if not extension:
            extension = _EXTENSION_BY_CONTENT_TYPE.get(file.content_type, "")
        if not extension:
            raise ValueError("Tipo de imagen no soportado")

        os.makedirs(_UPLOAD_DIR, exist_ok=True)
        file_path = f"{_UPLOAD_DIR}/{uuid.uuid4()}{extension}"
        with open(file_path, "wb") as f:
            f.write(raw)

        return file_path

    @staticmethod
    def _select_candidate_foods(
        db: Session, text: str, limit: int = _FOOD_CATALOG_LIMIT
    ) -> list[Food]:
        keywords = re.findall(r"[a-zA-Záéíóúñ]{4,}", text.lower())
        query = db.query(Food).filter(Food.is_verified.is_(True))

        conditions = []
        for kw in keywords[:8]:
            conditions.append(Food.category.ilike(f"%{kw}%"))
            conditions.append(Food.name.ilike(f"%{kw}%"))

        if conditions:
            matched = query.filter(or_(*conditions)).limit(limit).all()
            if matched:
                return matched

        return query.order_by(Food.name.asc()).limit(limit).all()

    @staticmethod
    def _build_foods_catalog_text(foods: list[Food]) -> str:
        return "\n".join(
            f"- id={food.id} | {food.name} | {food.category or 'sin categoría'} | "
            f"{food.calories or 0} kcal | proteína {food.protein_g or 0}g | "
            f"carbohidratos {food.carbs_g or 0}g | grasa {food.fat_g or 0}g"
            for food in foods
        )

    @staticmethod
    def _build_medical_context(profile: Optional[MedicalProfile]) -> Optional[str]:
        if not profile:
            return None

        parts = []
        if profile.allergies:
            parts.append(f"Alergias: {', '.join(profile.allergies)}")
        if profile.medical_conditions:
            parts.append(f"Condiciones médicas: {', '.join(profile.medical_conditions)}")
        if profile.goal:
            parts.append(f"Objetivo: {profile.goal}")
        if profile.daily_calories_goal:
            parts.append(f"Meta calórica diaria: {profile.daily_calories_goal} kcal")

        return "\n".join(f"- {p}" for p in parts) if parts else None

    @classmethod
    def create_plan(
        cls,
        db: Session,
        *,
        patient_id: uuid.UUID,
        nutritionist_id: Optional[uuid.UUID],
        title: str,
        description: Optional[str],
        start_date: date,
        end_date: Optional[date],
        meals: list[dict],
        is_ai_generated: bool,
        status: NutritionPlanStatus,
        is_active: bool,
        reviewed_by: Optional[uuid.UUID] = None,
        patient_notes: Optional[str] = None,
        source_image_path: Optional[str] = None,
    ) -> NutritionPlan:
        """Persists a plan + its meals. Shared by the AI-generation flow and manual creation."""
        plan = NutritionPlan(
            patient_id=patient_id,
            nutritionist_id=nutritionist_id,
            title=title,
            description=description,
            start_date=start_date,
            end_date=end_date,
            is_ai_generated=is_ai_generated,
            is_active=is_active,
            status=status,
            patient_notes=patient_notes,
            source_image_path=source_image_path,
            reviewed_by=reviewed_by,
            reviewed_at=datetime.utcnow() if reviewed_by else None,
        )
        db.add(plan)
        db.flush()

        for meal in meals:
            db.add(
                NutritionPlanMeal(
                    plan_id=plan.id,
                    day_of_week=meal["day_of_week"],
                    meal_type=meal["meal_type"],
                    food_id=meal.get("food_id"),
                    custom_food=meal.get("custom_food"),
                    quantity_g=meal.get("quantity_g"),
                    instructions=meal.get("instructions"),
                )
            )

        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def search_foods(db: Session, search: Optional[str], limit: int = 30) -> list[Food]:
        query = db.query(Food)
        if search:
            query = query.filter(Food.name.ilike(f"%{search}%"))
        return query.order_by(Food.name.asc()).limit(limit).all()

    @classmethod
    async def generate_from_request(
        cls, db: Session, patient: User, text: str, image: UploadFile
    ) -> NutritionPlan:
        image_path = cls._save_image(image)

        candidate_foods = cls._select_candidate_foods(db, text)
        if not candidate_foods:
            raise ValueError("No hay alimentos disponibles en el catálogo para generar un plan")

        medical_profile = (
            db.query(MedicalProfile).filter(MedicalProfile.user_id == patient.id).first()
        )

        prompt = Prompts.build_meal_plan_prompt(
            foods_catalog=cls._build_foods_catalog_text(candidate_foods),
            medical_context=cls._build_medical_context(medical_profile),
        )

        with open(image_path, "rb") as f:
            image_base64 = base64.b64encode(f.read()).decode()

        raw_response = await OpenAIService.get_vision_response(
            prompt=prompt,
            message_text=text,
            image_base64=image_base64,
            image_mime=image.content_type,
        )

        valid_food_ids = {str(food.id) for food in candidate_foods}
        parsed = parse_ai_plan_response(raw_response, valid_food_ids)

        if not parsed["meals"]:
            raise AIPlanParseError("La IA no generó comidas válidas para este plan")

        active_relation = (
            db.query(PatientNutritionist)
            .filter(
                PatientNutritionist.patient_id == patient.id,
                PatientNutritionist.is_active.is_(True),
            )
            .first()
        )

        today = date.today()
        plan = cls.create_plan(
            db,
            patient_id=patient.id,
            nutritionist_id=active_relation.nutritionist_id if active_relation else None,
            title=parsed["title"],
            description=parsed["summary"],
            start_date=today,
            end_date=today + timedelta(days=6),
            meals=parsed["meals"],
            is_ai_generated=True,
            status=NutritionPlanStatus.pending,
            is_active=False,
            patient_notes=text,
            source_image_path=image_path,
        )

        if parsed["blood_pressure"]:
            bp = parsed["blood_pressure"]
            db.add(
                BloodPressureLog(
                    user_id=patient.id,
                    systolic=bp["systolic"],
                    diastolic=bp["diastolic"],
                    pulse=bp["pulse"],
                    log_date=today,
                    notes="Extraído automáticamente de una solicitud de plan alimenticio con IA",
                )
            )
            db.commit()

        return plan

    @staticmethod
    def approve(db: Session, plan_id: uuid.UUID, nutritionist: User) -> Optional[NutritionPlan]:
        plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id).first()
        if not plan:
            return None

        plan.status = NutritionPlanStatus.approved
        plan.is_active = True
        plan.reviewed_by = nutritionist.id
        plan.reviewed_at = datetime.utcnow()
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def reject(
        db: Session, plan_id: uuid.UUID, nutritionist: User, reason: str
    ) -> Optional[NutritionPlan]:
        plan = db.query(NutritionPlan).filter(NutritionPlan.id == plan_id).first()
        if not plan:
            return None

        plan.status = NutritionPlanStatus.rejected
        plan.is_active = False
        plan.reviewed_by = nutritionist.id
        plan.reviewed_at = datetime.utcnow()
        plan.rejection_reason = reason
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def list_for_patient(db: Session, patient_id: uuid.UUID) -> list[NutritionPlan]:
        return (
            db.query(NutritionPlan)
            .options(*_PLAN_EAGER_OPTIONS)
            .filter(NutritionPlan.patient_id == patient_id)
            .order_by(NutritionPlan.created_at.desc())
            .all()
        )

    @staticmethod
    def list_pending(db: Session, nutritionist_id: Optional[uuid.UUID]) -> list[NutritionPlan]:
        query = (
            db.query(NutritionPlan)
            .options(*_PLAN_EAGER_OPTIONS)
            .filter(NutritionPlan.status == NutritionPlanStatus.pending)
        )
        if nutritionist_id:
            query = query.filter(
                or_(
                    NutritionPlan.nutritionist_id == nutritionist_id,
                    NutritionPlan.nutritionist_id.is_(None),
                )
            )
        return query.order_by(NutritionPlan.created_at.asc()).all()

    @staticmethod
    def get_detail(db: Session, plan_id: uuid.UUID) -> Optional[NutritionPlan]:
        return (
            db.query(NutritionPlan)
            .options(*_PLAN_EAGER_OPTIONS)
            .filter(NutritionPlan.id == plan_id)
            .first()
        )
