from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

from app.services.pdf.patient_report_pdf import RANGE_LABELS
from app.services.pdf.pdf_helpers import STYLES, history_table, trend_chart


def build_clinical_evolution_pdf(data: dict) -> bytes:
    """Superset of the progress report: same weight/BP trends plus an
    anthropometric (body composition) trend and the full clinical timeline."""
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
    story.append(Paragraph(f"Evolución Clínica - {patient_name}", title_style))
    range_label = RANGE_LABELS.get(data["range_key"], data["range_key"])
    story.append(
        Paragraph(
            f"Periodo: {range_label} · Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            normal_style,
        )
    )
    story.append(Spacer(1, 0.5 * cm))

    # ── Gráficos (su propia página, separada de las tablas) ──
    has_charts = (
        data["weight_history"]
        or data["systolic_history"]
        or data["diastolic_history"]
        or data.get("fat_percent_history")
        or data.get("muscle_mass_history")
    )
    if has_charts:
        if data["weight_history"]:
            story.append(Paragraph("Evolución del peso", heading_style))
            chart = trend_chart("Peso (kg)", [("Peso", "#16a34a", data["weight_history"])])
            if chart:
                story.append(chart)
            else:
                story.append(
                    Paragraph("Datos insuficientes para graficar esta tendencia.", normal_style)
                )
            story.append(Spacer(1, 0.4 * cm))

        if data["systolic_history"] or data["diastolic_history"]:
            story.append(Paragraph("Evolución de presión arterial", heading_style))
            chart = trend_chart(
                "Presión arterial (mmHg)",
                [
                    ("Sistólica", "#ef4444", data["systolic_history"]),
                    ("Diastólica", "#f97316", data["diastolic_history"]),
                ],
            )
            if chart:
                story.append(chart)
            else:
                story.append(
                    Paragraph("Datos insuficientes para graficar esta tendencia.", normal_style)
                )
            story.append(Spacer(1, 0.4 * cm))

        if data.get("fat_percent_history") or data.get("muscle_mass_history"):
            story.append(Paragraph("Evolución de composición corporal", heading_style))
            chart = trend_chart(
                "% Grasa / Masa muscular (kg)",
                [
                    ("% Grasa", "#8b5cf6", data.get("fat_percent_history") or []),
                    ("Masa muscular", "#0ea5e9", data.get("muscle_mass_history") or []),
                ],
            )
            if chart:
                story.append(chart)
            else:
                story.append(
                    Paragraph("Datos insuficientes para graficar esta tendencia.", normal_style)
                )

        story.append(PageBreak())

    # ── Tablas ──
    if data["history_entries"]:
        story.append(Paragraph("Historial clínico", heading_style))
        rows = [
            [entry.created_at.strftime("%d/%m/%Y"), entry.entry_type, entry.description]
            for entry in data["history_entries"]
        ]
        story.append(history_table(["Fecha", "Tipo", "Descripción"], rows))

    doc.build(story)
    return buffer.getvalue()
