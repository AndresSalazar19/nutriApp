from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.core.response import success_response
from app.db.base import get_db
from app.db.models.user import User
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=None)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    data = {
        "stats": AdminService.get_dashboard_stats(db),
        "activity": AdminService.get_recent_activity(db),
    }
    return JSONResponse(status_code=200, content=success_response(data=data).model_dump())
