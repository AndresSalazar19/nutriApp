import pytest
from pydantic import ValidationError

from app.schemas.daily_tracking import CalorieLogCreate, HydrationLogCreate


def test_hydration_accepts_supported_glass_volume():
    payload = HydrationLogCreate(
        user_id="00000000-0000-0000-0000-000000000001",
        amount_ml=350,
        log_date="2026-08-05",
    )
    assert payload.amount_ml == 350


@pytest.mark.parametrize("amount", [0, 49, 3001])
def test_hydration_rejects_invalid_volume(amount):
    with pytest.raises(ValidationError):
        HydrationLogCreate(
            user_id="00000000-0000-0000-0000-000000000001",
            amount_ml=amount,
            log_date="2026-08-05",
        )


def test_calories_require_positive_reasonable_value():
    with pytest.raises(ValidationError):
        CalorieLogCreate(
            user_id="00000000-0000-0000-0000-000000000001",
            calories=0,
            log_date="2026-08-05",
        )
