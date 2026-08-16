import hashlib

from behave import given


def _digits_from(unique: str, length: int) -> str:
    """Convierte cualquier string en una secuencia de puros dígitos de largo
    fijo, sensible a CUALQUIER cambio en el string de entrada (a diferencia
    de un slice simple, que ignora cambios fuera de la ventana recortada)."""
    digest = hashlib.sha256(unique.encode()).hexdigest()
    digits = "".join(c for c in digest if c.isdigit())
    while len(digits) < length:
        digits += digits
    return digits[:length]


def _registration_payload(unique: str, *, email=None, cedula=None, phone=None):
    return {
        "email": email or f"acceptance.{unique}@nutriapp-demo.com",
        "password": "AcceptanceTest123!",
        "first_name": "Acceptance",
        "last_name": f"Test{unique}",
        "cedula": cedula or f"9{_digits_from(unique, 9)}",
        "phone": phone or f"09{_digits_from(unique, 8)}",
        "date_of_birth": "1990-01-01",
        "gender": "femenino",
        "role": "patient",
    }


@given("a patient is registered and authenticated")
def step_patient_registered_and_authenticated(context):
    payload = _registration_payload(context.unique)
    response = context.client.post("/api/v1/users/", json=payload)
    assert response.status_code == 200, response.text

    # OJO: el usuario viene ANIDADO dentro de "user", no en la raíz de "data"
    # -- ver la forma real de la respuesta de POST /users/ en users.py.
    data = response.json()["data"]
    context.state["user_id"] = data["user"]["id"]
    context.state["patient_id"] = data["user"]["id"]
    context.state["token"] = data["access_token"]