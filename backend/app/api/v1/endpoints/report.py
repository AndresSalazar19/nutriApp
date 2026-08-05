import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import require_nutritionist_or_admin
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.report import (
    AppointmentSummary,
    GeneratedReportResponse,
    HistoryEntrySummary,
    PatientReportDataResponse,
    RangeKey,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/patients/{patient_id}/report", tags=["reports"])


def _report_to_response(report) -> dict:
    file_url = "/" + report.file_path.replace("\\", "/")
    return GeneratedReportResponse(
        id=report.id,
        file_url=file_url,
        file_name=report.file_name,
        range_key=report.range_key,
        created_at=report.created_at,
    ).model_dump(mode="json")


@router.get("", response_model=None)
def get_report_data(
    patient_id: uuid.UUID,
    range: RangeKey = Query("3m"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    data = ReportService.get_report_data(db, patient_id, range)
    if data is None:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    data["history_entries"] = [
        HistoryEntrySummary.model_validate(e).model_dump(mode="json")
        for e in data["history_entries"]
    ]
    data["appointments"] = [
        AppointmentSummary.model_validate(a).model_dump(mode="json") for a in data["appointments"]
    ]

    resp = success_response(
        data=PatientReportDataResponse(**data).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/pdf", response_model=None)
def generate_report_pdf(
    patient_id: uuid.UUID,
    range: RangeKey = Query("3m"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    report = ReportService.generate_pdf(db, patient_id, range, generated_by=current_user.id)
    if report is None:
        resp = error_response(["Paciente no encontrado"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(data=_report_to_response(report))
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/history", response_model=None)
def get_report_history(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    reports = ReportService.get_history(db, patient_id)
    resp = success_response(list_data=[_report_to_response(r) for r in reports])
    return JSONResponse(status_code=200, content=resp.model_dump())
