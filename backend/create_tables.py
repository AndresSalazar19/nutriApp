from app.db.base import Base, engine
from app.db.models.patient import PatientHistory, PatientProfile

Base.metadata.create_all(
    bind=engine,
    tables=[
        PatientProfile.__table__,
        PatientHistory.__table__,
    ],
)
print("Tablas patient_profiles y patient_history creadas")
