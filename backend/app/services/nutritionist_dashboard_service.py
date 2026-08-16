from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models.appointment import Appointment, AppointmentStatus
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.conversations import Conversation, ConversationType
from app.db.models.daily_tracking import DailyTrackingLog
from app.db.models.message import Message
from app.db.models.patient import PatientProfile, PatientStatus
from app.db.models.patient_nutritionist import PatientNutritionist
from app.db.models.subscription import Subscription
from app.db.models.user import Person, User
from app.db.models.weight_log import WeightLog

WEEK_DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]


def _adherence_pct(
    log_days: dict[uuid.UUID, set[date]], patient_ids: list[uuid.UUID], start: date, end: date
) -> float | None:
    if not patient_ids:
        return None

    total_days = (end - start).days + 1
    if total_days <= 0:
        return None

    percentages = [
        len({d for d in log_days.get(pid, set()) if start <= d <= end}) / total_days * 100
        for pid in patient_ids
    ]
    return round(sum(percentages) / len(percentages), 1)


class NutritionistDashboardService:
    @staticmethod
    def get_unread_messages_count(db: Session, nutritionist_id: uuid.UUID) -> int:
        return (
            db.query(func.count(Message.id))
            .join(Conversation, Message.conversation_id == Conversation.id)
            .filter(
                Conversation.nutritionist_id == nutritionist_id,
                Conversation.conversation_type == ConversationType.human,
                Message.sender_id != nutritionist_id,
                Message.read_at.is_(None),
            )
            .scalar()
        )

    @staticmethod
    def get_dashboard(db: Session, nutritionist_id: uuid.UUID) -> dict:
        today = date.today()
        month_start = today.replace(day=1)
        prev_month_end = month_start - timedelta(days=1)
        prev_month_start = prev_month_end.replace(day=1)
        week_start = today - timedelta(days=6)
        range_start = min(prev_month_start, week_start)

        patient_rows = (
            db.query(PatientNutritionist.patient_id, PatientNutritionist.assigned_at)
            .filter(
                PatientNutritionist.nutritionist_id == nutritionist_id,
                PatientNutritionist.is_active.is_(True),
            )
            .all()
        )
        patient_ids = [row[0] for row in patient_rows]
        patients_new_this_month = sum(
            1
            for _, assigned_at in patient_rows
            if (assigned_at.date() if isinstance(assigned_at, datetime) else assigned_at)
            >= month_start
        )

        log_days: dict[uuid.UUID, set[date]] = defaultdict(set)
        weight_by_day: dict[date, list[float]] = defaultdict(list)
        pressure_by_day: dict[date, list[int]] = defaultdict(list)

        if patient_ids:
            for user_id, log_date, weight_kg in db.query(
                WeightLog.user_id, WeightLog.log_date, WeightLog.weight_kg
            ).filter(
                WeightLog.user_id.in_(patient_ids),
                WeightLog.log_date >= range_start,
                WeightLog.log_date <= today,
            ):
                log_days[user_id].add(log_date)
                if log_date >= week_start:
                    weight_by_day[log_date].append(float(weight_kg))

            for user_id, log_date, systolic in db.query(
                BloodPressureLog.user_id, BloodPressureLog.log_date, BloodPressureLog.systolic
            ).filter(
                BloodPressureLog.user_id.in_(patient_ids),
                BloodPressureLog.log_date >= range_start,
                BloodPressureLog.log_date <= today,
            ):
                log_days[user_id].add(log_date)
                if log_date >= week_start:
                    pressure_by_day[log_date].append(systolic)

            for user_id, log_date in db.query(
                DailyTrackingLog.user_id, DailyTrackingLog.log_date
            ).filter(
                DailyTrackingLog.user_id.in_(patient_ids),
                DailyTrackingLog.log_date >= range_start,
                DailyTrackingLog.log_date <= today,
            ):
                log_days[user_id].add(log_date)

        stats = NutritionistDashboardService._build_stats(
            db,
            nutritionist_id,
            patient_ids,
            patients_new_this_month,
            log_days,
            today,
            month_start,
            prev_month_start,
            prev_month_end,
        )
        weekly_progress = NutritionistDashboardService._build_weekly_progress(
            patient_ids, log_days, weight_by_day, pressure_by_day, week_start
        )
        recent_patients = NutritionistDashboardService._build_recent_patients(
            db, nutritionist_id, patient_ids
        )

        return {
            "stats": stats,
            "weekly_progress": weekly_progress,
            "recent_patients": recent_patients,
        }

    @staticmethod
    def _build_stats(
        db: Session,
        nutritionist_id: uuid.UUID,
        patient_ids: list[uuid.UUID],
        patients_new_this_month: int,
        log_days: dict[uuid.UUID, set[date]],
        today: date,
        month_start: date,
        prev_month_start: date,
        prev_month_end: date,
    ) -> dict:
        today_start = datetime.combine(today, datetime.min.time())
        today_end = today_start + timedelta(days=1)
        appointments_today_total, appointments_today_pending = (
            db.query(
                func.count(Appointment.id),
                func.count(Appointment.id).filter(
                    Appointment.status == AppointmentStatus.scheduled
                ),
            )
            .filter(
                Appointment.nutritionist_id == nutritionist_id,
                Appointment.scheduled_at >= today_start,
                Appointment.scheduled_at < today_end,
                Appointment.status != AppointmentStatus.cancelled,
            )
            .one()
        )

        unread_messages = NutritionistDashboardService.get_unread_messages_count(
            db, nutritionist_id
        )

        adherence_this_month = _adherence_pct(log_days, patient_ids, month_start, today)
        adherence_last_month = _adherence_pct(
            log_days, patient_ids, prev_month_start, prev_month_end
        )
        adherence_delta = (
            round(adherence_this_month - adherence_last_month, 1)
            if adherence_this_month is not None and adherence_last_month is not None
            else None
        )

        return {
            "patients_active_total": len(patient_ids),
            "patients_new_this_month": patients_new_this_month,
            "appointments_today_total": appointments_today_total,
            "appointments_today_pending": appointments_today_pending,
            "unread_messages": unread_messages,
            "average_adherence": adherence_this_month,
            "adherence_delta_vs_last_month": adherence_delta,
        }

    @staticmethod
    def _build_weekly_progress(
        patient_ids: list[uuid.UUID],
        log_days: dict[uuid.UUID, set[date]],
        weight_by_day: dict[date, list[float]],
        pressure_by_day: dict[date, list[int]],
        week_start: date,
    ) -> list[dict]:
        if not patient_ids:
            return [
                {"dia": label, "adherencia": 0, "peso": None, "presion": None}
                for label in WEEK_DAY_LABELS
            ]

        result = []
        for offset in range(7):
            day = week_start + timedelta(days=offset)
            patients_logged = sum(1 for pid in patient_ids if day in log_days.get(pid, set()))
            day_weights = weight_by_day.get(day)
            day_pressures = pressure_by_day.get(day)
            result.append(
                {
                    "dia": WEEK_DAY_LABELS[day.weekday()],
                    "adherencia": round(patients_logged / len(patient_ids) * 100),
                    "peso": round(sum(day_weights) / len(day_weights), 1) if day_weights else None,
                    "presion": (
                        round(sum(day_pressures) / len(day_pressures)) if day_pressures else None
                    ),
                }
            )

        return result

    @staticmethod
    def _build_recent_patients(
        db: Session, nutritionist_id: uuid.UUID, patient_ids: list[uuid.UUID], limit: int = 4
    ) -> list[dict]:
        if not patient_ids:
            return []

        last_appointment = (
            db.query(
                Appointment.patient_id.label("patient_id"),
                func.max(Appointment.scheduled_at).label("last_at"),
            )
            .filter(
                Appointment.patient_id.in_(patient_ids),
                Appointment.nutritionist_id == nutritionist_id,
                Appointment.scheduled_at <= datetime.now(timezone.utc),
                Appointment.status != AppointmentStatus.cancelled,
            )
            .group_by(Appointment.patient_id)
            .subquery()
        )

        rows = (
            db.query(User, Person, PatientProfile.status, last_appointment.c.last_at)
            .join(Person, Person.user_id == User.id)
            .outerjoin(PatientProfile, PatientProfile.user_id == User.id)
            .outerjoin(last_appointment, last_appointment.c.patient_id == User.id)
            .filter(User.id.in_(patient_ids))
            .order_by(last_appointment.c.last_at.desc().nulls_last())
            .limit(limit)
            .all()
        )

        return [
            {
                "id": str(user.id),
                "name": f"{person.first_name} {person.last_name}".strip(),
                "last_consult": last_at.isoformat() if last_at else None,
                "status": (status or PatientStatus.active).value,
            }
            for user, person, status, last_at in rows
        ]

    @staticmethod
    def get_patients_list(db: Session, nutritionist_id: uuid.UUID) -> list[dict]:
        rows = (
            db.query(User, Person, PatientProfile.status)
            .join(PatientNutritionist, PatientNutritionist.patient_id == User.id)
            .join(Person, Person.user_id == User.id)
            .outerjoin(PatientProfile, PatientProfile.user_id == User.id)
            .filter(
                PatientNutritionist.nutritionist_id == nutritionist_id,
                PatientNutritionist.is_active.is_(True),
            )
            .all()
        )
        if not rows:
            return []

        patient_ids = [user.id for user, _, _ in rows]
        today = date.today()
        month_start = today.replace(day=1)
        now = datetime.now(timezone.utc)

        log_days: dict[uuid.UUID, set[date]] = defaultdict(set)
        for model in (WeightLog, BloodPressureLog, DailyTrackingLog):
            for user_id, log_date in db.query(model.user_id, model.log_date).filter(
                model.user_id.in_(patient_ids),
                model.log_date >= month_start,
                model.log_date <= today,
            ):
                log_days[user_id].add(log_date)

        last_consult: dict[uuid.UUID, datetime] = dict(
            db.query(Appointment.patient_id, func.max(Appointment.scheduled_at))
            .filter(
                Appointment.patient_id.in_(patient_ids),
                Appointment.nutritionist_id == nutritionist_id,
                Appointment.scheduled_at <= now,
                Appointment.status != AppointmentStatus.cancelled,
            )
            .group_by(Appointment.patient_id)
        )
        next_appointment: dict[uuid.UUID, datetime] = dict(
            db.query(Appointment.patient_id, func.min(Appointment.scheduled_at))
            .filter(
                Appointment.patient_id.in_(patient_ids),
                Appointment.nutritionist_id == nutritionist_id,
                Appointment.scheduled_at > now,
                Appointment.status != AppointmentStatus.cancelled,
            )
            .group_by(Appointment.patient_id)
        )
        plan_by_patient: dict[uuid.UUID, str] = dict(
            db.query(Subscription.user_id, Subscription.plan).filter(
                Subscription.user_id.in_(patient_ids)
            )
        )

        result = []
        for user, person, status in rows:
            age = None
            if person.date_of_birth:
                age = today.year - person.date_of_birth.year
                if (today.month, today.day) < (
                    person.date_of_birth.month,
                    person.date_of_birth.day,
                ):
                    age -= 1

            adherence = _adherence_pct(log_days, [user.id], month_start, today)
            plan_value = plan_by_patient.get(user.id)

            result.append(
                {
                    "id": str(user.id),
                    "first_name": person.first_name,
                    "last_name": person.last_name,
                    "email": user.email,
                    "phone": person.phone,
                    "gender": person.gender.value if person.gender else None,
                    "age": age,
                    "status": (status or PatientStatus.active).value,
                    "plan": plan_value.value if plan_value else "free",
                    "adherence": round(adherence) if adherence is not None else 0,
                    "last_consult": (
                        last_consult[user.id].isoformat() if user.id in last_consult else None
                    ),
                    "next_appointment": (
                        next_appointment[user.id].isoformat()
                        if user.id in next_appointment
                        else None
                    ),
                }
            )

        return result
