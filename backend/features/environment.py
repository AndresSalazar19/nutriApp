import uuid

from fastapi.testclient import TestClient

from app.main import app


def before_all(context):
    context.client = TestClient(app)


def unique_suffix() -> str:
    """Sufijo corto y unico para evitar choques de cedula/email/telefono
    entre corridas repetidas de la suite (la BDD real tiene UNIQUE en esos
    campos, asi que cada escenario necesita datos nuevos)."""
    return uuid.uuid4().hex[:8]


def before_scenario(context, scenario):
    context.unique = unique_suffix()
    context.state = {}
