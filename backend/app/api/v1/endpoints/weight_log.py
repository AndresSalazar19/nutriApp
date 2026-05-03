import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.weight_log import WeightLogCreate, WeightLogResponse, WeightStatsResponse
from app.core.response import success_response, error_response
from app.services.weight_log_service import WeightLogService

router = APIRouter(prefix="/weight-log", tags=["weight-log"])


@router.post("", response_model=None)
def create_weight_log(payload: WeightLogCreate, db: Session = Depends(get_db)):
    log = WeightLogService.create(db, payload)
    resp = success_response(
        data=WeightLogResponse.model_validate(log).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/{user_id}", response_model=None)
def get_weight_history(
    user_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    logs = WeightLogService.get_history(db, user_id, limit)
    data = [WeightLogResponse.model_validate(l).model_dump(mode="json") for l in logs]
    resp = success_response(list_data=data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}/stats", response_model=None)
def get_weight_stats(user_id: uuid.UUID, db: Session = Depends(get_db)):
    stats = WeightLogService.get_stats(db, user_id)
    resp = success_response(data=stats)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.delete("/{log_id}", response_model=None)
def delete_weight_log(
    log_id: uuid.UUID,
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    deleted = WeightLogService.delete(db, log_id, user_id)
    if not deleted:
        resp = error_response(["Registro no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data={"message": "Registro eliminado correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())