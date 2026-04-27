from app.db.base import engine, Base
from app.db.models.user import User, Person
from app.db.models.patient import PatientProfile, PatientHistory

Base.metadata.create_all(bind=engine, tables=[
    PatientProfile.__table__,
    PatientHistory.__table__,
])
print("Tablas patient_profiles y patient_history creadas")