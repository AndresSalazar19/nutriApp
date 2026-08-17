from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.services.pdf.pdf_helpers import STYLES, history_table


def build_soap_pdf(data: dict) -> bytes:
    """Auto-generated SOAP note: every section is derived from data that already
    exists elsewhere in the app (no dedicated SOAP-capture flow yet)."""
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
    story.append(Paragraph(f"Nota SOAP Nutricional - {patient_name}", title_style))
    story.append(
        Paragraph(f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}", normal_style)
    )
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("S — Subjetivo", heading_style))
    story.append(Paragraph(data.get("subjective") or "Sin información registrada.", normal_style))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("O — Objetivo", heading_style))
    objective = data.get("objective") or {}
    rows = [["Medida", "Valor"]]
    if objective.get("weight_kg") is not None:
        rows.append(["Peso", f"{objective['weight_kg']} kg"])
    if objective.get("height_m") is not None:
        rows.append(["Talla", f"{objective['height_m']} m"])
    if objective.get("bmi") is not None:
        rows.append(["IMC", str(objective["bmi"])])
    if objective.get("systolic") and objective.get("diastolic"):
        rows.append(["Presión arterial", f"{objective['systolic']}/{objective['diastolic']} mmHg"])
    if objective.get("fat_percent") is not None:
        rows.append(["% Grasa corporal", f"{objective['fat_percent']}%"])
    if objective.get("muscle_mass_kg") is not None:
        rows.append(["Masa muscular", f"{objective['muscle_mass_kg']} kg"])
    if len(rows) > 1:
        story.append(history_table(rows[0], rows[1:]))
    else:
        story.append(Paragraph("Sin mediciones registradas.", normal_style))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("A — Evaluación", heading_style))
    story.append(
        Paragraph(data.get("assessment") or "Sin notas clínicas registradas.", normal_style)
    )
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("P — Plan", heading_style))
    plan_summary = data.get("plan_summary")
    if plan_summary:
        story.append(Paragraph(plan_summary["title"], normal_style))
        if plan_summary.get("description"):
            story.append(Paragraph(plan_summary["description"], normal_style))
        avg = plan_summary.get("daily_average") or {}
        if avg.get("calories") is not None:
            story.append(
                Paragraph(
                    f"Promedio diario: {avg.get('calories')} kcal · "
                    f"{avg.get('protein_g')} g proteína · {avg.get('carbs_g')} g carbohidratos · "
                    f"{avg.get('fat_g')} g grasa · {avg.get('sodium_mg')} mg sodio",
                    normal_style,
                )
            )
    else:
        story.append(Paragraph("Sin plan nutricional activo.", normal_style))

    doc.build(story)
    return buffer.getvalue()
