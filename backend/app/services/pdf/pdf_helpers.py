from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.shapes import Drawing, String
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Table, TableStyle

STYLES = getSampleStyleSheet()


def trend_chart(title: str, series: list[tuple[str, str, list[dict]]]) -> Drawing | None:
    """series: list of (label, hex_color, points) where points are {"date","value"} dicts.

    Returns None when there's nothing to plot, OR when there's only a single
    point — a line chart can't draw a trend from one value, and rendering an
    axis with no visible line just looks broken/empty to the reader.
    """
    series = [s for s in series if s[2]]
    if not series:
        return None

    labels = [str(p["date"]) for p in series[0][2]]
    if len(labels) < 2:
        return None
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


def history_table(headers: list[str], rows: list[list[str]]) -> Table:
    # repeatRows=1 re-draws the header row on the next page when a long table
    # splits — without it, a continued table just resumes mid-data with no
    # column labels, which is what made the history table look "cut off".
    table = Table([headers] + rows, hAlign="LEFT", repeatRows=1)
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
