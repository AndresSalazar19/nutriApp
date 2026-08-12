from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.consent import ConsentAcceptRequest
from app.services.consent_service import ConsentService

router = APIRouter(prefix="/consents", tags=["consents"])


@router.get("/me", response_model=None)
def get_my_consent_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    status_data = ConsentService.get_status(db, current_user)
    resp = success_response(data=status_data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/accept", response_model=None)
def accept_consent(
    payload: ConsentAcceptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        record = ConsentService.record_acceptance(db, current_user, payload.signature_name)
    except ValueError as exc:
        resp = error_response([str(exc)], status_code=422)
        return JSONResponse(status_code=422, content=resp.model_dump())

    resp = success_response(
        data={
            "consent_type": record.consent_type.value,
            "version": record.version,
            "accepted_at": record.accepted_at.isoformat(),
        }
    )
    return JSONResponse(status_code=201, content=resp.model_dump())
