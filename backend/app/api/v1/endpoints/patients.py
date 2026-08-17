import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_nutritionist_or_admin
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.anthropometric_measurement import AnthropometricMeasurementResponse
from app.schemas.patient import (
    FlagUpdate,
    HistoryEntry,
    NotesUpdate,
    PatientAnthropometricUpdate,
    PatientDetailResponse,
    PatientDietaryHistoryUpdate,
    PatientHealthUpdate,
    PatientPathologicalHistoryUpdate,
    StatusUpdate,
)
from app.services.anthropometric_measurement_service import AnthropometricMeasurementService
from app.services.patient_service import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])


@router.put("/{patient_id}/health", response_model=None)
def update_patient_health(
    patient_id: uuid.UUID,
    payload: PatientHealthUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != patient_id:
        raise HTTPException(
            status_code=403, detail="Solo puedes actualizar tu propio perfil medico"
        )
    if not PatientService.get_patient_detail(db, patient_id):
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())
    PatientService.update_health(db, patient_id, payload)
    detail = PatientService.get_patient_detail(db, patient_id)
    resp = success_response(data=PatientDetailResponse(**detail).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/pathological-history", response_model=None)
def update_patient_pathological_history(
    patient_id: uuid.UUID,
    payload: PatientPathologicalHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != patient_id:
        raise HTTPException(
            status_code=403, detail="Solo puedes actualizar tu propio perfil medico"
        )
    if not PatientService.get_patient_detail(db, patient_id):
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())
    PatientService.update_pathological_history(db, patient_id, payload)
    detail = PatientService.get_patient_detail(db, patient_id)
    resp = success_response(data=PatientDetailResponse(**detail).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/dietary-history", response_model=None)
def update_patient_dietary_history(
    patient_id: uuid.UUID,
    payload: PatientDietaryHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != patient_id:
        raise HTTPException(
            status_code=403, detail="Solo puedes actualizar tu propio perfil medico"
        )
    if not PatientService.get_patient_detail(db, patient_id):
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())
    PatientService.update_dietary_history(db, patient_id, payload)
    detail = PatientService.get_patient_detail(db, patient_id)
    resp = success_response(data=PatientDetailResponse(**detail).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.put("/{patient_id}/anthropometrics", response_model=None)
def update_patient_anthropometrics(
    patient_id: uuid.UUID,
    payload: PatientAnthropometricUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    if not PatientService.get_patient_detail(db, patient_id):
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    PatientService.record_anthropometric_measurement(
        db,
        patient_id,
        log_date=payload.log_date,
        weight_kg=payload.weight_kg,
        height_m=payload.height_m,
        notes=payload.notes,
        recorded_by=current_user.id,
    )
    detail = PatientService.get_patient_detail(db, patient_id)
    resp = success_response(data=PatientDetailResponse(**detail).model_dump(mode="json"))
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/{patient_id}/anthropometrics/measurement", response_model=None)
def create_anthropometric_measurement(
    patient_id: uuid.UUID,
    log_date: date = Form(...),
    fat_percent: Optional[float] = Form(None),
    muscle_mass_kg: Optional[float] = Form(None),
    skinfold_triceps: Optional[float] = Form(None),
    skinfold_subscapular: Optional[float] = Form(None),
    skinfold_suprailiac: Optional[float] = Form(None),
    skinfold_abdominal: Optional[float] = Form(None),
    skinfold_thigh: Optional[float] = Form(None),
    circumference_waist: Optional[float] = Form(None),
    circumference_hip: Optional[float] = Form(None),
    circumference_arm: Optional[float] = Form(None),
    circumference_thigh: Optional[float] = Form(None),
    circumference_calf: Optional[float] = Form(None),
    circumference_neck: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    bioimpedance_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    if not PatientService.get_patient_detail(db, patient_id):
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    try:
        measurement = AnthropometricMeasurementService.create(
            db,
            user_id=patient_id,
            log_date=log_date,
            fat_percent=fat_percent,
            muscle_mass_kg=muscle_mass_kg,
            skinfolds={
                "triceps": skinfold_triceps,
                "subscapular": skinfold_subscapular,
                "suprailiac": skinfold_suprailiac,
                "abdominal": skinfold_abdominal,
                "thigh": skinfold_thigh,
            },
            circumferences={
                "waist": circumference_waist,
                "hip": circumference_hip,
                "arm": circumference_arm,
                "thigh": circumference_thigh,
                "calf": circumference_calf,
                "neck": circumference_neck,
            },
            notes=notes,
            created_by=current_user.id,
            file=bioimpedance_file,
        )
    except ValueError as exc:
        resp = error_response([str(exc)], status_code=422)
        return JSONResponse(status_code=422, content=resp.model_dump())

    resp = success_response(
        data=AnthropometricMeasurementResponse.model_validate(measurement).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/{patient_id}/anthropometrics/measurement/latest", response_model=None)
def get_latest_anthropometric_measurement(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    measurement = AnthropometricMeasurementService.get_latest(db, patient_id)
    if not measurement:
        resp = success_response(data=None)
        return JSONResponse(status_code=200, content=resp.model_dump())

    resp = success_response(
        data=AnthropometricMeasurementResponse.model_validate(measurement).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


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
