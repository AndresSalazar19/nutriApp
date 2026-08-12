from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import require_nutritionist_or_admin
from app.core.response import success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.food import FoodPickerResponse
from app.services.nutrition_plan_service import NutritionPlanService

router = APIRouter(prefix="/foods", tags=["foods"])


@router.get("", response_model=None)
def search_foods(
    search: Optional[str] = Query(None),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    foods = NutritionPlanService.search_foods(db, search, limit)
    data = [FoodPickerResponse.model_validate(f).model_dump(mode="json") for f in foods]
    resp = success_response(list_data=data)
    return JSONResponse(status_code=200, content=resp.model_dump())
