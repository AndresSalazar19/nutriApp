import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.nutritionist import NutritionistProfileResponse, NutritionistStatusUpdate
from app.core.response import success_response, error_response
from app.services.nutritionist_service import NutritionistService

router = APIRouter(prefix="/nutritionists", tags=["nutritionists"])


@router.get("", response_model=list[NutritionistProfileResponse])
def get_nutritionists(db: Session = Depends(get_db)):
    return NutritionistService.get_all(db)

@router.patch("/{profile_id}/status", response_model=None)
def update_nutritionist_status(
    profile_id: uuid.UUID,
    payload: NutritionistStatusUpdate,
    db: Session = Depends(get_db),
):

    if payload.status not in ("verified", "rejected"):
        resp = error_response(["El estado debe ser 'verified' o 'rejected'"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    profile = NutritionistService.get_by_id(db, profile_id)
    if not profile:
        resp = error_response(["Perfil de nutricionista no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    if profile.status != "pending":
        resp = error_response(
            [f"Solo se pueden revisar perfiles pendientes. Estado actual: {profile.status}"],
            status_code=400,
        )
        return JSONResponse(status_code=400, content=resp.model_dump())

    updated = NutritionistService.update_status(db, profile, payload.status, payload.verified_by)
    resp = success_response(
        data=NutritionistProfileResponse.model_validate(updated).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())
