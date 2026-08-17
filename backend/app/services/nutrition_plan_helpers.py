import json
import re
from typing import Optional

VALID_MEAL_TYPES = {"breakfast", "lunch", "dinner", "snack"}


class AIPlanParseError(ValueError):
    pass


def _extract_json_block(raw_text: str) -> str:
    """Best-effort: strip a markdown code fence if the model added one anyway."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    return text


def _parse_blood_pressure(raw: object) -> Optional[dict]:
    if not isinstance(raw, dict):
        return None

    try:
        systolic = int(raw.get("systolic"))
        diastolic = int(raw.get("diastolic"))
    except (TypeError, ValueError):
        return None

    if not (60 <= systolic <= 260 and 40 <= diastolic <= 180):
        return None

    pulse = raw.get("pulse")
    try:
        pulse = int(pulse) if pulse is not None else None
    except (TypeError, ValueError):
        pulse = None
    if pulse is not None and not (30 <= pulse <= 220):
        pulse = None

    return {"systolic": systolic, "diastolic": diastolic, "pulse": pulse}


def parse_ai_plan_response(raw_text: str, valid_food_ids: set) -> dict:
    """Parses and validates the meal-plan JSON produced by the AI.

    Any meal referencing a food_id outside valid_food_ids, or with an invalid
    meal_type/day_of_week, is silently dropped rather than trusted — the prompt
    asks the model to stick to the provided catalog, but LLM output still needs
    to be re-checked before it's persisted.
    """
    json_text = _extract_json_block(raw_text)
    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise AIPlanParseError(f"La respuesta de la IA no es JSON válido: {exc}") from exc

    if not isinstance(data, dict):
        raise AIPlanParseError("La respuesta de la IA no es un objeto JSON.")

    raw_meals = data.get("meals")
    if not isinstance(raw_meals, list):
        raise AIPlanParseError("La respuesta de la IA no incluye una lista de comidas.")

    valid_food_ids = {str(food_id) for food_id in valid_food_ids}

    meals = []
    for meal in raw_meals:
        if not isinstance(meal, dict):
            continue

        food_id = str(meal.get("food_id") or "")
        if food_id not in valid_food_ids:
            continue

        meal_type = str(meal.get("meal_type") or "").lower()
        if meal_type not in VALID_MEAL_TYPES:
            continue

        try:
            day_of_week = int(meal.get("day_of_week"))
        except (TypeError, ValueError):
            continue
        if not 1 <= day_of_week <= 7:
            continue

        quantity_g = meal.get("quantity_g")
        try:
            quantity_g = float(quantity_g) if quantity_g is not None else None
        except (TypeError, ValueError):
            quantity_g = None

        meals.append(
            {
                "day_of_week": day_of_week,
                "meal_type": meal_type,
                "food_id": food_id,
                "quantity_g": quantity_g,
                "instructions": str(meal.get("instructions") or "").strip() or None,
            }
        )

    return {
        "title": str(data.get("title") or "Plan alimenticio generado por IA").strip(),
        "summary": str(data.get("summary") or "").strip(),
        "meals": meals,
        "blood_pressure": _parse_blood_pressure(data.get("blood_pressure")),
    }
