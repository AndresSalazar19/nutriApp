import pytest
from pydantic import ValidationError

from app.schemas.patient import PatientHealthUpdate


def valid_payload():
    return {
        "height_m": 1.7,
        "weight_kg": 72,
        "systolic": 120,
        "diastolic": 80,
        "hypertension_diagnosed": False,
        "medications": [],
        "allergies": ["mani"],
        "dietary_restrictions": ["vegetariana"],
    }


def test_patient_health_accepts_complete_valid_profile():
    profile = PatientHealthUpdate(**valid_payload())
    assert profile.weight_kg == 72
    assert profile.allergies == ["mani"]


@pytest.mark.parametrize(
    ("field", "value"),
    [("height_m", 0.2), ("weight_kg", 0), ("systolic", 300), ("diastolic", 10)],
)
def test_patient_health_rejects_out_of_range_measurements(field, value):
    payload = valid_payload()
    payload[field] = value
    with pytest.raises(ValidationError):
        PatientHealthUpdate(**payload)


def test_patient_health_rejects_inverted_pressure():
    payload = valid_payload()
    payload.update(systolic=80, diastolic=90)
    with pytest.raises(ValidationError, match="diastolica"):
        PatientHealthUpdate(**payload)
