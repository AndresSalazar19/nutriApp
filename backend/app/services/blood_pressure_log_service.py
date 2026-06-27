import uuid

from sqlalchemy.orm import Session

from app.db.models.blood_pressure_log import BloodPressureLog
from app.schemas.blood_pressure_log import BloodPressureLogCreate


class BloodPressureLogService:

    @staticmethod
    def create(db: Session, data: BloodPressureLogCreate) -> BloodPressureLog:
        log = BloodPressureLog(
            user_id=data.user_id,
            systolic=data.systolic,
            diastolic=data.diastolic,
            pulse=data.pulse,
            log_date=data.log_date,
            notes=data.notes,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_history(db: Session, user_id: uuid.UUID, limit: int = 100):
        return (
            db.query(BloodPressureLog)
            .filter(BloodPressureLog.user_id == user_id)
            .order_by(BloodPressureLog.measured_at.desc(), BloodPressureLog.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_stats(db: Session, user_id: uuid.UUID) -> dict:
        logs = (
            db.query(BloodPressureLog)
            .filter(BloodPressureLog.user_id == user_id)
            .order_by(BloodPressureLog.measured_at.asc(), BloodPressureLog.created_at.asc())
            .all()
        )

        if not logs:
            return {
                "current_systolic": None,
                "current_diastolic": None,
                "avg_systolic": None,
                "avg_diastolic": None,
                "total_entries": 0,
            }

        systolic = [log.systolic for log in logs]
        diastolic = [log.diastolic for log in logs]
        return {
            "current_systolic": systolic[-1],
            "current_diastolic": diastolic[-1],
            "avg_systolic": round(sum(systolic) / len(systolic), 1),
            "avg_diastolic": round(sum(diastolic) / len(diastolic), 1),
            "total_entries": len(logs),
        }
