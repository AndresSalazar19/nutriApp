import json

import pytest

from app.services.nutrition_plan_helpers import AIPlanParseError, parse_ai_plan_response

FOOD_A = "11111111-1111-1111-1111-111111111111"
FOOD_B = "22222222-2222-2222-2222-222222222222"


def _payload(**overrides) -> str:
    data = {
        "title": "Plan semanal",
        "summary": "Plan balanceado",
        "meals": [
            {
                "day_of_week": 1,
                "meal_type": "breakfast",
                "food_id": FOOD_A,
                "quantity_g": 150,
                "instructions": "Comer despacio",
            }
        ],
        "blood_pressure": None,
    }
    data.update(overrides)
    return json.dumps(data)


def test_parses_valid_response() -> None:
    result = parse_ai_plan_response(_payload(), {FOOD_A, FOOD_B})

    assert result["title"] == "Plan semanal"
    assert len(result["meals"]) == 1
    assert result["meals"][0]["food_id"] == FOOD_A
    assert result["blood_pressure"] is None


def test_strips_markdown_code_fence() -> None:
    fenced = f"```json\n{_payload()}\n```"
    result = parse_ai_plan_response(fenced, {FOOD_A})

    assert len(result["meals"]) == 1


def test_malformed_json_raises() -> None:
    with pytest.raises(AIPlanParseError):
        parse_ai_plan_response("not json at all", {FOOD_A})


def test_missing_meals_key_raises() -> None:
    with pytest.raises(AIPlanParseError):
        parse_ai_plan_response(json.dumps({"title": "x"}), {FOOD_A})


def test_drops_meal_with_unknown_food_id() -> None:
    result = parse_ai_plan_response(_payload(), {FOOD_B})

    assert result["meals"] == []


def test_drops_meal_with_invalid_meal_type() -> None:
    payload = _payload(
        meals=[{"day_of_week": 1, "meal_type": "brunch", "food_id": FOOD_A, "quantity_g": 100}]
    )
    result = parse_ai_plan_response(payload, {FOOD_A})

    assert result["meals"] == []


def test_drops_meal_with_out_of_range_day() -> None:
    payload = _payload(
        meals=[{"day_of_week": 9, "meal_type": "lunch", "food_id": FOOD_A, "quantity_g": 100}]
    )
    result = parse_ai_plan_response(payload, {FOOD_A})

    assert result["meals"] == []


def test_drops_meal_with_zero_day_of_week() -> None:
    """Live DB constraint is day_of_week BETWEEN 1 AND 7 (Monday=1) — 0 must be rejected."""
    payload = _payload(
        meals=[{"day_of_week": 0, "meal_type": "lunch", "food_id": FOOD_A, "quantity_g": 100}]
    )
    result = parse_ai_plan_response(payload, {FOOD_A})

    assert result["meals"] == []


def test_extracts_valid_blood_pressure() -> None:
    payload = _payload(blood_pressure={"systolic": 120, "diastolic": 80, "pulse": 72})
    result = parse_ai_plan_response(payload, {FOOD_A})

    assert result["blood_pressure"] == {"systolic": 120, "diastolic": 80, "pulse": 72}


def test_rejects_out_of_range_blood_pressure() -> None:
    payload = _payload(blood_pressure={"systolic": 500, "diastolic": 80, "pulse": 72})
    result = parse_ai_plan_response(payload, {FOOD_A})

    assert result["blood_pressure"] is None
