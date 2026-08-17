from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.db.base import get_db
from app.schemas.patient_nutritionist import (
    PatientNutritionistQueryParams,
    PatientNutritionistRequest,
    PatientNutritionistResponse,
)
from app.services.patient_nutritionist_service import PatientNutritionistService

router = APIRouter(prefix="/patient_nutritionists", tags=["patient_nutritionists"])


@router.get("", response_model=list[PatientNutritionistResponse])
def get_patient_nutritionists(
    query_params: PatientNutritionistQueryParams = Depends(), db: Session = Depends(get_db)
):
    return PatientNutritionistService.get_all(db, q=query_params)


@router.post("", response_model=None)
def create_patient_nutritionist(
    request: PatientNutritionistRequest,
    db: Session = Depends(get_db),
):
    try:
        profile = PatientNutritionistService.create(db, request)

    except HTTPException:
        raise
    except Exception as e:
        resp = error_response([f"Error al asignar paciente: {str(e)}"], status_code=500)
        return JSONResponse(status_code=500, content=resp.model_dump())

    resp = success_response(
        data=PatientNutritionistResponse.model_validate(profile).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())
