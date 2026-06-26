import uuid
from datetime import date, datetime, time, timedelta, timezone
from typing import List
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models.appointment import (
    Appointment,
    AppointmentStatus,
    AvailabilityNutritionist,
    AvailabilityRuleType,
)
from app.schemas.appointment import (
    AppointmentRequest,
    AppointmentResponse,
    AppointmentUpdateRequest,
    AvailabilityNutritionistRequest,
)

LOCAL_TZ = ZoneInfo("America/Guayaquil")
ALL_DAY_START = time(0, 0, 0)
ALL_DAY_END = time(23, 59, 0)


def _is_all_day(start_time, end_time) -> bool:
    return start_time == ALL_DAY_START and end_time == ALL_DAY_END


class AppointmentService:

    @staticmethod
    def _is_slot_available(
        db: Session,
        nutritionist_id,
        start: datetime,
        duration: int,
        exclude_appointment_id: uuid.UUID = None,
    ) -> bool:
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
        end = start + timedelta(minutes=duration)

        query = db.query(Appointment).filter(
            Appointment.nutritionist_id == nutritionist_id,
            Appointment.status.in_([AppointmentStatus.scheduled, AppointmentStatus.confirmed]),
        )

        if exclude_appointment_id is not None:
            query = query.filter(Appointment.id != exclude_appointment_id)

        appointments = query.all()

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
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)

        end = start + timedelta(minutes=duration)
        start_local = start.astimezone(LOCAL_TZ)
        end_local = end.astimezone(LOCAL_TZ)
        day_of_week = start_local.weekday()
        current_date = start_local.date()

        exception = (
            db.query(AvailabilityNutritionist)
            .filter(
                AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
                AvailabilityNutritionist.specific_date == current_date,
            )
            .first()
        )

        if exception:
            if _is_all_day(exception.start_time, exception.end_time):
                return True

            if exception.start_time is None or exception.end_time is None:
                return False

            start_exception = datetime.combine(current_date, exception.start_time, tzinfo=LOCAL_TZ)
            end_exception = datetime.combine(current_date, exception.end_time, tzinfo=LOCAL_TZ)

            in_exception = start_local >= start_exception and end_local <= end_exception

            if exception.is_available:
                if in_exception:
                    return True
            else:
                if in_exception:
                    return False

        rules = (
            db.query(AvailabilityNutritionist)
            .filter(
                AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
                AvailabilityNutritionist.day_of_week == day_of_week,
            )
            .all()
        )

        if not rules:
            return False

        for rule in rules:
            if rule.start_time is None or rule.end_time is None:
                continue

            start_rule = datetime.combine(current_date, rule.start_time, tzinfo=LOCAL_TZ)
            end_rule = datetime.combine(current_date, rule.end_time, tzinfo=LOCAL_TZ)

            if start_local >= start_rule and end_local <= end_rule:
                return True

        return False

    @staticmethod
    def create(db: Session, data: AppointmentRequest) -> AppointmentResponse:
        scheduled_at = data.scheduled_at

        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=LOCAL_TZ)

        scheduled_at = scheduled_at.astimezone(timezone.utc)

        if not AppointmentService._is_slot_available(
            db, data.nutritionist_id, scheduled_at, data.duration_min
        ):
            raise HTTPException(
                status_code=400, detail="Este horario ya está ocupado por otra cita"
            )

        if not AppointmentService.is_within_availability(
            db, data.nutritionist_id, scheduled_at, data.duration_min
        ):
            raise HTTPException(
                status_code=400,
                detail="El horario no está dentro de la disponibilidad del nutricionista",
            )

        appointment = Appointment(
            patient_id=data.patient_id,
            nutritionist_id=data.nutritionist_id,
            scheduled_at=scheduled_at,
            duration_min=data.duration_min,
            modality=data.modality,
            notes=data.notes,
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
            raise HTTPException(status_code=404, detail="Cita no encontrada")

        if data.scheduled_at:
            new_date = data.scheduled_at

            if new_date.tzinfo is None:
                new_date = new_date.replace(tzinfo=LOCAL_TZ)

            new_date = new_date.astimezone(timezone.utc)
            duration = data.duration_min or appointment.duration_min

            if not AppointmentService._is_slot_available(
                db, appointment.nutritionist_id, new_date, duration, appointment.id
            ):
                raise HTTPException(status_code=400, detail="Nuevo horario no disponible")

            if not AppointmentService.is_within_availability(
                db, appointment.nutritionist_id, new_date, duration
            ):
                raise HTTPException(
                    status_code=400, detail="El horario no está dentro de la disponibilidad"
                )

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
    def cancel(db: Session, appointment_id: uuid.UUID, user_id: uuid.UUID):
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

        if not appointment:
            raise HTTPException(status_code=404, detail="Cita no encontrada")

        appointment.status = AppointmentStatus.cancelled
        appointment.cancelled_by = user_id
        appointment.cancelled_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def get_available_slots(
        db: Session, nutritionist_id: uuid.UUID, date: date, duration_min: int = 45
    ) -> List[datetime]:
        day_of_week = date.weekday()
        slots = []

        exception = (
            db.query(AvailabilityNutritionist)
            .filter(
                AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
                AvailabilityNutritionist.specific_date == date,
            )
            .first()
        )

        if exception and not exception.is_available:
            return []

        time_ranges = []

        if exception and exception.is_available:
            if _is_all_day(exception.start_time, exception.end_time):
                time_ranges.append((ALL_DAY_START, ALL_DAY_END))
            elif exception.start_time is not None and exception.end_time is not None:
                time_ranges.append((exception.start_time, exception.end_time))
        else:
            rules = (
                db.query(AvailabilityNutritionist)
                .filter(
                    AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                    AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
                    AvailabilityNutritionist.day_of_week == day_of_week,
                )
                .all()
            )
            for rule in rules:
                if rule.start_time is not None and rule.end_time is not None:
                    time_ranges.append((rule.start_time, rule.end_time))

        for start_time, end_time in time_ranges:
            start_dt = (
                datetime.combine(date, start_time).replace(tzinfo=LOCAL_TZ).astimezone(timezone.utc)
            )
            end_dt = (
                datetime.combine(date, end_time).replace(tzinfo=LOCAL_TZ).astimezone(timezone.utc)
            )

            current = start_dt
            while current < end_dt:
                if AppointmentService._is_slot_available(
                    db, nutritionist_id, current, duration_min
                ):
                    slots.append(current)
                current += timedelta(minutes=duration_min)

        return slots

    @staticmethod
    def create_availability(
        db: Session, nutritionist_id: uuid.UUID, data: AvailabilityNutritionistRequest
    ):
        if data.rule_type == AvailabilityRuleType.recurring:
            overlap = (
                db.query(AvailabilityNutritionist)
                .filter(
                    AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                    AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
                    AvailabilityNutritionist.day_of_week == data.day_of_week,
                    AvailabilityNutritionist.start_time < data.end_time,
                    AvailabilityNutritionist.end_time > data.start_time,
                )
                .first()
            )
            if overlap:
                raise HTTPException(
                    status_code=400,
                    detail="Existe un horario que se traslapa con el rango indicado",
                )

        elif data.rule_type == AvailabilityRuleType.exception:
            overlap = (
                db.query(AvailabilityNutritionist)
                .filter(
                    AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                    AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
                    AvailabilityNutritionist.specific_date == data.specific_date,
                )
                .first()
            )
            if overlap:
                raise HTTPException(
                    status_code=400, detail="Ya existe una excepción registrada para esa fecha"
                )

        availability = AvailabilityNutritionist(
            nutritionist_id=nutritionist_id,
            rule_type=data.rule_type,
            day_of_week=data.day_of_week,
            specific_date=data.specific_date,
            start_time=data.start_time,
            end_time=data.end_time,
            is_available=data.is_available,
        )

        db.add(availability)
        db.commit()
        db.refresh(availability)

        return availability

    @staticmethod
    def update_availability(
        db: Session,
        availability_id: uuid.UUID,
        data: AvailabilityNutritionistRequest,
    ):
        availability = (
            db.query(AvailabilityNutritionist)
            .filter(AvailabilityNutritionist.id == availability_id)
            .first()
        )

        if not availability:
            raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")

        if data.rule_type == AvailabilityRuleType.recurring:
            overlap = (
                db.query(AvailabilityNutritionist)
                .filter(
                    AvailabilityNutritionist.nutritionist_id == availability.nutritionist_id,
                    AvailabilityNutritionist.id != availability.id,
                    AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
                    AvailabilityNutritionist.day_of_week == data.day_of_week,
                    AvailabilityNutritionist.start_time < data.end_time,
                    AvailabilityNutritionist.end_time > data.start_time,
                )
                .first()
            )
            if overlap:
                raise HTTPException(
                    status_code=400,
                    detail="Existe un horario que se traslapa con el rango indicado",
                )

        elif data.rule_type == AvailabilityRuleType.exception:
            overlap = (
                db.query(AvailabilityNutritionist)
                .filter(
                    AvailabilityNutritionist.nutritionist_id == availability.nutritionist_id,
                    AvailabilityNutritionist.id != availability.id,
                    AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
                    AvailabilityNutritionist.specific_date == data.specific_date,
                )
                .first()
            )
            if overlap:
                raise HTTPException(
                    status_code=400, detail="Ya existe una excepción registrada para esa fecha"
                )

        availability.rule_type = data.rule_type
        availability.day_of_week = data.day_of_week
        availability.specific_date = data.specific_date
        availability.start_time = data.start_time
        availability.end_time = data.end_time
        availability.is_available = data.is_available

        db.commit()
        db.refresh(availability)

        return availability

    @staticmethod
    def delete_availability(db: Session, availability_id: uuid.UUID):
        availability = (
            db.query(AvailabilityNutritionist)
            .filter(AvailabilityNutritionist.id == availability_id)
            .first()
        )

        if not availability:
            raise HTTPException(status_code=404, detail="Disponibilidad no encontrada")

        db.delete(availability)
        db.commit()

        return availability

    @staticmethod
    def get_availability_calendar(
        db: Session,
        nutritionist_id: uuid.UUID,
        week_start: date | None = None,
    ):
        if week_start is None:
            week_start = date.today()

        week_start = week_start - timedelta(days=week_start.weekday())
        day_keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

        days = {key: [] for key in day_keys}

        recurring_rules = (
            db.query(AvailabilityNutritionist)
            .filter(
                AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                AvailabilityNutritionist.rule_type == AvailabilityRuleType.recurring,
            )
            .order_by(AvailabilityNutritionist.day_of_week, AvailabilityNutritionist.start_time)
            .all()
        )

        for rule in recurring_rules:
            if rule.day_of_week is None:
                continue
            days[day_keys[rule.day_of_week]].append(
                {
                    "id": rule.id,
                    "nutritionist_id": rule.nutritionist_id,
                    "rule_type": rule.rule_type,
                    "day_of_week": rule.day_of_week,
                    "start_time": rule.start_time,
                    "end_time": rule.end_time,
                    "is_available": rule.is_available,
                    "all_day": _is_all_day(rule.start_time, rule.end_time),
                }
            )

        exception_rules = (
            db.query(AvailabilityNutritionist)
            .filter(
                AvailabilityNutritionist.nutritionist_id == nutritionist_id,
                AvailabilityNutritionist.rule_type == AvailabilityRuleType.exception,
                AvailabilityNutritionist.specific_date >= week_start,
                AvailabilityNutritionist.specific_date < week_start + timedelta(days=7),
            )
            .order_by(AvailabilityNutritionist.specific_date, AvailabilityNutritionist.start_time)
            .all()
        )

        exceptions = [
            {
                "id": rule.id,
                "nutritionist_id": rule.nutritionist_id,
                "rule_type": rule.rule_type,
                "specific_date": rule.specific_date,
                "day_of_week": rule.specific_date.weekday() if rule.specific_date else None,
                "start_time": rule.start_time,
                "end_time": rule.end_time,
                "is_available": rule.is_available,
                "all_day": _is_all_day(rule.start_time, rule.end_time),
            }
            for rule in exception_rules
            if rule.specific_date is not None
        ]

        return {
            "week_start": week_start,
            "days": days,
            "exceptions": exceptions,
        }
