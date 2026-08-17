from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.services.pdf.pdf_helpers import STYLES, history_table

DAY_LABELS = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
}
MEAL_TYPE_LABELS = {
    "breakfast": "Desayuno",
    "lunch": "Almuerzo",
    "snack": "Merienda",
    "dinner": "Cena",
}
MACRO_LABELS = [
    ("calories", "Kcal"),
    ("protein_g", "Proteína (g)"),
    ("carbs_g", "Carbos (g)"),
    ("fat_g", "Grasa (g)"),
    ("fiber_g", "Fibra (g)"),
    ("sugar_g", "Azúcar (g)"),
    ("sodium_mg", "Sodio (mg)"),
    ("calcium_mg", "Calcio (mg)"),
    ("iron_mg", "Hierro (mg)"),
    ("vitamin_c_mg", "Vit. C (mg)"),
    ("potassium_mg", "Potasio (mg)"),
    ("zinc_mg", "Zinc (mg)"),
    ("vitamin_a_ug", "Vit. A (µg)"),
    ("folate_ug", "Folato (µg)"),
]


def build_meal_plan_pdf(data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
    )

    story = []
    title_style = STYLES["Title"]
    heading_style = STYLES["Heading2"]
    normal_style = STYLES["Normal"]

    patient_name = f"{data['first_name']} {data['last_name']}".strip()
    story.append(Paragraph(f"Plan Alimentario - {patient_name}", title_style))
    story.append(Paragraph(data["title"], STYLES["Heading3"]))
    if data.get("description"):
        story.append(Paragraph(data["description"], normal_style))
    story.append(
        Paragraph(f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}", normal_style)
    )
    story.append(Spacer(1, 0.5 * cm))

    daily_average = data["nutrition_summary"]["daily_average"]
    story.append(Paragraph("Promedio diario del plan", heading_style))
    macro_rows = [[label, str(daily_average.get(field, "—"))] for field, label in MACRO_LABELS]
    story.append(history_table(["Nutriente", "Valor promedio/día"], macro_rows))
    story.append(Spacer(1, 0.4 * cm))

    meals_by_day: dict[int, list[dict]] = {}
    for meal in data["meals"]:
        meals_by_day.setdefault(meal["day_of_week"], []).append(meal)

    story.append(Paragraph("Comidas por día", heading_style))
    for day in sorted(meals_by_day):
        story.append(Paragraph(DAY_LABELS.get(day, str(day)), STYLES["Heading4"]))
        rows = [
            [
                MEAL_TYPE_LABELS.get(meal["meal_type"], meal["meal_type"]),
                meal["food_name"] or meal["custom_food"] or "—",
                f"{meal['quantity_g']:.0f} g" if meal.get("quantity_g") is not None else "—",
                meal.get("instructions") or "",
            ]
            for meal in meals_by_day[day]
        ]
        story.append(history_table(["Comida", "Alimento", "Cantidad", "Instrucciones"], rows))
        story.append(Spacer(1, 0.3 * cm))

    doc.build(story)
    return buffer.getvalue()
