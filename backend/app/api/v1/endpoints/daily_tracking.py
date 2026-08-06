import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.daily_tracking import (
    CalorieLogCreate,
    DailyTrackingLogResponse,
    DailyTrackingSummary,
    HydrationLogCreate,
)
from app.services.daily_tracking_service import DailyTrackingService

router = APIRouter(prefix="/daily-tracking", tags=["daily-tracking"])


def ensure_owner(requested_id: uuid.UUID, current_user: User) -> None:
    if requested_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes registrar tus propias metricas")


@router.post("/hydration", response_model=None)
def create_hydration(
    payload: HydrationLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_owner(payload.user_id, current_user)
    log = DailyTrackingService.create_hydration(db, payload)
    data = DailyTrackingLogResponse.model_validate(log).model_dump(mode="json")
    return JSONResponse(status_code=201, content=success_response(data=data).model_dump())


def create_calorie_log(
    payload: CalorieLogCreate,
    metric_type: str,
    db: Session,
    current_user: User,
) -> JSONResponse:
    ensure_owner(payload.user_id, current_user)
    log = DailyTrackingService.create_calories(db, payload, metric_type)
    data = DailyTrackingLogResponse.model_validate(log).model_dump(mode="json")
    return JSONResponse(status_code=201, content=success_response(data=data).model_dump())


@router.post("/calories-consumed", response_model=None)
def create_consumed_calories(
    payload: CalorieLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_calorie_log(payload, "calories_consumed", db, current_user)


@router.post("/calories-burned", response_model=None)
def create_burned_calories(
    payload: CalorieLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_calorie_log(payload, "calories_burned", db, current_user)


@router.get("/{user_id}/summary", response_model=None)
def get_daily_summary(
    user_id: uuid.UUID,
    log_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ensure_owner(user_id, current_user)
    summary = DailyTrackingService.get_summary(db, user_id, log_date)
    data = DailyTrackingSummary(**summary).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())
