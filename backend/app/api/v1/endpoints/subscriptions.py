import uuid

from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter(tags=["subscriptions"])


@router.post("/subscriptions", response_model=None)
def create_subscription_self(
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Integrado desde la versión singular: crea la suscripción para el
    usuario autenticado (sin necesidad de pasar user_id en la ruta)."""
    subscription = SubscriptionService.create(db, current_user.id, payload)
    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=201, content=resp.model_dump())


@router.get("/subscriptions/me", response_model=None)
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Integrado desde la versión singular: obtiene la suscripción del
    usuario autenticado vía /subscriptions/me."""
    subscription = SubscriptionService.get_current(db, current_user.id)
    data = (
        SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
        if subscription
        else None
    )
    resp = success_response(data=data)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.get("/users/{user_id}/subscription", response_model=None)
def get_subscription(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes consultar tu propia suscripción")

    subscription = SubscriptionService.get_current(db, user_id)
    if not subscription:
        resp = error_response(["El usuario no tiene una suscripción registrada"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/users/{user_id}/subscription", response_model=None)
def create_subscription(
    user_id: uuid.UUID,
    payload: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Solo puedes registrar tu propia suscripción")

    subscription = SubscriptionService.subscribe(db, user_id, payload.plan)
    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/subscriptions/{subscription_id}/cancel", response_model=None)
def cancel_subscription(
    subscription_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subscription = SubscriptionService.cancel(db, subscription_id)

    if not subscription:
        resp = error_response(["Suscripción no encontrada"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    if subscription.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tu propia suscripción")

    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.patch("/subscriptions/{subscription_id}/status", response_model=None)
def update_subscription_status(
    subscription_id: uuid.UUID,
    payload: SubscriptionStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_nutritionist_or_admin),
):
    """Rescatado de la versión de tu compañero: cambio de estado
    administrativo (nutricionista/admin), no para el paciente."""
    subscription = SubscriptionService.update_status(db, subscription_id, payload.status)
    if not subscription:
        resp = error_response(["Suscripción no encontrada"], status_code=404)
        return JSONResponse(status_code=404, content=resp.model_dump())

    resp = success_response(
        data=SubscriptionResponse.model_validate(subscription).model_dump(mode="json")
    )
    return JSONResponse(status_code=200, content=resp.model_dump())
