import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import success_response
from app.db.base import get_db
from app.schemas.blood_pressure_log import (
    BloodPressureLogCreate,
    BloodPressureLogResponse,
)
from app.services.blood_pressure_log_service import BloodPressureLogService

router = APIRouter(prefix="/blood-pressure-log", tags=["blood-pressure-log"])


@router.post("", response_model=None)
def create_blood_pressure_log(payload: BloodPressureLogCreate, db: Session = Depends(get_db)):
    log = BloodPressureLogService.create(db, payload)
    resp = success_response(
        data=BloodPressureLogResponse.model_validate(log).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/{user_id}", response_model=None)
def get_blood_pressure_history(
    user_id: uuid.UUID,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    logs = BloodPressureLogService.get_history(db, user_id, limit)
    data = [BloodPressureLogResponse.model_validate(log).model_dump(mode="json") for log in logs]
    resp = success_response(list_data=data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{user_id}/stats", response_model=None)
def get_blood_pressure_stats(user_id: uuid.UUID, db: Session = Depends(get_db)):
    stats = BloodPressureLogService.get_stats(db, user_id)
    resp = success_response(data=stats)
    return JSONResponse(status_code=200, content=resp.model_dump())
