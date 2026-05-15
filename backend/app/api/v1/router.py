from fastapi import APIRouter
from app.api.v1.endpoints import users, catalog, nutritionist, patients, content, appointment, weight_log, aliment

router = APIRouter()
router.include_router(users.router)
router.include_router(catalog.router)
router.include_router(nutritionist.router)
router.include_router(appointment.router)
router.include_router(patients.router)
router.include_router(content.router)
router.include_router(weight_log.router)
router.include_router(aliment.router)