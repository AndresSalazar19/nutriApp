from fastapi import APIRouter

from app.api.v1.endpoints import (
    alimentos_intercambio,
    appointment,
    assistant,
    blood_pressure_log,
    catalog,
    chats,
    content,
    educational_content,
    food_item,
    nutrition_plan,
    nutritionist,
    patient_nutritionist,
    patients,
    report,
    users,
    websocket,
    weight_log,
)

router = APIRouter()
router.include_router(users.router)
router.include_router(catalog.router)
router.include_router(nutritionist.router)
router.include_router(appointment.router)
router.include_router(patients.router)
router.include_router(nutrition_plan.router)
router.include_router(report.router)
router.include_router(content.router)
router.include_router(weight_log.router)
router.include_router(blood_pressure_log.router)
router.include_router(educational_content.router)
router.include_router(food_item.router)
router.include_router(alimentos_intercambio.router)
router.include_router(patient_nutritionist.router)
router.include_router(chats.router)
router.include_router(websocket.router)
router.include_router(assistant.router)
