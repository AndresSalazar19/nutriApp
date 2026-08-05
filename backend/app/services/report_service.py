import os
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.db.models.appointment import Appointment
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.patient import PatientHistory, PatientProfile
from app.db.models.report import PatientReport
from app.db.models.user import Person, User, UserRole
from app.db.models.weight_log import WeightLog
from app.services.pdf.patient_report_pdf import build_patient_report_pdf

_RANGE_DAYS = {"3m": 90, "6m": 182, "1y": 365}
_UPLOAD_DIR = "uploads/reports"


class ReportService:

    @staticmethod
    def _range_start_date(range_key: str, today: date | None = None) -> date:
        today = today or date.today()
        days = _RANGE_DAYS.get(range_key, _RANGE_DAYS["3m"])
        return today - timedelta(days=days)

    @staticmethod
    def _classify_blood_pressure(systolic: int, diastolic: int) -> str:
        if systolic < 120 and diastolic < 80:
            return "Dentro del rango normal"
        if systolic < 130 and diastolic < 80:
            return "Levemente elevado"
        if systolic < 140 or diastolic < 90:
            return "Hipertensión etapa 1"
        return "Hipertensión etapa 2"

    @staticmethod
    def get_report_data(db: Session, patient_id: uuid.UUID, range_key: str) -> dict | None:
        user = db.query(User).filter(User.id == patient_id, User.role == UserRole.patient).first()
        if not user:
            return None

        person = db.query(Person).filter(Person.user_id == patient_id).first()
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
        start_date = ReportService._range_start_date(range_key)

        weight_logs = (
            db.query(WeightLog)
            .filter(WeightLog.user_id == patient_id, WeightLog.log_date >= start_date)
            .order_by(WeightLog.log_date.asc())
            .all()
        )
        bp_logs = (
            db.query(BloodPressureLog)
            .filter(BloodPressureLog.user_id == patient_id, BloodPressureLog.log_date >= start_date)
            .order_by(BloodPressureLog.log_date.asc())
            .all()
        )
        history_entries = (
            db.query(PatientHistory)
            .join(PatientProfile, PatientProfile.id == PatientHistory.patient_profile_id)
            .filter(PatientProfile.user_id == patient_id, PatientHistory.created_at >= start_date)
            .order_by(PatientHistory.created_at.desc())
            .all()
        )
        appointments = (
            db.query(Appointment)
            .filter(
                Appointment.patient_id == patient_id,
                Appointment.scheduled_at >= datetime.combine(start_date, datetime.min.time()),
            )
            .order_by(Appointment.scheduled_at.desc())
            .all()
        )

        weight_lost = None
        weight_lost_pct = None
        if len(weight_logs) >= 2:
            first_weight = float(weight_logs[0].weight_kg)
            last_weight = float(weight_logs[-1].weight_kg)
            weight_lost = round(first_weight - last_weight, 2)
            if first_weight:
                weight_lost_pct = round((weight_lost / first_weight) * 100, 2)

        latest_bp = bp_logs[-1] if bp_logs else None

        return {
            "user_id": user.id,
            "first_name": person.first_name if person else "",
            "last_name": person.last_name if person else "",
            "avatar_url": user.avatar_url,
            "range_key": range_key,
            "weight_lost": weight_lost,
            "weight_lost_pct": weight_lost_pct,
            "weight_history": [
                {"date": log.log_date, "value": float(log.weight_kg)} for log in weight_logs
            ],
            "blood_pressure_systolic": latest_bp.systolic if latest_bp else None,
            "blood_pressure_diastolic": latest_bp.diastolic if latest_bp else None,
            "blood_pressure_note": (
                ReportService._classify_blood_pressure(latest_bp.systolic, latest_bp.diastolic)
                if latest_bp
                else None
            ),
            "systolic_history": [{"date": log.log_date, "value": log.systolic} for log in bp_logs],
            "diastolic_history": [
                {"date": log.log_date, "value": log.diastolic} for log in bp_logs
            ],
            "clinical_notes": profile.clinical_notes if profile else None,
            "history_entries": history_entries,
            "appointments": appointments,
        }

    @staticmethod
    def generate_pdf(
        db: Session, patient_id: uuid.UUID, range_key: str, generated_by: uuid.UUID
    ) -> dict | None:
        data = ReportService.get_report_data(db, patient_id, range_key)
        if data is None:
            return None

        pdf_bytes = build_patient_report_pdf(data)

        os.makedirs(_UPLOAD_DIR, exist_ok=True)
        file_name = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(_UPLOAD_DIR, file_name)
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        report = PatientReport(
            patient_id=patient_id,
            generated_by=generated_by,
            range_key=range_key,
            file_path=file_path,
            file_name=file_name,
            file_size=len(pdf_bytes),
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_history(db: Session, patient_id: uuid.UUID) -> list[PatientReport]:
        return (
            db.query(PatientReport)
            .filter(PatientReport.patient_id == patient_id)
            .order_by(PatientReport.created_at.desc())
            .all()
        )
