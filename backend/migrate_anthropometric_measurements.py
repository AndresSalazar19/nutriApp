"""Create the anthropometric_measurements table without modifying existing patient data."""

from app.db.base import Base, engine
from app.db.models.anthropometric_measurement import AnthropometricMeasurement
from app.db.models.user import User  # noqa: F401

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine, tables=[AnthropometricMeasurement.__table__])
    print("Tabla anthropometric_measurements lista")
