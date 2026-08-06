"""Create the daily tracking table without modifying existing patient data."""

from app.db.base import Base, engine
from app.db.models.daily_tracking import DailyTrackingLog
from app.db.models.user import User  # noqa: F401

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine, tables=[DailyTrackingLog.__table__])
    print("Tabla daily_tracking_logs lista")
