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
    AvailabilityCalendarResponse,
    AvailabilityNutritionistRequest,
    AvailabilityNutritionistResponse,
)
from app.services.appointment_service import AppointmentService

router = APIRouter(prefix="/appointment", tags=["appointments"])


@router.post("", response_model=AppointmentResponse)
def create_appointment(data: AppointmentRequest, db: Session = Depends(get_db)):
    try:
        return AppointmentService.create(db, data)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


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
    appointment_id: uuid.UUID, data: AppointmentUpdateRequest, db: Session = Depends(get_db)
):
    try:
        return AppointmentService.update(db, appointment_id, data)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.delete("/{appointment_id}", response_model=None)
def cancel_appointment(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = None,
):
    try:
        AppointmentService.cancel(db, appointment_id, user_id)
        resp = success_response(messages=["Cita cancelada exitosamente"])
        return JSONResponse(status_code=200, content=resp.model_dump())
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.get("/slots/{nutritionist_id}", response_model=list[datetime])
def get_available_slots(
    nutritionist_id: uuid.UUID,
    date: date,
    duration_min: int = 45,
    db: Session = Depends(get_db),
):
    try:
        return AppointmentService.get_available_slots(db, nutritionist_id, date, duration_min)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.post("/availability/{nutritionist_id}", response_model=AvailabilityNutritionistResponse)
def create_availability(
    nutritionist_id: uuid.UUID,
    data: AvailabilityNutritionistRequest,
    db: Session = Depends(get_db),
):
    try:
        return AppointmentService.create_availability(db, nutritionist_id, data)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.patch(
    "/availability/{availability_id}",
    response_model=AvailabilityNutritionistResponse,
)
def update_availability(
    availability_id: uuid.UUID,
    data: AvailabilityNutritionistRequest,
    db: Session = Depends(get_db),
):
    try:
        return AppointmentService.update_availability(db, availability_id, data)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.delete("/availability/{availability_id}", response_model=None)
def delete_availability(availability_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        AppointmentService.delete_availability(db, availability_id)
        resp = success_response(data={"message": "Disponibilidad eliminada correctamente"})
        return JSONResponse(status_code=200, content=resp.model_dump())
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())


@router.get(
    "/availability/calendar/{nutritionist_id}",
    response_model=AvailabilityCalendarResponse,
)
def get_availability_calendar(
    nutritionist_id: uuid.UUID,
    week_start: date | None = None,
    db: Session = Depends(get_db),
):
    try:
        return AppointmentService.get_availability_calendar(db, nutritionist_id, week_start)
    except Exception as e:
        resp = error_response([str(e)], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())
