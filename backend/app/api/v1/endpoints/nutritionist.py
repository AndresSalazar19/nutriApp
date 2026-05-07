import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.nutritionist import NutritionistProfileResponse, NutritionistStatusUpdate, NutritionistCreateRequest
from app.core.response import success_response, error_response
from app.services.nutritionist_service import NutritionistService
from app.services.user_service import UserService

router = APIRouter(prefix="/nutritionists", tags=["nutritionists"])


@router.get("", response_model=list[NutritionistProfileResponse])
def get_nutritionists(db: Session = Depends(get_db)):
    return NutritionistService.get_all(db)


@router.get("/status/{user_id}", response_model=None)
def get_nutritionist_status(user_id: uuid.UUID, db: Session = Depends(get_db)):
    profile = NutritionistService.get_by_user_id(db, user_id)
    if not profile:
        # Sin perfil aún → tratado como pendiente
        resp = success_response(data={"status": "pending"})
        return JSONResponse(status_code=200, content=resp.model_dump())

    resp = success_response(data={"status": profile.status})
    return JSONResponse(status_code=200, content=resp.model_dump())

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

@router.post("", response_model=None)
def create_nutritionist(payload: NutritionistCreateRequest, db: Session = Depends(get_db)):
    if UserService.email_exists(db, payload.email):
        resp = error_response(["El email ya esta registrado"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())
    try:
        profile = NutritionistService.create(db, payload)
    except Exception as e:
        resp = error_response([f"Error al crear nutricionista: {str(e)}"], status_code=500)
        return JSONResponse(status_code=500, content=resp.model_dump())
    resp = success_response(
        data=NutritionistProfileResponse.model_validate(profile).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())
