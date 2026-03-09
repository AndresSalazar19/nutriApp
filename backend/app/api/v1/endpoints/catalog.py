from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.catalog import SpecialistResponse
from app.core.response import success_response, error_response
from app.services.catalog_service import CatalogService
import uuid

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/specialists", response_model=None)
def get_specialists(db: Session = Depends(get_db)):
    specialists = CatalogService.get_specialists(db)
    resp = success_response(data=list(SpecialistResponse.model_validate(s) for s in specialists))
    return JSONResponse(status_code=200, content=resp.model_dump())

@router.get("/specialists/{speciality_id}", response_model=None)
def get_specialist_by_id(speciality_id: int, db: Session = Depends(get_db)):
    specialist = CatalogService.get_by_id(db, speciality_id)
    if not specialist:
        resp = error_response(["Especialidad no encontrada"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=SpecialistResponse.model_validate(specialist).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())