from sqlalchemy import inspect, text

from app.db.base import Base, engine
from app.db.models.blood_pressure_log import BloodPressureLog
from app.db.models.daily_tracking import DailyTrackingLog
from app.db.models.food import Food
from app.db.models.nutrition_plan import NutritionPlan
from app.db.models.nutrition_plan_meal import NutritionPlanMeal
from app.db.models.patient import PatientHistory, PatientProfile
from app.db.models.report import PatientReport
from app.db.models.user import Person, User  # noqa: F401 (registers "users" table for FKs)

Base.metadata.create_all(
    bind=engine,
    tables=[
        PatientProfile.__table__,
        PatientHistory.__table__,
        BloodPressureLog.__table__,
        DailyTrackingLog.__table__,
        PatientReport.__table__,
        Food.__table__,
        NutritionPlan.__table__,
        NutritionPlanMeal.__table__,
    ],
)


def ensure_blood_pressure_columns():
    inspector = inspect(engine)
    if "blood_pressure_logs" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("blood_pressure_logs")}
    columns_sql = {
        "user_id": "ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE",
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


def ensure_nutrition_plan_columns():
    inspector = inspect(engine)
    if "nutrition_plans" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("nutrition_plans")}
    columns_sql = {
        "status": "ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending'",
        "reviewed_by": "ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id)",
        "reviewed_at": "ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP",
        "rejection_reason": "ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
        "patient_notes": "ADD COLUMN IF NOT EXISTS patient_notes TEXT",
        "source_image_path": "ADD COLUMN IF NOT EXISTS source_image_path VARCHAR(500)",
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
            connection.execute(text(f"ALTER TABLE nutrition_plans {statement}"))


def seed_foods_from_food_items():
    """One-time backfill: nutrition_plan_meals.food_id references foods, but foods
    starts empty while food_items already holds the real, populated catalog."""
    import uuid as uuid_module
    from datetime import datetime

    inspector = inspect(engine)
    if "foods" not in inspector.get_table_names() or "food_items" not in inspector.get_table_names():
        return

    with engine.begin() as connection:
        foods_count = connection.execute(text("SELECT COUNT(*) FROM foods")).scalar()
        if foods_count:
            return

        rows = connection.execute(
            text(
                """
                SELECT name, category, calories_kcal, protein_g, carbs_g, fat_g,
                       sodium_mg, calcium_mg, vitamin_c_mg,
                       COALESCE(serving_per_unit_g, serving_per_cup_g, serving_per_tbsp_g, 100) AS serving_size_g
                FROM food_items
                WHERE is_active IS DISTINCT FROM FALSE
                """
            )
        ).mappings().all()

        if not rows:
            return

        now = datetime.utcnow()
        payload = [
            {
                "id": uuid_module.uuid4(),
                "name": row["name"],
                "category": row["category"],
                "serving_size_g": row["serving_size_g"],
                "calories": row["calories_kcal"],
                "protein_g": row["protein_g"],
                "carbs_g": row["carbs_g"],
                "fat_g": row["fat_g"],
                "sodium_mg": row["sodium_mg"],
                "calcium_mg": row["calcium_mg"],
                "vitamin_c_mg": row["vitamin_c_mg"],
                "is_ecuadorian": True,
                "is_verified": True,
                "created_at": now,
                "updated_at": now,
            }
            for row in rows
        ]

        connection.execute(
            text(
                """
                INSERT INTO foods (
                    id, name, category, serving_size_g, calories, protein_g, carbs_g, fat_g,
                    sodium_mg, calcium_mg, vitamin_c_mg, is_ecuadorian, is_verified,
                    created_at, updated_at
                )
                VALUES (
                    :id, :name, :category, :serving_size_g, :calories, :protein_g, :carbs_g, :fat_g,
                    :sodium_mg, :calcium_mg, :vitamin_c_mg, :is_ecuadorian, :is_verified,
                    :created_at, :updated_at
                )
                """
            ),
            payload,
        )


ensure_blood_pressure_columns()
ensure_nutrition_plan_columns()
seed_foods_from_food_items()

print(
    "Tablas patient_profiles, patient_history, blood_pressure_logs, daily_tracking_logs, patient_reports, "
    "foods, nutrition_plans y nutrition_plan_meals listas"
)
