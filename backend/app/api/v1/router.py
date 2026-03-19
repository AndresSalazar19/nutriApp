from fastapi import APIRouter
from app.api.v1.endpoints import users, catalog, nutritionist

router = APIRouter()
router.include_router(users.router)
router.include_router(catalog.router)
router.include_router(nutritionist.router)