"""Idempotent migration for the PatientReport.report_type column."""

from sqlalchemy import inspect, text

from app.db.base import engine

COLUMNS = {
    "report_type": "VARCHAR(30) NOT NULL DEFAULT 'progress'",
}


def migrate() -> list[str]:
    inspector = inspect(engine)
    if "patient_reports" not in inspector.get_table_names():
        raise RuntimeError("La tabla patient_reports no existe; ejecuta create_tables.py primero")
    existing = {column["name"] for column in inspector.get_columns("patient_reports")}
    added: list[str] = []
    with engine.begin() as connection:
        for name, definition in COLUMNS.items():
            if name not in existing:
                connection.execute(
                    text(f"ALTER TABLE patient_reports ADD COLUMN {name} {definition}")
                )
                added.append(name)
    return added


if __name__ == "__main__":
    migrated = migrate()
    print(
        "Columnas agregadas: " + ", ".join(migrated)
        if migrated
        else "La migracion ya estaba aplicada"
    )
