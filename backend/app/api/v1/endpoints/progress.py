import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.progress import ProgressResponse
from app.services.progress_service import ProgressService, local_today

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/{user_id}", response_model=None)
def get_progress(
    user_id: uuid.UUID,
    period: Literal["day", "week", "month"] = Query("week"),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes consultar tu propio progreso")
    data = ProgressService.get_progress(db, user_id, period, end_date or local_today())
    serialized = ProgressResponse(**data).model_dump(mode="json")
    return JSONResponse(status_code=200, content=success_response(data=serialized).model_dump())
