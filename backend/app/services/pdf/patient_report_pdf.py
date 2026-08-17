from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

from app.services.pdf.pdf_helpers import STYLES as _STYLES
from app.services.pdf.pdf_helpers import history_table as _history_table
from app.services.pdf.pdf_helpers import trend_chart as _trend_chart

RANGE_LABELS = {"3m": "Últimos 3 meses", "6m": "Últimos 6 meses", "1y": "Último año"}


def build_patient_report_pdf(data: dict) -> bytes:
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
    title_style = _STYLES["Title"]
    heading_style = _STYLES["Heading2"]
    normal_style = _STYLES["Normal"]

    patient_name = f"{data['first_name']} {data['last_name']}".strip()
    story.append(Paragraph(f"Reporte de Progreso - {patient_name}", title_style))
    range_label = RANGE_LABELS.get(data["range_key"], data["range_key"])
    story.append(
        Paragraph(
            f"Periodo: {range_label} · Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            normal_style,
        )
    )
    story.append(Spacer(1, 0.5 * cm))

    # ── Gráficos (su propia página, separada de las tablas) ──
    has_charts = data["weight_history"] or data["systolic_history"] or data["diastolic_history"]
    if has_charts:
        if data["weight_history"]:
            story.append(Paragraph("Evolución del peso", heading_style))
            chart = _trend_chart("Peso (kg)", [("Peso", "#16a34a", data["weight_history"])])
            if chart:
                story.append(chart)
            else:
                story.append(
                    Paragraph("Datos insuficientes para graficar esta tendencia.", normal_style)
                )
            story.append(Spacer(1, 0.4 * cm))

        if data["systolic_history"] or data["diastolic_history"]:
            story.append(Paragraph("Evolución de presión arterial", heading_style))
            chart = _trend_chart(
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

        story.append(PageBreak())

    # ── Tablas (todas juntas, en su propia página) ──
    stat_rows = [["Métrica", "Valor"]]
    if data["weight_lost"] is not None:
        stat_rows.append(
            ["Pérdida de peso", f"{data['weight_lost']} kg ({data['weight_lost_pct']}%)"]
        )
    if data["blood_pressure_systolic"] is not None:
        stat_rows.append(
            [
                "Presión arterial actual",
                f"{data['blood_pressure_systolic']}/{data['blood_pressure_diastolic']} mmHg "
                f"- {data['blood_pressure_note']}",
            ]
        )
    if len(stat_rows) > 1:
        story.append(_history_table(stat_rows[0], stat_rows[1:]))
        story.append(Spacer(1, 0.6 * cm))

    if data["clinical_notes"]:
        story.append(Paragraph("Notas clínicas", heading_style))
        story.append(Paragraph(data["clinical_notes"], normal_style))
        story.append(Spacer(1, 0.4 * cm))

    if data["history_entries"]:
        story.append(Paragraph("Historial clínico", heading_style))
        rows = [
            [
                entry.created_at.strftime("%d/%m/%Y"),
                entry.entry_type,
                entry.description,
            ]
            for entry in data["history_entries"]
        ]
        story.append(_history_table(["Fecha", "Tipo", "Descripción"], rows))
        story.append(Spacer(1, 0.4 * cm))

    if data["appointments"]:
        story.append(Paragraph("Citas", heading_style))
        rows = [
            [
                appt.scheduled_at.strftime("%d/%m/%Y %H:%M"),
                appt.status.value if hasattr(appt.status, "value") else str(appt.status),
                appt.modality.value if hasattr(appt.modality, "value") else str(appt.modality),
            ]
            for appt in data["appointments"]
        ]
        story.append(_history_table(["Fecha", "Estado", "Modalidad"], rows))

    doc.build(story)
    return buffer.getvalue()
