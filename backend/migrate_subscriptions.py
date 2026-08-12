"""Create the subscriptions table on a fresh DB. No-op if it already exists —
on the shared dev DB this table was already live (2 rows) before this change;
the model here was adjusted to match that existing schema exactly."""

from app.db.base import Base, engine
from app.db.models.subscription import Subscription
from app.db.models.user import User  # noqa: F401

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine, tables=[Subscription.__table__])
    print("Tabla subscriptions lista")
