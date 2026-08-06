import uuid
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models.daily_tracking import DailyTrackingLog
from app.schemas.daily_tracking import CalorieLogCreate, HydrationLogCreate


class DailyTrackingService:
    @staticmethod
    def create_hydration(db: Session, data: HydrationLogCreate) -> DailyTrackingLog:
        log = DailyTrackingLog(
            user_id=data.user_id,
            metric_type="hydration",
            amount=data.amount_ml,
            log_date=data.log_date,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def create_calories(db: Session, data: CalorieLogCreate, metric_type: str) -> DailyTrackingLog:
        log = DailyTrackingLog(
            user_id=data.user_id,
            metric_type=metric_type,
            amount=data.calories,
            log_date=data.log_date,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_summary(db: Session, user_id: uuid.UUID, log_date: date) -> dict:
        rows = (
            db.query(
                DailyTrackingLog.metric_type,
                func.coalesce(func.sum(DailyTrackingLog.amount), 0),
                func.count(DailyTrackingLog.id),
            )
            .filter(DailyTrackingLog.user_id == user_id, DailyTrackingLog.log_date == log_date)
            .group_by(DailyTrackingLog.metric_type)
            .all()
        )
        values = {metric: (int(total), int(count)) for metric, total, count in rows}
        return {
            "log_date": log_date,
            "hydration_ml": values.get("hydration", (0, 0))[0],
            "consumed_calories": values.get("calories_consumed", (0, 0))[0],
            "burned_calories": values.get("calories_burned", (0, 0))[0],
        }
