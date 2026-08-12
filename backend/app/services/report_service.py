import os
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.db.models.appointment import Appointment
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.medical_profile import MedicalProfile
from app.db.models.patient import PatientHistory, PatientProfile
from app.db.models.report import PatientReport
from app.db.models.user import Person, User, UserRole
from app.db.models.weight_log import WeightLog
from app.services.anthropometric_measurement_service import AnthropometricMeasurementService
from app.services.nutrition_plan_service import (
    NutritionPlanService,
    meal_macros,
    plan_nutrition_summary,
)
from app.services.pdf.clinical_evolution_pdf import build_clinical_evolution_pdf
from app.services.pdf.clinical_history_pdf import build_clinical_history_pdf
from app.services.pdf.meal_plan_pdf import build_meal_plan_pdf
from app.services.pdf.patient_report_pdf import build_patient_report_pdf
from app.services.pdf.soap_note_pdf import build_soap_pdf
from app.services.report_helpers import classify_blood_pressure, range_start_date

_UPLOAD_DIR = "uploads/reports"


class ReportService:

    _range_start_date = staticmethod(range_start_date)
    _classify_blood_pressure = staticmethod(classify_blood_pressure)

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
    def _clinical_history_data(db: Session, patient_id: uuid.UUID) -> dict:
        person = db.query(Person).filter(Person.user_id == patient_id).first()
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
        medical_profile = (
            db.query(MedicalProfile).filter(MedicalProfile.user_id == patient_id).first()
        )
        latest_measurement = AnthropometricMeasurementService.get_latest(db, patient_id)
        history_entries = (
            db.query(PatientHistory)
            .join(PatientProfile, PatientProfile.id == PatientHistory.patient_profile_id)
            .filter(PatientProfile.user_id == patient_id)
            .order_by(PatientHistory.created_at.desc())
            .all()
        )

        return {
            "first_name": person.first_name if person else "",
            "last_name": person.last_name if person else "",
            "cedula": person.cedula if person else None,
            "date_of_birth": person.date_of_birth if person else None,
            "gender": person.gender.value if person and person.gender else None,
            "phone": person.phone if person else None,
            "clinical_notes": profile.clinical_notes if profile else None,
            "hypertension_diagnosed": profile.hypertension_diagnosed if profile else False,
            "systolic": profile.systolic if profile else None,
            "diastolic": profile.diastolic if profile else None,
            "medications": profile.medications if profile else [],
            "allergies": profile.allergies if profile else [],
            "dietary_restrictions": profile.dietary_restrictions if profile else [],
            "medical_profile": (
                {
                    "goal": medical_profile.goal,
                    "activity_level": medical_profile.activity_level,
                    "target_weight_kg": (
                        float(medical_profile.target_weight_kg)
                        if medical_profile.target_weight_kg is not None
                        else None
                    ),
                    "daily_calories_goal": medical_profile.daily_calories_goal,
                    "medical_conditions": medical_profile.medical_conditions or [],
                }
                if medical_profile
                else None
            ),
            "latest_measurement": (
                {
                    "log_date": latest_measurement.log_date,
                    "fat_percent": (
                        float(latest_measurement.fat_percent)
                        if latest_measurement.fat_percent is not None
                        else None
                    ),
                    "muscle_mass_kg": (
                        float(latest_measurement.muscle_mass_kg)
                        if latest_measurement.muscle_mass_kg is not None
                        else None
                    ),
                    "circumference_waist_cm": (
                        float(latest_measurement.circumference_waist_cm)
                        if latest_measurement.circumference_waist_cm is not None
                        else None
                    ),
                    "circumference_hip_cm": (
                        float(latest_measurement.circumference_hip_cm)
                        if latest_measurement.circumference_hip_cm is not None
                        else None
                    ),
                }
                if latest_measurement
                else None
            ),
            "history_entries": history_entries,
        }

    @staticmethod
    def _soap_data(db: Session, patient_id: uuid.UUID) -> dict:
        person = db.query(Person).filter(Person.user_id == patient_id).first()
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
        latest_weight = (
            db.query(WeightLog)
            .filter(WeightLog.user_id == patient_id)
            .order_by(WeightLog.log_date.desc())
            .first()
        )
        latest_measurement = AnthropometricMeasurementService.get_latest(db, patient_id)
        active_plan = NutritionPlanService.get_active_for_patient(db, patient_id)

        weight = float(latest_weight.weight_kg) if latest_weight else None
        height = profile.height_m if profile else None
        bmi = round(weight / (height * height), 2) if weight and height else None

        subjective = None
        if active_plan and active_plan.patient_notes:
            subjective = active_plan.patient_notes
        elif profile and profile.clinical_notes:
            subjective = profile.clinical_notes

        plan_summary = None
        if active_plan:
            macros_list = [meal_macros(m) for m in active_plan.meals]
            summary = plan_nutrition_summary(active_plan, macros_list)
            plan_summary = {
                "title": active_plan.title,
                "description": active_plan.description,
                "daily_average": summary["daily_average"],
            }

        return {
            "first_name": person.first_name if person else "",
            "last_name": person.last_name if person else "",
            "subjective": subjective,
            "objective": {
                "weight_kg": weight,
                "height_m": height,
                "bmi": bmi,
                "systolic": profile.systolic if profile else None,
                "diastolic": profile.diastolic if profile else None,
                "fat_percent": (
                    float(latest_measurement.fat_percent)
                    if latest_measurement and latest_measurement.fat_percent is not None
                    else None
                ),
                "muscle_mass_kg": (
                    float(latest_measurement.muscle_mass_kg)
                    if latest_measurement and latest_measurement.muscle_mass_kg is not None
                    else None
                ),
            },
            "assessment": profile.clinical_notes if profile else None,
            "plan_summary": plan_summary,
        }

    @staticmethod
    def _meal_plan_data(db: Session, patient_id: uuid.UUID) -> dict | None:
        active_plan = NutritionPlanService.get_active_for_patient(db, patient_id)
        if not active_plan:
            return None

        person = db.query(Person).filter(Person.user_id == patient_id).first()
        macros_list = [meal_macros(m) for m in active_plan.meals]
        summary = plan_nutrition_summary(active_plan, macros_list)

        return {
            "first_name": person.first_name if person else "",
            "last_name": person.last_name if person else "",
            "title": active_plan.title,
            "description": active_plan.description,
            "nutrition_summary": summary,
            "meals": [
                {
                    "day_of_week": meal.day_of_week,
                    "meal_type": meal.meal_type,
                    "food_name": meal.food.name if meal.food else None,
                    "custom_food": meal.custom_food,
                    "quantity_g": float(meal.quantity_g) if meal.quantity_g is not None else None,
                    "instructions": meal.instructions,
                }
                for meal in active_plan.meals
            ],
        }

    @staticmethod
    def _evolution_data(db: Session, patient_id: uuid.UUID, range_key: str) -> dict:
        data = ReportService.get_report_data(db, patient_id, range_key)
        start_date = ReportService._range_start_date(range_key)
        measurements = [
            m
            for m in AnthropometricMeasurementService.get_history(db, patient_id, limit=50)
            if m.log_date >= start_date
        ]
        measurements.sort(key=lambda m: m.log_date)
        data["fat_percent_history"] = [
            {"date": m.log_date, "value": float(m.fat_percent)}
            for m in measurements
            if m.fat_percent is not None
        ]
        data["muscle_mass_history"] = [
            {"date": m.log_date, "value": float(m.muscle_mass_kg)}
            for m in measurements
            if m.muscle_mass_kg is not None
        ]
        return data

    @staticmethod
    def generate_pdf(
        db: Session,
        patient_id: uuid.UUID,
        range_key: str,
        generated_by: uuid.UUID,
        report_type: str = "progress",
    ) -> PatientReport | None:
        user = db.query(User).filter(User.id == patient_id, User.role == UserRole.patient).first()
        if not user:
            return None

        if report_type == "clinical_history":
            pdf_bytes = build_clinical_history_pdf(
                ReportService._clinical_history_data(db, patient_id)
            )
        elif report_type == "soap":
            pdf_bytes = build_soap_pdf(ReportService._soap_data(db, patient_id))
        elif report_type == "meal_plan":
            meal_plan_data = ReportService._meal_plan_data(db, patient_id)
            if meal_plan_data is None:
                raise ValueError("El paciente no tiene un plan nutricional activo")
            pdf_bytes = build_meal_plan_pdf(meal_plan_data)
        elif report_type == "evolution":
            pdf_bytes = build_clinical_evolution_pdf(
                ReportService._evolution_data(db, patient_id, range_key)
            )
        else:
            pdf_bytes = build_patient_report_pdf(
                ReportService.get_report_data(db, patient_id, range_key)
            )

        os.makedirs(_UPLOAD_DIR, exist_ok=True)
        file_name = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(_UPLOAD_DIR, file_name)
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        report = PatientReport(
            patient_id=patient_id,
            generated_by=generated_by,
            range_key=range_key,
            report_type=report_type,
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
