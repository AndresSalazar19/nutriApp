"""Idempotent migration for the extra Food micronutrient columns."""

from sqlalchemy import inspect, text

from app.db.base import engine

COLUMNS = {
    "potassium_mg": "NUMERIC(7, 2)",
    "zinc_mg": "NUMERIC(7, 2)",
    "vitamin_a_ug": "NUMERIC(7, 2)",
    "folate_ug": "NUMERIC(7, 2)",
}


def migrate() -> list[str]:
    inspector = inspect(engine)
    if "foods" not in inspector.get_table_names():
        raise RuntimeError("La tabla foods no existe; ejecuta create_tables.py primero")
    existing = {column["name"] for column in inspector.get_columns("foods")}
    added: list[str] = []
    with engine.begin() as connection:
        for name, definition in COLUMNS.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE foods ADD COLUMN {name} {definition}"))
                added.append(name)
    return added


if __name__ == "__main__":
    migrated = migrate()
    print("Columnas agregadas: " + ", ".join(migrated) if migrated else "La migracion ya estaba aplicada")
