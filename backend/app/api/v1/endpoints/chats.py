import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.response import error_response, success_response
from app.db.base import get_db
from app.db.models.message import MessageSenderRole
from app.db.models.user import User, UserRole
from app.schemas.conversations import (
    ConversationCreate,
    ConversationListResponse,
    ConversationMessagesResponse,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.services.conversations_service import ChatsService
from app.services.websocket_manager import manager

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("/")
def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.patient:
        patient_id = current_user.id
        nutritionist_id = data.participant_id

    elif current_user.role == UserRole.nutritionist:
        patient_id = data.participant_id
        nutritionist_id = current_user.id

    else:

        resp = error_response(
            ["Rol no permitido para crear conversaciones"],
            status_code=403,
        )

        return JSONResponse(
            status_code=403,
            content=resp.model_dump(),
        )

    conversation = ChatsService.create_or_get_conversation(
        db=db,
        patient_id=patient_id,
        nutritionist_id=nutritionist_id,
    )

    resp = success_response(
        data=ConversationResponse.model_validate(conversation).model_dump(mode="json")
    )

    return JSONResponse(
        status_code=201,
        content=resp.model_dump(),
    )


@router.get("/")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversations = ChatsService.get_conversations(
        db,
        current_user.id,
    )

    validated = [
        ConversationListResponse.model_validate(c).model_dump(mode="json") for c in conversations
    ]

    resp = success_response(data=validated)
    return JSONResponse(
        status_code=200,
        content=resp.model_dump(),
    )


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversation = ChatsService.get_conversation_by_id(
        db,
        conversation_id,
    )

    if not conversation:
        resp = error_response(
            ["Conversación no encontrada"],
            status_code=404,
        )

        return JSONResponse(
            status_code=404,
            content=resp.model_dump(),
        )

    if not ChatsService.validate_access(
        conversation,
        current_user.id,
    ):
        resp = error_response(
            ["No tiene permisos para acceder a esta conversación"],
            status_code=403,
        )
        return JSONResponse(
            status_code=403,
            content=resp.model_dump(),
        )

    messages = ChatsService.get_messages(db, conversation_id)
    ChatsService.mark_conversation_as_read(
        db,
        conversation_id,
        current_user.id,
    )

    validated = [
        MessageResponse.model_validate(message).model_dump(mode="json") for message in messages
    ]

    resp = success_response(
        data=ConversationMessagesResponse(
            conversation_id=conversation_id,
            messages=validated,
        ).model_dump(mode="json")
    )

    return JSONResponse(
        status_code=200,
        content=resp.model_dump(),
    )


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: uuid.UUID,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = ChatsService.get_conversation_by_id(
        db=db,
        conversation_id=conversation_id,
    )

    if not conversation:
        resp = error_response(
            ["Conversación no encontrada"],
            status_code=404,
        )

        return JSONResponse(
            status_code=404,
            content=resp.model_dump(),
        )

    if not ChatsService.validate_access(
        conversation,
        current_user.id,
    ):
        resp = error_response(
            ["No tiene permisos para enviar mensajes en esta conversación"],
            status_code=403,
        )
        return JSONResponse(
            status_code=403,
            content=resp.model_dump(),
        )

    if current_user.role == UserRole.patient:
        sender_role = MessageSenderRole.patient

    elif current_user.role == UserRole.nutritionist:
        sender_role = MessageSenderRole.nutritionist

    else:
        resp = error_response(
            ["Rol no permitido para utilizar el chat"],
            status_code=403,
        )

        return JSONResponse(
            status_code=403,
            content=resp.model_dump(),
        )

    message = ChatsService.send_message(
        db=db,
        conversation_id=conversation_id,
        sender_id=current_user.id,
        sender_role=sender_role,
        data=data,
    )

    await manager.broadcast(
        conversation_id,
        {
            "type": "message",
            "id": str(message.id),
            "conversation_id": str(conversation_id),
            "sender_id": str(message.sender_id),
            "sender_role": message.sender_role.value,
            "content": message.content,
            "sent_at": message.sent_at.isoformat() if message.sent_at else None,
        },
    )

    resp = success_response(data=MessageResponse.model_validate(message).model_dump(mode="json"))

    return JSONResponse(
        status_code=201,
        content=resp.model_dump(),
    )
