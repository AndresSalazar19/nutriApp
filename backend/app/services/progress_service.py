import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.orm import Session

from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.weight_log import WeightLog

PERIOD_DAYS = {"day": 1, "week": 7, "month": 30}
LOCAL_TZ = ZoneInfo("America/Bogota")


def local_today() -> date:
    return datetime.now(LOCAL_TZ).date()


def period_bounds(period: str, end_date: date) -> tuple[date, date]:
    if period not in PERIOD_DAYS:
        raise ValueError("Periodo no soportado")
    return end_date - timedelta(days=PERIOD_DAYS[period] - 1), end_date


def pressure_category(systolic: int, diastolic: int) -> str:
    if systolic < 120 and diastolic < 80:
        return "Normal"
    if systolic < 130 and diastolic < 80:
        return "Elevada"
    if systolic < 140 and diastolic < 90:
        return "Hipertension etapa 1"
    return "Hipertension etapa 2"


def date_slots(start: date, end: date) -> list[date]:
    return [start + timedelta(days=index) for index in range((end - start).days + 1)]


def weight_change(
    current: float | None, comparison: float | None
) -> tuple[float | None, float | None]:
    if current is None or comparison is None or comparison == 0:
        return None, None
    change = round(current - comparison, 2)
    return change, round((change / comparison) * 100, 2)


class ProgressService:
    @staticmethod
    def get_progress(db: Session, user_id: uuid.UUID, period: str, end_date: date) -> dict:
        start_date, end_date = period_bounds(period, end_date)
        weights = (
            db.query(WeightLog)
            .filter(
                WeightLog.user_id == user_id,
                WeightLog.log_date >= start_date,
                WeightLog.log_date <= end_date,
            )
            .order_by(WeightLog.log_date.asc())
            .all()
        )
        pressures = (
            db.query(BloodPressureLog)
            .filter(
                BloodPressureLog.user_id == user_id,
                BloodPressureLog.log_date >= start_date,
                BloodPressureLog.log_date <= end_date,
            )
            .order_by(BloodPressureLog.measured_at.asc())
            .all()
        )
        latest_pressure = (
            db.query(BloodPressureLog)
            .filter(BloodPressureLog.user_id == user_id)
            .order_by(BloodPressureLog.measured_at.desc())
            .first()
        )

        previous_weight = None
        if period == "day" and weights:
            previous_weight = (
                db.query(WeightLog)
                .filter(WeightLog.user_id == user_id, WeightLog.log_date < start_date)
                .order_by(WeightLog.log_date.desc())
                .first()
            )

        weight_values = [float(item.weight_kg) for item in weights]
        current_weight = weight_values[-1] if weight_values else None
        comparison_weight = (
            float(previous_weight.weight_kg)
            if previous_weight
            else weight_values[0]
            if len(weight_values) > 1
            else None
        )
        change, change_percent = weight_change(current_weight, comparison_weight)

        if period == "day":
            weight_series = [
                {"date": item.log_date, "label": "Hoy", "value": float(item.weight_kg)}
                for item in weights
            ]
            pressure_series = [
                {
                    "date": item.log_date,
                    "label": _time_label(item.measured_at),
                    "systolic": float(item.systolic),
                    "diastolic": float(item.diastolic),
                }
                for item in pressures
            ]
        else:
            weight_by_date = {item.log_date: float(item.weight_kg) for item in weights}
            pressure_by_date: dict[date, list[BloodPressureLog]] = defaultdict(list)
            for item in pressures:
                pressure_by_date[item.log_date].append(item)
            slots = date_slots(start_date, end_date)
            weight_series = [
                {"date": day, "label": _date_label(day), "value": weight_by_date.get(day)}
                for day in slots
            ]
            pressure_series = [
                _daily_pressure_point(day, pressure_by_date.get(day, [])) for day in slots
            ]

        pressure_summary = {
            "systolic": latest_pressure.systolic if latest_pressure else None,
            "diastolic": latest_pressure.diastolic if latest_pressure else None,
            "category": (
                pressure_category(latest_pressure.systolic, latest_pressure.diastolic)
                if latest_pressure
                else None
            ),
            "measured_on": latest_pressure.log_date if latest_pressure else None,
        }
        return {
            "user_id": user_id,
            "period": period,
            "start_date": start_date,
            "end_date": end_date,
            "weight": {
                "current_kg": current_weight,
                "change_kg": change,
                "change_percent": change_percent,
            },
            "pressure": pressure_summary,
            "weight_series": weight_series,
            "pressure_series": pressure_series,
        }


def _time_label(value: datetime | None) -> str:
    if not value:
        return "--:--"
    if value.tzinfo:
        value = value.astimezone(LOCAL_TZ)
    return value.strftime("%H:%M")


def _date_label(value: date) -> str:
    return value.strftime("%d/%m")


def _daily_pressure_point(day: date, entries: list[BloodPressureLog]) -> dict:
    if not entries:
        return {"date": day, "label": _date_label(day), "systolic": None, "diastolic": None}
    return {
        "date": day,
        "label": _date_label(day),
        "systolic": round(sum(item.systolic for item in entries) / len(entries), 1),
        "diastolic": round(sum(item.diastolic for item in entries) / len(entries), 1),
    }
