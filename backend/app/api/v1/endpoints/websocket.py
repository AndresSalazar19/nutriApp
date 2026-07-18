import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.base import SessionLocal
from app.db.models.message import MessageSenderRole
from app.db.models.user import UserRole
from app.schemas.conversations import MessageCreate
from app.services.conversations_service import ChatsService
from app.services.user_service import UserService
from app.services.websocket_manager import manager

router = APIRouter(prefix="/ws", tags=["websocket"])


def get_db_session():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.websocket("/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: uuid.UUID,
    token: str = Query(...),
):

    db: Session = SessionLocal()
    current_user = None

    try:
        payload = decode_access_token(token)

        if not payload:
            await websocket.close(code=1008, reason="Token inválido")
            return

        user_id = uuid.UUID(payload["sub"])
        current_user = UserService.get_by_id(db, user_id)

        if not current_user:
            await websocket.close(code=1008, reason="Usuario no encontrado")
            return

        conversation = ChatsService.get_conversation_by_id(db, conversation_id)

        if not conversation:
            await websocket.close(code=1008, reason="Conversación no encontrada")
            return

        if not ChatsService.validate_access(conversation, current_user.id):
            await websocket.close(code=1008, reason="No pertenece a la conversación")
            return

        await manager.connect(conversation_id, current_user.id, websocket)
        await manager.broadcast_except_sender(
            conversation_id,
            current_user.id,
            {"type": "user_connected", "user_id": str(current_user.id)},
        )

        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            if event_type == "message":

                role = (
                    MessageSenderRole.patient
                    if current_user.role == UserRole.patient
                    else MessageSenderRole.nutritionist
                )

                message = ChatsService.send_message(
                    db=db,
                    conversation_id=conversation_id,
                    sender_id=current_user.id,
                    sender_role=role,
                    data=MessageCreate(content=data["content"]),
                )

                await manager.broadcast(
                    conversation_id,
                    {
                        "type": "message",
                        "id": str(message.id),
                        "conversation_id": str(conversation_id),
                        "sender_id": str(message.sender_id),
                        "sender_role": (message.sender_role.value),
                        "content": message.content,
                        "sent_at": (message.sent_at.isoformat() if message.sent_at else None),
                    },
                )

            elif event_type == "typing":
                await manager.broadcast_except_sender(
                    conversation_id,
                    current_user.id,
                    {"type": "typing", "user_id": str(current_user.id)},
                )

            elif event_type == "stop_typing":
                await manager.broadcast_except_sender(
                    conversation_id,
                    current_user.id,
                    {"type": "stop_typing", "user_id": str(current_user.id)},
                )

            elif event_type == "read":
                ChatsService.mark_conversation_as_read(
                    db=db,
                    conversation_id=conversation_id,
                    user_id=current_user.id,
                )

                await manager.broadcast_except_sender(
                    conversation_id,
                    current_user.id,
                    {
                        "type": "read",
                        "conversation_id": str(conversation_id),
                        "read_by": str(current_user.id),
                    },
                )

    except WebSocketDisconnect:

        if current_user:
            manager.disconnect(conversation_id, current_user.id)

            await manager.broadcast_except_sender(
                conversation_id,
                current_user.id,
                {"type": "user_disconnected", "user_id": str(current_user.id)},
            )

    except Exception as e:

        print("WebSocket error:", e)

    finally:

        db.close()
