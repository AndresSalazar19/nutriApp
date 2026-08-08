from datetime import date

import pytest

from app.services.progress_service import (
    date_slots,
    period_bounds,
    pressure_category,
    weight_change,
)


@pytest.mark.parametrize(
    ("period", "expected_start"),
    [("day", date(2026, 8, 5)), ("week", date(2026, 7, 30)), ("month", date(2026, 7, 7))],
)
def test_period_bounds(period, expected_start):
    assert period_bounds(period, date(2026, 8, 5)) == (expected_start, date(2026, 8, 5))


def test_period_bounds_rejects_unknown_period():
    with pytest.raises(ValueError):
        period_bounds("year", date(2026, 8, 5))


def test_date_slots_include_start_and_end():
    slots = date_slots(date(2026, 8, 1), date(2026, 8, 3))
    assert slots == [date(2026, 8, 1), date(2026, 8, 2), date(2026, 8, 3)]


def test_weight_change_returns_value_and_percentage():
    assert weight_change(73.5, 75.0) == (-1.5, -2.0)


def test_weight_change_requires_two_measurements():
    assert weight_change(73.5, None) == (None, None)


@pytest.mark.parametrize(
    ("systolic", "diastolic", "category"),
    [
        (110, 70, "Normal"),
        (125, 75, "Elevada"),
        (135, 85, "Hipertension etapa 1"),
        (145, 80, "Hipertension etapa 2"),
    ],
)
def test_pressure_category(systolic, diastolic, category):
    assert pressure_category(systolic, diastolic) == category
