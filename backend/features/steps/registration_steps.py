from behave import given, when, then

from common_steps import _registration_payload


@given("a patient is already registered with unique identity data")
def step_register_baseline_patient(context):
    payload = _registration_payload(context.unique)
    response = context.client.post("/api/v1/users/", json=payload)
    assert response.status_code == 200, response.text
    context.state["existing_patient"] = payload


@when("a new patient attempts to register reusing the existing email")
def step_register_duplicate_email(context):
    existing = context.state["existing_patient"]
    other_unique = context.unique + "b"
    payload = _registration_payload(other_unique, email=existing["email"])
    context.state["response"] = context.client.post("/api/v1/users/", json=payload)


@when("a new patient attempts to register reusing the existing cedula")
def step_register_duplicate_cedula(context):
    existing = context.state["existing_patient"]
    other_unique = context.unique + "c"
    payload = _registration_payload(other_unique, cedula=existing["cedula"])
    context.state["response"] = context.client.post("/api/v1/users/", json=payload)


@when("a new patient attempts to register reusing the existing phone")
def step_register_duplicate_phone(context):
    existing = context.state["existing_patient"]
    other_unique = context.unique + "d"
    payload = _registration_payload(other_unique, phone=existing["phone"])
    context.state["response"] = context.client.post("/api/v1/users/", json=payload)


@when("a new patient attempts to register with entirely new identity data")
def step_register_unique(context):
    payload = _registration_payload(context.unique + "e")
    context.state["response"] = context.client.post("/api/v1/users/", json=payload)


@then('the registration is rejected with field "{field}"')
def step_registration_rejected(context, field):
    response = context.state["response"]
    assert response.status_code == 400, response.text
    body = response.json()
    assert body.get("field") == field, body


@then("the registration succeeds")
def step_registration_succeeds(context):
    response = context.state["response"]
    assert response.status_code == 200, response.text


@then("the response includes an access token")
def step_response_has_token(context):
    body = context.state["response"].json()
    data = body.get("data", body)
    assert data.get("access_token"), body
