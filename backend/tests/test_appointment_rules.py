import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.db.models.appointment import AppointmentStatus, AppointmentTypeModality
from app.schemas.appointment import AppointmentRequest
from app.services.appointment_service import AppointmentService


class FakeQuery:
    def __init__(self, value):
        self.value = value

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.value


class FakeDb:
    def __init__(self, value=None):
        self.value = value
        self.committed = False

    def query(self, *args, **kwargs):
        return FakeQuery(self.value)

    def commit(self):
        self.committed = True

    def refresh(self, value):
        return None


def appointment_request(scheduled_at: datetime) -> AppointmentRequest:
    return AppointmentRequest(
        patient_id=uuid.uuid4(),
        nutritionist_id=uuid.uuid4(),
        scheduled_at=scheduled_at,
        duration_min=45,
        modality=AppointmentTypeModality.virtual,
        notes="Control nutricional",
    )


def test_create_rejects_past_appointment_before_availability_checks():
    with pytest.raises(HTTPException, match="pasado"):
        AppointmentService.create(
            FakeDb(), appointment_request(datetime.now(timezone.utc) - timedelta(minutes=1))
        )


def test_create_requires_the_assigned_nutritionist():
    with pytest.raises(HTTPException, match="asignado"):
        AppointmentService.create(
            FakeDb(), appointment_request(datetime.now(timezone.utc) + timedelta(days=2))
        )


def test_cancel_rejects_appointment_inside_24_hours():
    appointment = SimpleNamespace(
        scheduled_at=datetime.now(timezone.utc) + timedelta(hours=23),
        status=AppointmentStatus.scheduled,
        cancelled_by=None,
        cancelled_at=None,
    )
    db = FakeDb(appointment)

    with pytest.raises(HTTPException, match="24 horas"):
        AppointmentService.cancel(db, uuid.uuid4(), uuid.uuid4())

    assert appointment.status == AppointmentStatus.scheduled
    assert not db.committed


def test_cancel_allows_appointment_more_than_24_hours_away():
    appointment = SimpleNamespace(
        scheduled_at=datetime.now(timezone.utc) + timedelta(hours=25),
        status=AppointmentStatus.scheduled,
        cancelled_by=None,
        cancelled_at=None,
    )
    db = FakeDb(appointment)
    user_id = uuid.uuid4()

    AppointmentService.cancel(db, uuid.uuid4(), user_id)

    assert appointment.status == AppointmentStatus.cancelled
    assert appointment.cancelled_by == user_id
    assert appointment.cancelled_at is not None
    assert db.committed
