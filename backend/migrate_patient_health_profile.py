"""Idempotent migration for patient medical-profile columns."""

from sqlalchemy import inspect, text

from app.db.base import engine

COLUMNS = {
    "height_m": "DOUBLE PRECISION",
    "hypertension_diagnosed": "BOOLEAN NOT NULL DEFAULT FALSE",
    "systolic": "INTEGER",
    "diastolic": "INTEGER",
    "medications": "JSON NOT NULL DEFAULT '[]'",
    "allergies": "JSON NOT NULL DEFAULT '[]'",
    "dietary_restrictions": "JSON NOT NULL DEFAULT '[]'",
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
