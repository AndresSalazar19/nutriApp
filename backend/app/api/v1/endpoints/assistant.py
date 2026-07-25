from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.db.base import get_db
from app.db.models.user import User
from app.schemas.conversations import MessageCreate, MessageResponse
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/messages")
def get_messages(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Obtiene el historial del chat con el asistente.
    """

    messages = AssistantService.get_messages(db=db, user=current_user)

    validated = [
        MessageResponse.model_validate(message).model_dump(mode="json") for message in messages
    ]

    resp = success_response(data=validated)
    return JSONResponse(status_code=200, content=resp.model_dump())


@router.post("/messages")
async def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Envía un mensaje al asistente virtual.
    """
    # TODO: Implementar verificación de suscripción premium para habilitar el prompt premium.
    premium = False

    assistant_message = await AssistantService.send_message(
        db=db, user=current_user, message=data.content, premium=premium
    )

    resp = success_response(
        data=MessageResponse.model_validate(assistant_message).model_dump(mode="json")
    )

    return JSONResponse(status_code=201, content=resp.model_dump())
