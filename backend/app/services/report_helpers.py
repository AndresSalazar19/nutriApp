from datetime import date, timedelta

_RANGE_DAYS = {"3m": 90, "6m": 182, "1y": 365}


def range_start_date(range_key: str, today: date | None = None) -> date:
    today = today or date.today()
    days = _RANGE_DAYS.get(range_key, _RANGE_DAYS["3m"])
    return today - timedelta(days=days)


def classify_blood_pressure(systolic: int, diastolic: int) -> str:
    if systolic < 120 and diastolic < 80:
        return "Dentro del rango normal"
    if systolic < 130 and diastolic < 80:
        return "Levemente elevado"
    if systolic < 140 or diastolic < 90:
        return "Hipertensión etapa 1"
    return "Hipertensión etapa 2"
