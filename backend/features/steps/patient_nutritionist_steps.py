import os

from behave import given, when, then

NUTRITIONIST_EMAIL = os.environ.get(
    "ACCEPTANCE_NUTRITIONIST_EMAIL", "nutri1@nutriapp-demo.com"
)

@given("a seeded nutritionist exists")
def step_seeded_nutritionist_exists(context):
    response = context.client.get("/api/v1/nutritionists")
    assert response.status_code == 200, response.text
    nutritionists = response.json()
    match = next(
        (n for n in nutritionists if n.get("user", {}).get("email") == NUTRITIONIST_EMAIL),
        None,
    )
    assert match is not None, (
        f"No se encontro un nutricionista sembrado con email {NUTRITIONIST_EMAIL}. "
        "Ajusta ACCEPTANCE_NUTRITIONIST_EMAIL a uno real de tu BDD de pruebas."
    )
    context.state["nutritionist"] = match


@given("the patient is assigned to the seeded nutritionist")
def step_assign_patient_to_nutritionist(context):
    payload = {
        "patient_id": context.state["patient_id"],
        "nutritionist_id": context.state["nutritionist"]["user"]["id"],
    }
    response = context.client.post("/api/v1/patient_nutritionists", json=payload)
    assert response.status_code == 201, response.text


@when("the patient requests their assigned nutritionist")
def step_request_assigned_nutritionist(context):
    patient_id = context.state["patient_id"]
    response = context.client.get(
        "/api/v1/patient_nutritionists",
        params={"patient_id": patient_id, "status": "active"},
        headers={"Authorization": f"Bearer {context.state['token']}"},
    )
    assert response.status_code == 200, response.text
    context.state["assignment_entries"] = response.json()


@then("no nutritionist is returned")
def step_no_nutritionist_returned(context):
    assert context.state["assignment_entries"] == []


@then("a nutritionist is returned")
def step_nutritionist_returned(context):
    entries = context.state["assignment_entries"]
    assert len(entries) >= 1, entries
    context.state["returned_nutritionist"] = entries[0]["nutritionist"]


@then("the returned nutritionist has a first and last name")
def step_returned_nutritionist_has_name(context):
    person = context.state["returned_nutritionist"]["person"]
    assert person["first_name"], person
    assert person["last_name"], person


@then("the returned specialty matches the seeded nutritionist's specialty")
def step_returned_specialty_matches(context):
    expected = context.state["nutritionist"].get("specialty")
    actual = context.state["returned_nutritionist"]["nutritionist_profile"]["specialty"]
    assert actual is not None, "specialty llego null -- revisa uselist=False en User.nutritionist_profile"
    assert actual["id"] == expected["id"], (actual, expected)
