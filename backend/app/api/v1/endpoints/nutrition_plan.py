import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_nutritionist_or_admin, require_patient
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.nutrition_plan import NutritionPlan
from app.db.models.user import User, UserRole
from app.schemas.nutrition_plan import NutritionPlanRejectRequest, NutritionPlanResponse
from app.services.nutrition_plan_helpers import AIPlanParseError
from app.services.nutrition_plan_service import NutritionPlanService
from app.services.user_service import UserService

router = APIRouter(prefix="/nutrition-plans", tags=["nutrition-plans"])


def _plan_to_response(plan: NutritionPlan) -> dict:
    data = NutritionPlanResponse.model_validate(plan).model_dump(mode="json")
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
        }
        for meal in plan.meals
    ]
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
