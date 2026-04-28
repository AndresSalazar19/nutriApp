from sqlalchemy.orm import Session
from app.db.models.appointment import Appointment, AppointmentStatus, AvailabilityNutritionist, AvailabilityRuleType
from datetime import datetime
from typing import List
from app.schemas.appointment import AppointmentRequest, AppointmentResponse, AppointmentUpdateRequest
import uuid
from datetime import datetime, timedelta, timezone, date
from passlib.context import CryptContext
from sqlalchemy import text
from fastapi import HTTPException
from zoneinfo import ZoneInfo

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
LOCAL_TZ = ZoneInfo("America/Guayaquil")

class AppointmentService:
    
    @staticmethod
    def _is_slot_available(db: Session, nutritionist_id, start: datetime, duration: int):

        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        end = start + timedelta(minutes=duration)

        appointments = db.query(Appointment).filter(
            Appointment.nutritionist_id == nutritionist_id,
            Appointment.status.in_([
                AppointmentStatus.scheduled,
                AppointmentStatus.confirmed
            ])
        ).all()

        for appt in appointments:
            appt_start = appt.scheduled_at
            if appt_start.tzinfo is None:
                appt_start = appt_start.replace(tzinfo=timezone.utc)

            appt_end = appt_start + timedelta(minutes=appt.duration_min)

            if appt_start < end and appt_end > start:
                return False

        return True

    @staticmethod
    def is_within_availability(db: Session, nutritionist_id, start: datetime, duration: int):

        tz = ZoneInfo("America/Guayaquil")
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)

        end = start + timedelta(minutes=duration)
        start_local = start.astimezone(LOCAL_TZ)
        end_local = end.astimezone(LOCAL_TZ)

        day_of_week = start_local.weekday()

        rules = db.query(AvailabilityNutritionist).filter(
            AvailabilityNutritionist.nutritionist_id == nutritionist_id,
            AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
            AvailabilityNutritionist.day_of_week == day_of_week,
            AvailabilityNutritionist.is_available == True
        ).all()

        if not rules:
            return False

        exception = db.query(AvailabilityNutritionist).filter(
            AvailabilityNutritionist.nutritionist_id == nutritionist_id,
            AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
            AvailabilityNutritionist.specific_date == start_local.date(),
            AvailabilityNutritionist.is_available == False
        ).first()

        if exception:
            return False

        for rule in rules:
            start_rule = datetime.combine(start_local.date(), rule.start_time, tzinfo=LOCAL_TZ)
            end_rule = datetime.combine(start_local.date(), rule.end_time, tzinfo=LOCAL_TZ)

            if start_local >= start_rule and end_local <= end_rule:
                return True

        return False


    @staticmethod
    def create(db: Session, data: AppointmentRequest) -> AppointmentResponse:
        scheduled_at = data.scheduled_at

        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=LOCAL_TZ)
        
        scheduled_at = scheduled_at.astimezone(timezone.utc)
        if not AppointmentService._is_slot_available(db, data.nutritionist_id, scheduled_at, data.duration_min):
            raise HTTPException(status_code=400, detail="El horario no está disponible")
        
        if not AppointmentService.is_within_availability(db, data.nutritionist_id, scheduled_at, data.duration_min):
            raise HTTPException(status_code=400, detail="El horario no está dentro de la disponibilidad")

        appointment = Appointment(
            patient_id=data.patient_id,
            nutritionist_id=data.nutritionist_id,
            scheduled_at=scheduled_at,
            duration_min=data.duration_min,
            modality=data.modality,
            notes=data.notes
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def list(db: Session, user_id: uuid.UUID, role: str):

        query = db.query(Appointment)

        if role == "patient":
            query = query.filter(Appointment.patient_id == user_id)

        elif role == "nutritionist":
            query = query.filter(Appointment.nutritionist_id == user_id)

        return query.order_by(Appointment.scheduled_at.desc()).all()

    @staticmethod
    def update(db: Session, appointment_id: uuid.UUID, data: AppointmentUpdateRequest):

        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise Exception("Cita no encontrada")

        if data.scheduled_at:
            new_date = data.scheduled_at

            if new_date.tzinfo is None:
                new_date = new_date.replace(tzinfo=LOCAL_TZ)

            new_date = new_date.astimezone(timezone.utc)

            duration = data.duration_min or appointment.duration_min

            if not AppointmentService._is_slot_available(db, appointment.nutritionist_id, new_date, duration):
                raise HTTPException(status_code=400, detail="Nuevo horario no disponible")
            
            if not AppointmentService.is_within_availability(db, appointment.nutritionist_id, new_date, duration    ):
                raise HTTPException(status_code=400, detail="El horario no está dentro de la disponibilidad")

            appointment.scheduled_at = new_date

        if data.duration_min:
            appointment.duration_min = data.duration_min

        if data.modality:
            appointment.modality = data.modality

        if data.notes:
            appointment.notes = data.notes

        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def cancel(db: Session, appointment_id: uuid.UUID, user_id: uuid.UUID, reason: str | None):

        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

        if not appointment:
            raise Exception("Cita no encontrada")

        appointment.status = AppointmentStatus.cancelled
        appointment.cancelled_by = user_id
        appointment.cancelled_at = datetime.now(timezone.utc)
        appointment.notes = reason

        db.commit()
        db.refresh(appointment)

        return appointment
    

    @staticmethod
    def get_available_slots(db: Session, nutritionist_id: uuid.UUID, date: date) -> List[datetime]:

        day_of_week = date.weekday()

        rules = db.query(AvailabilityNutritionist).filter(
            AvailabilityNutritionist.nutritionist_id == nutritionist_id,
            AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
            AvailabilityNutritionist.day_of_week == day_of_week,
            AvailabilityNutritionist.is_available == True
        ).all()

        slots = []

        for rule in rules:
            start = datetime.combine(date, rule.start_time)
            start = start.replace(tzinfo=LOCAL_TZ).astimezone(timezone.utc)

            end = datetime.combine(date, rule.end_time)
            end = end.replace(tzinfo=LOCAL_TZ).astimezone(timezone.utc)

            current = start

            while current < end:
                if AppointmentService._is_slot_available(db, nutritionist_id, current, 45):
                    slots.append(current)

                current += timedelta(minutes=45)

        return slots

    
