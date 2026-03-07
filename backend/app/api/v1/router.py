from fastapi import APIRouter
from app.api.v1.endpoints import users, catalog

router = APIRouter()
router.include_router(users.router)
router.include_router(catalog.router)