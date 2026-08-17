"""Idempotent migration for the extended onboarding clinical-history columns.

Adds `activity_level` (nivel de actividad laboral) and `clinical_history`
(antecedentes personales/familiares + historia alimentaria, stored as JSON)
to `patient_profiles`. Same pattern as migrate_patient_health_profile.py.
"""

from sqlalchemy import inspect, text

from app.db.base import engine

COLUMNS = {
    "activity_level": "VARCHAR(20)",
    "clinical_history": "JSON NOT NULL DEFAULT '{}'",
}


def migrate() -> list[str]:
    inspector = inspect(engine)
    if "patient_profiles" not in inspector.get_table_names():
        raise RuntimeError("La tabla patient_profiles no existe; ejecuta create_tables.py primero")
    existing = {column["name"] for column in inspector.get_columns("patient_profiles")}
    added: list[str] = []
    with engine.begin() as connection:
        for name, definition in COLUMNS.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE patient_profiles ADD COLUMN {name} {definition}"))
                added.append(name)
    return added


if __name__ == "__main__":
    migrated = migrate()
    print("Columnas agregadas: " + ", ".join(migrated) if migrated else "La migracion ya estaba aplicada")
