"""Idempotent indexes for the queries the consolidated patient-detail endpoint
now runs on every load: weight history and latest anthropometric measurement,
both filtered by user_id and ordered by log_date."""

from sqlalchemy import text

from app.db.base import engine

STATEMENTS = [
    "CREATE INDEX IF NOT EXISTS ix_weight_logs_user_id_log_date "
    "ON weight_logs (user_id, log_date DESC)",
    "CREATE INDEX IF NOT EXISTS ix_anthropometric_measurements_user_id_log_date "
    "ON anthropometric_measurements (user_id, log_date DESC)",
]


def migrate() -> None:
    with engine.begin() as connection:
        for statement in STATEMENTS:
            connection.execute(text(statement))


if __name__ == "__main__":
    migrate()
    print("Índices de rendimiento listos (weight_logs, anthropometric_measurements)")
