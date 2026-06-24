import uuid
from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.db.base import get_db
from app.schemas.appointment import (
    AppointmentRequest,
    AppointmentResponse,
    AppointmentUpdateRequest,
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointment", tags=["appointments"])


@router.post("", response_model=AppointmentResponse)
def create_appointment(db: Session = Depends(get_db), data: AppointmentRequest = None):
    return AppointmentService.create(db, data)


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    user_id: uuid.UUID = Query(...),
    role: Literal["patient", "nutritionist"] = Query(...),
    db: Session = Depends(get_db),
):
    try:
        appointments = AppointmentService.list(db, user_id, role)
        return appointments
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: uuid.UUID, db: Session = Depends(get_db), data: AppointmentUpdateRequest = None
):
    return AppointmentService.update(db, appointment_id, data)


@router.delete("/{appointment_id}", response_model=None)
def cancel_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = None,
    reason: str = None,
):
    try:
        AppointmentService.cancel(db, appointment_id, user_id, reason)
        resp = success_response(messages=["Cita cancelada exitosamente"])
        return JSONResponse(status_code=200, content=resp.model_dump())
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.get("/slots/{nutritionist_id}", response_model=list[datetime])
def get_available_slots(nutritionist_id: uuid.UUID, date: date, db: Session = Depends(get_db)):
    try:
        return AppointmentService.get_available_slots(db, nutritionist_id, date)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())
