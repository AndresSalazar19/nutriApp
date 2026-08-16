from behave import given, when, then

VISUAL_TO_BILLING_PLAN = {
    "basic": "free",
    "standard": "basic",
    "premium": "premium",
}


def _auth_headers(context):
    return {"Authorization": f"Bearer {context.state['token']}"}


@given('the patient already subscribed to the "{visual_plan}" plan')
def step_patient_already_subscribed(context, visual_plan):
    billing_plan = VISUAL_TO_BILLING_PLAN[visual_plan]
    user_id = context.state["user_id"]
    response = context.client.post(
        f"/api/v1/users/{user_id}/subscription",
        json={"plan": billing_plan},
        headers=_auth_headers(context),
    )
    assert response.status_code == 200, response.text
    context.state["first_subscription_id"] = response.json()["data"]["id"]


@when('the patient subscribes to the "{visual_plan}" plan')
def step_patient_subscribes(context, visual_plan):
    billing_plan = VISUAL_TO_BILLING_PLAN[visual_plan]
    user_id = context.state["user_id"]
    context.state["response"] = context.client.post(
        f"/api/v1/users/{user_id}/subscription",
        json={"plan": billing_plan},
        headers=_auth_headers(context),
    )


@then("the subscription is created successfully")
def step_subscription_created(context):
    assert context.state["response"].status_code == 200, context.state["response"].text


@then('the stored plan value is "{billing_plan}"')
def step_stored_plan_value(context, billing_plan):
    body = context.state["response"].json()
    data = body.get("data", body)
    assert data["plan"] == billing_plan, data


@then('the subscription status is "{status}"')
def step_subscription_status(context, status):
    body = context.state["response"].json()
    data = body.get("data", body)
    assert data["status"] == status, data


@then("the patient has exactly one subscription record")
def step_single_subscription_record(context):
    new_id = context.state["response"].json()["data"]["id"]
    assert new_id == context.state["first_subscription_id"], (
        new_id,
        context.state["first_subscription_id"],
    )
