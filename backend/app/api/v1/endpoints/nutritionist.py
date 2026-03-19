from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.nutritionist import NutritionistProfileResponse
from app.core.response import success_response, error_response
from app.services.nutritionist_service import NutritionistService

router = APIRouter(prefix="/nutritionists", tags=["nutritionists"])


@router.get("", response_model=list[NutritionistProfileResponse])
def get_nutritionists(db: Session = Depends(get_db)):
    return NutritionistService.get_all(db)
