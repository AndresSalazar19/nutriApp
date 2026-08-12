import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_nutritionist_or_admin, require_patient
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.nutrition_plan import NutritionPlan
from app.db.models.user import User, UserRole
from app.schemas.nutrition_plan import (
    NutritionPlanCreate,
    NutritionPlanRejectRequest,
    NutritionPlanResponse,
)
from app.services.nutrition_plan_helpers import AIPlanParseError
from app.services.nutrition_plan_service import NutritionPlanService
from app.services.user_service import UserService

router = APIRouter(prefix="/nutrition-plans", tags=["nutrition-plans"])


_MACRO_FIELDS = (
    "calories",
    "protein_g",
    "carbs_g",
    "fat_g",
    "fiber_g",
    "sugar_g",
    "sodium_mg",
    "calcium_mg",
    "iron_mg",
    "vitamin_c_mg",
    "potassium_mg",
    "zinc_mg",
    "vitamin_a_ug",
    "folate_ug",
)


def _meal_macros(meal) -> Optional[dict]:
    """Scales a food's per-100g composition by the meal's quantity_g.

    None when the meal has no catalog food (custom_food entries) or no
    quantity — there's nothing to compute a contribution from.
    """
    if meal.food is None or meal.quantity_g is None:
        return None

    factor = float(meal.quantity_g) / 100.0
    macros = {}
    for field in _MACRO_FIELDS:
        value = getattr(meal.food, field)
        macros[field] = round(float(value) * factor, 1) if value is not None else None
    return macros


def _plan_nutrition_summary(plan: NutritionPlan, meal_macros: list[Optional[dict]]) -> dict:
    """Aggregates per-meal macro contributions into daily totals + a plan-wide daily average."""
    by_day: dict[int, dict] = {}
    missing = 0

    for meal, macros in zip(plan.meals, meal_macros, strict=True):
        if macros is None:
            missing += 1
            continue
        day_totals = by_day.setdefault(meal.day_of_week, {field: 0.0 for field in _MACRO_FIELDS})
        for field in _MACRO_FIELDS:
            value = macros[field]
            if value is not None:
                day_totals[field] += value

    num_days = len(by_day) or 1
    daily_average = {
        field: round(sum(day[field] for day in by_day.values()) / num_days, 1)
        for field in _MACRO_FIELDS
    }

    return {
        "daily_average": daily_average,
        "by_day": {
            str(day): {field: round(value, 1) for field, value in totals.items()}
            for day, totals in by_day.items()
        },
        "meals_missing_macro_data": missing,
    }


def _plan_to_response(plan: NutritionPlan) -> dict:
    data = NutritionPlanResponse.model_validate(plan).model_dump(mode="json")
    data["patient"] = None
    if plan.patient:
        person = plan.patient.person
        data["patient"] = {
            "id": str(plan.patient.id),
            "name": f"{person.first_name} {person.last_name}" if person else plan.patient.email,
            "email": plan.patient.email,
        }

    meal_macros = [_meal_macros(meal) for meal in plan.meals]
    data["meals"] = [
        {
            "id": str(meal.id),
            "day_of_week": meal.day_of_week,
            "meal_type": meal.meal_type,
            "food_id": str(meal.food_id) if meal.food_id else None,
            "food_name": meal.food.name if meal.food else None,
            "custom_food": meal.custom_food,
            "quantity_g": float(meal.quantity_g) if meal.quantity_g is not None else None,
            "instructions": meal.instructions,
            "macros": macros,
        }
        for meal, macros in zip(plan.meals, meal_macros, strict=True)
    ]
    data["nutrition_summary"] = _plan_nutrition_summary(plan, meal_macros)
    return data


def _can_view_plan(user: User, plan: NutritionPlan) -> bool:
    if UserService.is_admin(user):
        return True
    if user.role == UserRole.patient:
        return plan.patient_id == user.id
    if user.role == UserRole.nutritionist:
        return plan.nutritionist_id is None or plan.nutritionist_id == user.id
    return False


@router.post("", response_model=None)
async def generate_plan(
    text: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    try:
        plan = await NutritionPlanService.generate_from_request(db, current_user, text, image)
    except (ValueError, AIPlanParseError) as exc:
        resp = error_response([str(exc)], status_code=422)
        return JSONResponse(status_code=422, content=resp.model_dump())
    except RuntimeError as exc:
        resp = error_response([str(exc)], status_code=502)
        return JSONResponse(status_code=502, content=resp.model_dump())

    resp = success_response(data=_plan_to_response(plan))
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/mine", response_model=None)
def list_my_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    plans = NutritionPlanService.list_for_patient(db, current_user.id)
    resp = success_response(list_data=[_plan_to_response(p) for p in plans])
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/pending", response_model=None)
def list_pending_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    nutritionist_id = None if UserService.is_admin(current_user) else current_user.id
    plans = NutritionPlanService.list_pending(db, nutritionist_id)
    resp = success_response(list_data=[_plan_to_response(p) for p in plans])
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/manual", response_model=None)
def create_manual_plan(
    payload: NutritionPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    try:
        plan = NutritionPlanService.create_manual_plan(
            db=db,
            patient_id=payload.patient_id,
            nutritionist_id=current_user.id,
            title=payload.title,
            description=payload.description,
            start_date=payload.start_date or date.today(),
            end_date=payload.end_date,
            meals=[m.model_dump() for m in payload.meals],
            is_admin=UserService.is_admin(current_user),
        )
    except ValueError as exc:
        resp = error_response([str(exc)], status_code=403)
        return JSONResponse(status_code=403, content=resp.model_dump())

    resp = success_response(data=_plan_to_response(plan))
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/{plan_id}", response_model=None)
def get_plan(
    plan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = NutritionPlanService.get_detail(db, plan_id)
    if not plan:
        resp = error_response(["Plan no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    if not _can_view_plan(current_user, plan):
        raise HTTPException(status_code=403, detail="No tienes acceso a este plan")

    resp = success_response(data=_plan_to_response(plan))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.patch("/{plan_id}/approve", response_model=None)
def approve_plan(
    plan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    plan = NutritionPlanService.approve(db, plan_id, current_user)
    if not plan:
        resp = error_response(["Plan no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=_plan_to_response(plan))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.patch("/{plan_id}/reject", response_model=None)
def reject_plan(
    plan_id: uuid.UUID,
    payload: NutritionPlanRejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    plan = NutritionPlanService.reject(db, plan_id, current_user, payload.reason)
    if not plan:
        resp = error_response(["Plan no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=_plan_to_response(plan))
    return JSONResponse(status_code=200, content=resp.model_dump())
