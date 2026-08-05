from datetime import date

from app.services.report_helpers import classify_blood_pressure, range_start_date


def test_range_start_date_3m() -> None:
    today = date(2026, 8, 4)
    assert range_start_date("3m", today) == date(2026, 5, 6)


def test_range_start_date_6m() -> None:
    today = date(2026, 8, 4)
    assert range_start_date("6m", today) == date(2026, 2, 3)


def test_range_start_date_1y() -> None:
    today = date(2026, 8, 4)
    assert range_start_date("1y", today) == date(2025, 8, 4)


def test_range_start_date_unknown_defaults_to_3m() -> None:
    today = date(2026, 8, 4)
    assert range_start_date("bogus", today) == range_start_date("3m", today)


def test_classify_blood_pressure_normal() -> None:
    assert classify_blood_pressure(115, 75) == "Dentro del rango normal"


def test_classify_blood_pressure_elevated() -> None:
    assert classify_blood_pressure(125, 78) == "Levemente elevado"


def test_classify_blood_pressure_stage_1() -> None:
    assert classify_blood_pressure(135, 85) == "Hipertensión etapa 1"


def test_classify_blood_pressure_stage_2() -> None:
    assert classify_blood_pressure(150, 95) == "Hipertensión etapa 2"
