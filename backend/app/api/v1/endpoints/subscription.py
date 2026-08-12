import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_nutritionist_or_admin
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionStatusUpdate,
)
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("", response_model=None)
def create_subscription(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = SubscriptionService.create(db, current_user.id, payload)
    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/me", response_model=None)
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = SubscriptionService.get_current(db, current_user.id)
    data = (
        SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
        if subscription
        else None
    )
    resp = success_response(data=data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.patch("/{subscription_id}/status", response_model=None)
def update_subscription_status(
    subscription_id: uuid.UUID,
    payload: SubscriptionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    subscription = SubscriptionService.update_status(db, subscription_id, payload.status)
    if not subscription:
        resp = error_response(["Suscripción no encontrada"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())
