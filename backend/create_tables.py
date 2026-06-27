from app.db.base import Base, engine
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.patient import PatientHistory, PatientProfile
from sqlalchemy import inspect, text

Base.metadata.create_all(
    bind=engine,
    tables=[
        PatientProfile.__table__,
        PatientHistory.__table__,
        BloodPressureLog.__table__,
    ],
)
def ensure_blood_pressure_columns():
    inspector = inspect(engine)
    if "blood_pressure_logs" not in inspector.get_table_names():
        return

    existing_columns = {
        column["name"] for column in inspector.get_columns("blood_pressure_logs")
    }
    columns_sql = {
        "user_id": 'ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE',
        "systolic": "ADD COLUMN IF NOT EXISTS systolic INTEGER",
        "diastolic": "ADD COLUMN IF NOT EXISTS diastolic INTEGER",
        "pulse": "ADD COLUMN IF NOT EXISTS pulse INTEGER",
        "log_date": "ADD COLUMN IF NOT EXISTS log_date DATE",
        "measured_at": "ADD COLUMN IF NOT EXISTS measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
        "notes": "ADD COLUMN IF NOT EXISTS notes TEXT",
        "created_at": "ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
    }

    missing_statements = [
        statement
        for column_name, statement in columns_sql.items()
        if column_name not in existing_columns
    ]
    if not missing_statements:
        return

    with engine.begin() as connection:
        for statement in missing_statements:
            connection.execute(text(f"ALTER TABLE blood_pressure_logs {statement}"))
        connection.execute(
            text("ALTER TABLE blood_pressure_logs ALTER COLUMN measured_at SET DEFAULT NOW()")
        )
        connection.execute(
            text("ALTER TABLE blood_pressure_logs ALTER COLUMN created_at SET DEFAULT NOW()")
        )


ensure_blood_pressure_columns()

print("Tablas patient_profiles, patient_history y blood_pressure_logs listas")
