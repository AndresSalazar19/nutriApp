from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from app.services.pdf.pdf_helpers import STYLES, history_table


def build_clinical_history_pdf(data: dict) -> bytes:
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
    story.append(Paragraph(f"Historia Clínica - {patient_name}", title_style))
    story.append(
        Paragraph(f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')}", normal_style)
    )
    story.append(Spacer(1, 0.5 * cm))

    demo_rows = [["Dato", "Valor"]]
    if data.get("cedula"):
        demo_rows.append(["Cédula", data["cedula"]])
    if data.get("date_of_birth"):
        demo_rows.append(["Fecha de nacimiento", str(data["date_of_birth"])])
    if data.get("gender"):
        demo_rows.append(["Género", data["gender"]])
    if data.get("phone"):
        demo_rows.append(["Teléfono", data["phone"]])
    if len(demo_rows) > 1:
        story.append(Paragraph("Datos personales", heading_style))
        story.append(history_table(demo_rows[0], demo_rows[1:]))
        story.append(Spacer(1, 0.4 * cm))

    clinical_rows = [["Dato", "Valor"]]
    clinical_rows.append(
        [
            "Hipertensión",
            "Diagnosticada" if data.get("hypertension_diagnosed") else "No diagnosticada",
        ]
    )
    if data.get("systolic") and data.get("diastolic"):
        clinical_rows.append(["Presión arterial", f"{data['systolic']}/{data['diastolic']} mmHg"])
    if data.get("medications"):
        clinical_rows.append(["Medicamentos", ", ".join(data["medications"])])
    if data.get("allergies"):
        clinical_rows.append(["Alergias", ", ".join(data["allergies"])])
    if data.get("dietary_restrictions"):
        clinical_rows.append(["Restricciones dietéticas", ", ".join(data["dietary_restrictions"])])
    story.append(Paragraph("Antecedentes y condición clínica", heading_style))
    story.append(history_table(clinical_rows[0], clinical_rows[1:]))
    story.append(Spacer(1, 0.4 * cm))

    medical_profile = data.get("medical_profile")
    if medical_profile:
        mp_rows = [["Dato", "Valor"]]
        if medical_profile.get("goal"):
            mp_rows.append(["Objetivo", medical_profile["goal"]])
        if medical_profile.get("activity_level"):
            mp_rows.append(["Nivel de actividad", medical_profile["activity_level"]])
        if medical_profile.get("target_weight_kg"):
            mp_rows.append(["Peso meta", f"{medical_profile['target_weight_kg']} kg"])
        if medical_profile.get("daily_calories_goal"):
            mp_rows.append(
                ["Meta calórica diaria", f"{medical_profile['daily_calories_goal']} kcal"]
            )
        if medical_profile.get("medical_conditions"):
            mp_rows.append(
                ["Condiciones médicas", ", ".join(medical_profile["medical_conditions"])]
            )
        if len(mp_rows) > 1:
            story.append(Paragraph("Perfil médico", heading_style))
            story.append(history_table(mp_rows[0], mp_rows[1:]))
            story.append(Spacer(1, 0.4 * cm))

    measurement = data.get("latest_measurement")
    if measurement:
        m_rows = [["Medida", "Valor"]]
        if measurement.get("fat_percent") is not None:
            m_rows.append(["% Grasa corporal", f"{measurement['fat_percent']}%"])
        if measurement.get("muscle_mass_kg") is not None:
            m_rows.append(["Masa muscular", f"{measurement['muscle_mass_kg']} kg"])
        if measurement.get("circumference_waist_cm") is not None:
            m_rows.append(
                ["Circunferencia de cintura", f"{measurement['circumference_waist_cm']} cm"]
            )
        if measurement.get("circumference_hip_cm") is not None:
            m_rows.append(["Circunferencia de cadera", f"{measurement['circumference_hip_cm']} cm"])
        if len(m_rows) > 1:
            story.append(
                Paragraph(
                    f"Última evaluación antropométrica ({measurement['log_date']})", heading_style
                )
            )
            story.append(history_table(m_rows[0], m_rows[1:]))
            story.append(Spacer(1, 0.4 * cm))

    if data.get("clinical_notes"):
        story.append(Paragraph("Notas clínicas", heading_style))
        story.append(Paragraph(data["clinical_notes"], normal_style))
        story.append(Spacer(1, 0.4 * cm))

    if data.get("history_entries"):
        story.append(Paragraph("Historial clínico completo", heading_style))
        rows = [
            [entry.created_at.strftime("%d/%m/%Y"), entry.entry_type, entry.description]
            for entry in data["history_entries"]
        ]
        story.append(history_table(["Fecha", "Tipo", "Descripción"], rows))

    doc.build(story)
    return buffer.getvalue()
