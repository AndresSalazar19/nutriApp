from datetime import datetime
from io import BytesIO

from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.shapes import Drawing, String
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

RANGE_LABELS = {"3m": "Últimos 3 meses", "6m": "Últimos 6 meses", "1y": "Último año"}

_STYLES = getSampleStyleSheet()


def _trend_chart(title: str, series: list[tuple[str, str, list[dict]]]) -> Drawing | None:
    """series: list of (label, hex_color, points) where points are {"date","value"} dicts."""
    series = [s for s in series if s[2]]
    if not series:
        return None

    labels = [str(p["date"]) for p in series[0][2]]
    values = [[float(p["value"]) for p in points] for _, _, points in series]

    drawing = Drawing(480, 160)
    drawing.add(String(0, 145, title, fontSize=10, fontName="Helvetica-Bold"))

    chart = HorizontalLineChart()
    chart.x = 40
    chart.y = 10
    chart.width = 420
    chart.height = 120
    chart.data = values
    chart.categoryAxis.categoryNames = labels
    chart.categoryAxis.labels.fontSize = 6
    chart.categoryAxis.labels.angle = 30
    chart.categoryAxis.labels.dy = -8
    chart.valueAxis.valueMin = min(min(v) for v in values) * 0.95
    chart.valueAxis.valueMax = max(max(v) for v in values) * 1.05

    for i, (_, color, _) in enumerate(series):
        chart.lines[i].strokeColor = colors.HexColor(color)
        chart.lines[i].strokeWidth = 2

    drawing.add(chart)
    return drawing


def _history_table(headers: list[str], rows: list[list[str]]) -> Table:
    table = Table([headers] + rows, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16a34a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


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

    if data["weight_history"]:
        story.append(Paragraph("Evolución del peso", heading_style))
        chart = _trend_chart("Peso (kg)", [("Peso", "#16a34a", data["weight_history"])])
        if chart:
            story.append(chart)
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
        story.append(Spacer(1, 0.4 * cm))

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
