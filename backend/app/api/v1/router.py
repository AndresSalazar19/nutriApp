from fastapi import APIRouter
from app.api.v1.endpoints import users, catalog, nutritionist, educational_content, appointment

router = APIRouter()
router.include_router(users.router)
router.include_router(catalog.router)
router.include_router(nutritionist.router)
router.include_router(educational_content.router)
router.include_router(appointment.router)