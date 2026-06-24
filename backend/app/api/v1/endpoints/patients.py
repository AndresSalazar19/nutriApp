import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.response import error_response, success_response
from app.db.base import get_db
from app.schemas.patient import (
    FlagUpdate,
    HistoryEntry,
    NotesUpdate,
    PatientDetailResponse,
    StatusUpdate,
)
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=None)
def get_patients(
    name: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    patients = PatientService.get_patients(db, name=name, status=status, priority=priority)
    resp = success_response(list_data=patients)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/search", response_model=None)
def search_patients(
    q: str = Query(...),
    db: Session = Depends(get_db),
):
    results = PatientService.search_patients(db, q)
    resp = success_response(list_data=results)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{patient_id}", response_model=None)
def get_patient_detail(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    detail = PatientService.get_patient_detail(db, patient_id)
    if not detail:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=PatientDetailResponse(**detail).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/{patient_id}/history", response_model=None)
def get_patient_history(patient_id: uuid.UUID, db: Session = Depends(get_db)):
    entries = PatientService.get_history(db, patient_id)
    resp = success_response(
        list_data=[HistoryEntry.model_validate(e).model_dump(mode="json") for e in entries]
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/notes", response_model=None)
def update_notes(patient_id: uuid.UUID, payload: NotesUpdate, db: Session = Depends(get_db)):
    detail = PatientService.get_patient_detail(db, patient_id)
    if not detail:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    PatientService.update_notes(db, patient_id, payload.clinical_notes)
    resp = success_response(data={"message": "Notas actualizadas correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/flag", response_model=None)
def update_flag(patient_id: uuid.UUID, payload: FlagUpdate, db: Session = Depends(get_db)):
    detail = PatientService.get_patient_detail(db, patient_id)
    if not detail:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    PatientService.update_flag(db, patient_id, payload.priority_flag)
    resp = success_response(data={"message": "Flag actualizado correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/status", response_model=None)
def update_status(patient_id: uuid.UUID, payload: StatusUpdate, db: Session = Depends(get_db)):
    if payload.status not in ("active", "inactive", "at_risk"):
        resp = error_response(["Estado debe ser 'active', 'inactive' o 'at_risk'"], status_code=400)
        return JSONResponse(status_code=400, content=resp.model_dump())

    detail = PatientService.get_patient_detail(db, patient_id)
    if not detail:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    PatientService.update_status(db, patient_id, payload.status)
    resp = success_response(data={"message": "Estado actualizado correctamente"})
    return JSONResponse(status_code=200, content=resp.model_dump())
