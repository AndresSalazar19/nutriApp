from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models.weight_log import WeightLog
from app.schemas.weight_log import WeightLogCreate
from datetime import date
import uuid


class WeightLogService:

    @staticmethod
    def create(db: Session, data: WeightLogCreate) -> WeightLog:
        existing = db.query(WeightLog).filter(
            WeightLog.user_id == data.user_id,
            WeightLog.log_date == data.log_date,
        ).first()

        if existing:
            existing.weight_kg = data.weight_kg
            existing.notes = data.notes
            db.commit()
            db.refresh(existing)
            return existing

        log = WeightLog(
            user_id=data.user_id,
            weight_kg=data.weight_kg,
            log_date=data.log_date,
            notes=data.notes,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_history(db: Session, user_id: uuid.UUID, limit: int = 100):
        return db.query(WeightLog).filter(
            WeightLog.user_id == user_id
        ).order_by(WeightLog.log_date.desc()).limit(limit).all()

    @staticmethod
    def get_stats(db: Session, user_id: uuid.UUID) -> dict:
        logs = db.query(WeightLog).filter(
            WeightLog.user_id == user_id
        ).order_by(WeightLog.log_date.asc()).all()

        if not logs:
            return {
                "current_weight": None,
                "min_weight": None,
                "max_weight": None,
                "total_entries": 0,
                "weight_change": None,
            }

        weights = [float(log.weight_kg) for log in logs]
        return {
            "current_weight": weights[-1],
            "min_weight": min(weights),
            "max_weight": max(weights),
            "total_entries": len(weights),
            "weight_change": round(weights[-1] - weights[0], 2),
        }

    @staticmethod
    def delete(db: Session, log_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        log = db.query(WeightLog).filter(
            WeightLog.id == log_id,
            WeightLog.user_id == user_id,
        ).first()
        if not log:
            return False
        db.delete(log)
        db.commit()
        return True